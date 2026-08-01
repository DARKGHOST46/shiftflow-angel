import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_evacuation_entries",
  title: "List evacuation queue",
  description:
    "List the nurses queued in one of the signed-in user's evacuation lists, in turn order.",
  inputSchema: {
    list_id: z.string().uuid().describe("The evacuation list ID from list_evacuation_lists."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ list_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("evacuation_entries")
      .select("id, nurse_name, place, turn_order, last_edited_at, last_edited_by_name")
      .eq("list_id", list_id)
      .order("turn_order", { ascending: true });
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
