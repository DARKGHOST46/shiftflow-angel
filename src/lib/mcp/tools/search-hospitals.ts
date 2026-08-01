import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "search_hospitals",
  title: "Search Algerian hospitals",
  description:
    "Search the Algerian hospital directory by name, city, wilaya code, or facility type.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free-text match on hospital name or city."),
    wilaya_code: z.number().int().optional().describe("Algerian wilaya code, e.g. 31 for Oran."),
    type: z.string().trim().optional().describe("Facility type filter, e.g. CHU, EPH, clinic."),
    limit: z.number().int().optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, wilaya_code, type, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx)
      .from("hospitals")
      .select("id, name, name_ar, name_fr, type, city, wilaya_code, wilaya_name, address, phone, lat, lng")
      .order("name", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));

    if (query) q = q.or(`name.ilike.%${query}%,city.ilike.%${query}%`);
    if (typeof wilaya_code === "number") q = q.eq("wilaya_code", wilaya_code);
    if (type) q = q.eq("type", type);

    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
