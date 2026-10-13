import { toolRegistry } from "./tool.registry";
import { searchContactsTool } from "./contacts/search-contacts.tool";
import { createNoteTool } from "./create-note.tool";
import { createTaskTool } from "./create-task.tool";
import { searchLeadsTool } from "./leads/search-leads.tool";
import { searchDealsTool } from "./deals/search-deals.tool";
import { searchCustomersTool } from "./customers/search-customers.tool";

toolRegistry.register(searchContactsTool);
toolRegistry.register(createNoteTool);
toolRegistry.register(createTaskTool);
toolRegistry.register(searchLeadsTool);
toolRegistry.register(searchDealsTool);
toolRegistry.register(searchCustomersTool);

export { toolRegistry };