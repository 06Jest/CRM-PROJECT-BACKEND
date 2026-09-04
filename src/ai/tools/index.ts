import { toolRegistry } from "./tool.registry";
import { searchContactsTool } from "./search-contacts.tool";
import { createNoteTool } from "./create-note.tool";

toolRegistry.register(searchContactsTool);
toolRegistry.register(createNoteTool);

export { toolRegistry };