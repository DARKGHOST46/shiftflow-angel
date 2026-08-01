import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_announcements",
  title: "List hospital announcements",
  description:
    "List announcements visible to the signed-in user, newest first, scoped to their hospital and role by access policy.",
  inputSchema: {
    limit: z.number().int().optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("announcements")
      .select("id, title, body, target_roles, hospital_id, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
