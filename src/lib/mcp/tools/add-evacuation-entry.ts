import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "add_evacuation_entry",
  title: "Add nurse to evacuation queue",
  description:
    "Append a nurse to the end of one of the signed-in user's evacuation lists.",
  inputSchema: {
    list_id: z.string().uuid().describe("The evacuation list ID from list_evacuation_lists."),
    nurse_name: z.string().trim().min(1).describe("Name of the nurse to add."),
    place: z.string().trim().optional().describe("Optional place or note for this turn."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ list_id, nurse_name, place }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);

    const { data: last } = await supabase
      .from("evacuation_entries")
      .select("turn_order")
      .eq("list_id", list_id)
      .order("turn_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("evacuation_entries")
      .insert({
        list_id,
        nurse_name,
        place: place ?? null,
        turn_order: (last?.turn_order ?? -1) + 1,
        owner_id: ctx.getUserId()!,
      })
      .select("id, nurse_name, place, turn_order")
      .single();

    if (error) return errorResult(error.message);
    return textResult(data);
  },
});
