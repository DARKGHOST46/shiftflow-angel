import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { AppRole } from "@/lib/roles";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  wilaya_code: number | null;
  hospital_id: string | null;
  role_selected: boolean;
  phone: string | null;
};

type Ctx = {
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const C = createContext<Ctx>({ profile: null, roles: [], primaryRole: null, loading: true, refresh: async () => {} });

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    setProfile(p as Profile | null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const primaryRole: AppRole | null =
    roles.includes("admin") ? "admin"
    : roles[0] ?? null;

  return <C.Provider value={{ profile, roles, primaryRole, loading, refresh }}>{children}</C.Provider>;
}

export function useProfile() {
  return useContext(C);
}
