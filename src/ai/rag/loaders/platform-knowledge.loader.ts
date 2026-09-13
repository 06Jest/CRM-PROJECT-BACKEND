import { promises as fs } from "node:fs";
import path from "node:path";

import type { RagDocument } from "../types/rag.types";
import type { RagDocumentLoader } from "./document-loader.interface";

export class PlatformKnowledgeLoader implements RagDocumentLoader {
  constructor(private readonly directoryPath: string) {}

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

      documents.push({
        content,
        metadata: {
          sourceId:
            fileName.toLowerCase() === "unithread"
              ? "about-unithread"
              : `platform-${fileName}`,
          sourceType: "knowledge",
          scopeType: "platform",
          title: fileName,
        },
      });
    }

    return documents;
  }
}