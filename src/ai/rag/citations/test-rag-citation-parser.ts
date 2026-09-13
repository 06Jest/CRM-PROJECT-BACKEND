import {
  ragCitationParserService,
} from "./rag-citation-parser.service";

const sources = [
  {
    sourceId: "source-a",
    sourceType: "note",
    title: "Brightline requirements",
    chunkIndex: 0,
    similarity: 0.78,
  },
  {
    sourceId: "source-b",
    sourceType: "note",
    title: "Communication notes",
    chunkIndex: 1,
    similarity: 0.75,
  },
];

const responseText = `
Brightline needs lead tracking. [Source 1]

They also need team messaging. [Source 2] [Source 1]

This is an invalid citation. [Source 99]
`;

const citations = ragCitationParserService.parse(
  responseText,
  sources
);

console.dir(citations, { depth: null });