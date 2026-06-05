import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/profile-context";
import { ROLE_LABEL } from "@/lib/roles";
import { Hospital, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-context";

export function HospitalHeader() {
  const { profile, primaryRole } = useProfile();
  const [hospName, setHospName] = useState<string>("");
  useEffect(() => {
    if (!profile?.hospital_id) return;
    supabase.from("hospitals").select("name,city").eq("id", profile.hospital_id).maybeSingle()
      .then(({ data }) => { if (data) setHospName(`${data.name} · ${data.city}`); });
  }, [profile?.hospital_id]);
  if (!profile) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 min-w-0">
        <Hospital className="size-3.5 text-primary shrink-0" />
        <span className="truncate">{hospName || "—"}</span>
        {primaryRole && <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold text-[10px] uppercase">{ROLE_LABEL[primaryRole].en}</span>}
      </div>
      <button onClick={() => signOut()} className="opacity-70 hover:opacity-100"><LogOut className="size-3.5" /></button>
    </div>
  );
}
