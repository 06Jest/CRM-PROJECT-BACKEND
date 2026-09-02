export interface AITool {
  id: string;
  name: string;
  description: string;
  execute(
    input: unknown,
    context: {
      profileId: string;
      orgId: string;
      role: string;
    }
  ): Promise<unknown>;
}