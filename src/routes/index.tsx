import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { ROLE_HOME } from "@/lib/roles";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeRouter,
});

function HomeRouter() {
  const { user, loading: aL } = useAuth();
  const { profile, primaryRole, loading: pL } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (aL || pL) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!profile?.role_selected || !primaryRole) { navigate({ to: "/select-role" }); return; }
    navigate({ to: ROLE_HOME[primaryRole] });
  }, [aL, pL, user, profile, primaryRole, navigate]);

  return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
}
