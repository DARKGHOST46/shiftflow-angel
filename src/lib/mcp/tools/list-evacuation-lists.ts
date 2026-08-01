import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_evacuation_lists",
  title: "List evacuation lists",
  description:
    "List the signed-in user's evacuation rosters (name, destination such as Oran or Aïn Témouchent) with the number of nurses queued in each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);

    const { data: lists, error } = await supabase
      .from("evacuation_lists")
      .select("id, name, destination, created_at, updated_at")
      .order("created_at", { ascending: true });
    if (error) return errorResult(error.message);

    const { data: entries } = await supabase.from("evacuation_entries").select("list_id");
    const counts = new Map<string, number>();
    for (const e of entries ?? []) counts.set(e.list_id, (counts.get(e.list_id) ?? 0) + 1);

    return textResult(
      (lists ?? []).map((l) => ({ ...l, entry_count: counts.get(l.id) ?? 0 })),
    );
  },
});
