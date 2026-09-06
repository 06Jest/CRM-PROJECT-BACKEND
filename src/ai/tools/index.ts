import { toolRegistry } from "./tool.registry";
import { searchContactsTool } from "./search-contacts.tool";
import { createNoteTool } from "./create-note.tool";
import { createTaskTool } from "./create-task.tool";

toolRegistry.register(searchContactsTool);
toolRegistry.register(createNoteTool);
toolRegistry.register(createTaskTool);

export { toolRegistry };