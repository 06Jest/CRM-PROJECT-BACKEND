import { createSupabaseUserClient } from "../../../config/supabase";
import type { RagDocument } from "../types/rag.types";
import type { RagDocumentLoader } from "./document-loader.interface";

interface NoteRecord {
  id: string;
  title: string;
  content: string;
  org_id: string;
  author_id: string;
  target_type:
    | "lead"
    | "contact"
    | "deal"
    | "customer"
    | "personal";
  target_id: string | null;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface NotesDocumentLoaderOptions {
  orgId: string;
  memberId: string;
  accessToken: string;
}

export class NotesDocumentLoader implements RagDocumentLoader {
  constructor(
    private readonly options: NotesDocumentLoaderOptions
  ) {}

  async load(): Promise<RagDocument[]> {
    const {
      orgId,
      memberId,
      accessToken,
    } = this.options;

    const db = createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from("notes")
      .select(
        `
          id,
          title,
          content,
          org_id,
          author_id,
          target_type,
          target_id,
          visibility,
          created_at,
          updated_at,
          deleted_at
        `
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .or(
        `visibility.eq.public,and(visibility.eq.private,author_id.eq.${memberId})`
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to load notes for RAG: ${error.message}`
      );
    }

    const notes = (data ?? []) as NoteRecord[];

    return notes.map((note) => this.toRagDocument(note));
  }

  private toRagDocument(note: NoteRecord): RagDocument {
    const targetDescription = note.target_id
      ? `${note.target_type} (${note.target_id})`
      : note.target_type;

    const content = [
      `Note title: ${note.title}`,
      `Note type: ${targetDescription}`,
      `Note visibility: ${note.visibility}`,
      "Note content:",
      note.content,
    ].join("\n");

    return {
      content,
      metadata: {
        sourceId: note.id,
        sourceType: "note",
        scopeType: "organization",
        organizationId: note.org_id,
        title: note.title,
      },
    };
  }
}