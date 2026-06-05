import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { Loader2 } from "lucide-react";
import { ROLE_HOME, type AppRole } from "@/lib/roles";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, roles, primaryRole, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!profile?.role_selected) { navigate({ to: "/select-role" }); return; }
    const ok = roles.some((r) => allow.includes(r)) || roles.includes("admin");
    if (!ok && primaryRole) navigate({ to: ROLE_HOME[primaryRole] });
  }, [authLoading, loading, user, profile, roles, primaryRole, allow, navigate]);

  if (authLoading || loading || !user || !profile?.role_selected) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
  }
  const ok = roles.some((r) => allow.includes(r)) || roles.includes("admin");
  if (!ok) return null;
  return <>{children}</>;
}
