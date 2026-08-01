import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string | null; redirect_uri?: string | null };
type AuthorizationDetails = {
  client?: OAuthClient | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase session lives in localStorage.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Authorization unavailable</h1>
        <p className="text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "This application";

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (err) {
      setBusy(null);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-[2rem] p-8 w-full max-w-md"
      >
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center glow mb-5">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect {clientName} to ShiftFlow
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {clientName} will be able to use ShiftFlow tools as you — reading your profile,
          evacuation lists, hospital directory, announcements and marketplace listings.
        </p>

        {details?.client?.redirect_uri && (
          <p className="text-[11px] text-muted-foreground mt-3 break-all">
            Redirects to {details.client.redirect_uri}
          </p>
        )}
        {details?.scope && (
          <p className="text-[11px] text-muted-foreground mt-1">Requested: {details.scope}</p>
        )}

        <p className="text-[11px] text-muted-foreground mt-4">
          This does not bypass ShiftFlow's permissions or database policies.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            disabled={busy !== null}
            onClick={() => decide(true)}
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy === "approve" && <Loader2 className="size-4 animate-spin" />}
            Approve
          </button>
          <button
            disabled={busy !== null}
            onClick={() => decide(false)}
            className="flex-1 h-12 rounded-2xl border border-border font-medium disabled:opacity-50"
          >
            Cancel connection
          </button>
        </div>
      </motion.div>
    </main>
  );
}
