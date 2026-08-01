import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_marketplace_listings",
  title: "List marketplace listings",
  description:
    "List ShiftFlow marketplace listings (medical equipment and nursing supplies) with title, price in DZD, category and condition.",
  inputSchema: {
    category: z.string().trim().optional().describe("Filter by listing category."),
    limit: z.number().int().optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx)
      .from("marketplace_listings")
      .select("id, title, description, category, condition, price_dzd, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (category) q = q.eq("category", category);

    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
