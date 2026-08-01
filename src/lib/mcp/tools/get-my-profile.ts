import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description:
    "Return the signed-in ShiftFlow user's profile (display name, email, hospital, wilaya) and their assigned roles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId()!;

    const [{ data: profile, error }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, email, phone, hospital_id, wilaya_code, role_selected")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (error) return errorResult(error.message);

    let hospital: { id: string; name: string; city: string; wilaya_name: string } | null = null;
    if (profile?.hospital_id) {
      const { data } = await supabase
        .from("hospitals")
        .select("id, name, city, wilaya_name")
        .eq("id", profile.hospital_id)
        .maybeSingle();
      hospital = data ?? null;
    }

    return textResult({
      profile: profile ?? null,
      roles: (roles ?? []).map((r) => r.role),
      hospital,
    });
  },
});
