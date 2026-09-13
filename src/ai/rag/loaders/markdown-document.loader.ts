import { promises as fs } from "node:fs";
import path from "node:path";

import type { RagDocument } from "../types/rag.types";
import type { RagDocumentLoader } from "./document-loader.interface";

export interface MarkdownDirectoryLoaderOptions {
  sourceType: string;
  scopeType: RagDocument["metadata"]["scopeType"];
  organizationId?: string;
  profileId?: string;
  sourceIdPrefix?: string;
}

export class MarkdownDirectoryLoader implements RagDocumentLoader {
  constructor(
    private readonly directoryPath: string,
    private readonly options: MarkdownDirectoryLoaderOptions
  ) {
    if (options.scopeType === "profile" && !options.profileId) {
      throw new Error(
        "profileId is required for profile-scoped ingestion."
      );
    }

    if (
      options.scopeType === "organization" &&
      !options.organizationId
    ) {
      throw new Error(
        "organizationId is required for organization-scoped ingestion."
      );
    }

    if (
      options.scopeType === "platform" &&
      (options.profileId || options.organizationId)
    ) {
      throw new Error(
        "Platform-scoped ingestion cannot include organizationId or profileId."
      );
    }
  }

  async load(): Promise<RagDocument[]> {
    const entries = await fs.readdir(this.directoryPath, {
      withFileTypes: true,
    });

    const markdownFiles = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          path.extname(entry.name).toLowerCase() === ".md"
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const documents: RagDocument[] = [];

    for (const file of markdownFiles) {
      const filePath = path.join(this.directoryPath, file.name);
      const content = await fs.readFile(filePath, "utf8");

      if (!content.trim()) {
        console.warn(`Skipping empty knowledge file: ${filePath}`);
        continue;
      }

      const fileName = path.basename(file.name, ".md");
      const normalizedName = fileName.toLowerCase();

      const sourceId = [
        this.options.sourceIdPrefix ?? this.options.scopeType,
        normalizedName,
      ].join("-");

      documents.push({
        content,
        metadata: {
          sourceId,
          sourceType: this.options.sourceType,
          scopeType: this.options.scopeType,
          ...(this.options.organizationId
            ? { organizationId: this.options.organizationId }
            : {}),
          ...(this.options.profileId
            ? { profileId: this.options.profileId }
            : {}),
          title: fileName,
        },
      });
    }

    return documents;
  }
}