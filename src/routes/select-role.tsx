import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { ALL_ROLES, ROLE_LABEL, ROLE_HOME, WILAYAS, type AppRole } from "@/lib/roles";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill, Briefcase, Heart, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/select-role")({
  component: SelectRolePage,
});

const ICONS: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  doctor: Stethoscope, nurse: Heart, pharmacist: Pill, management: Briefcase, admin: Shield,
};

function SelectRolePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, refresh } = useProfile();
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [wilaya, setWilaya] = useState<number | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<{ id: string; name: string; city: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (wilaya == null) { setHospitals([]); return; }
    supabase.from("hospitals").select("id,name,city").eq("wilaya_code", wilaya).order("name")
      .then(({ data }) => setHospitals((data ?? []) as { id: string; name: string; city: string }[]));
  }, [wilaya]);

  const choices = useMemo(() => ALL_ROLES.filter((r) => r !== "admin"), []);

  async function submit() {
    if (!user || !role || !wilaya || !hospitalId) return;
    setSaving(true);
    const { error: pe } = await supabase.from("profiles").update({
      wilaya_code: wilaya, hospital_id: hospitalId, role_selected: true,
    }).eq("id", user.id);
    if (pe) { toast.error(pe.message); setSaving(false); return; }
    const { error: re } = await supabase.from("user_roles").insert({ user_id: user.id, role });
    if (re && !re.message.includes("duplicate")) { toast.error(re.message); setSaving(false); return; }
    await refresh();
    toast.success("Profile saved");
    navigate({ to: ROLE_HOME[role] });
  }

  if (authLoading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen px-5 py-8 max-w-xl mx-auto space-y-6">
      <header className="text-center space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Welcome</div>
        <h1 className="text-2xl font-semibold text-gradient">Set up your profile</h1>
        <p className="text-sm text-muted-foreground">Algerian Hospital System · {profile?.email}</p>
      </header>

      <GlassCard>
        <div className="text-sm font-semibold mb-3">Your role</div>
        <div className="grid grid-cols-2 gap-2">
          {choices.map((r) => {
            const Icon = ICONS[r];
            const active = role === r;
            return (
              <button key={r} onClick={() => setRole(r)}
                className={`p-3 rounded-xl border text-left transition ${active ? "border-primary bg-primary/10 glow" : "border-white/10 hover:border-white/30"}`}>
                <Icon className="size-5 text-primary mb-1.5" />
                <div className="font-medium text-sm">{ROLE_LABEL[r].en}</div>
                <div className="text-[10px] text-muted-foreground">{ROLE_LABEL[r].ar} · {ROLE_LABEL[r].fr}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold mb-3">Your wilaya</div>
        <select value={wilaya ?? ""} onChange={(e) => { setWilaya(e.target.value ? +e.target.value : null); setHospitalId(null); }}
          className="w-full glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="" className="bg-slate-900">— Choose wilaya —</option>
          {WILAYAS.map((w) => <option key={w.code} value={w.code} className="bg-slate-900">{String(w.code).padStart(2,"0")} · {w.name} ({w.ar})</option>)}
        </select>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold mb-3">Your hospital</div>
        <select value={hospitalId ?? ""} onChange={(e) => setHospitalId(e.target.value || null)} disabled={!wilaya}
          className="w-full glass rounded-xl px-3 py-2 text-sm bg-transparent disabled:opacity-50">
          <option value="" className="bg-slate-900">{wilaya ? (hospitals.length ? "— Choose hospital —" : "No hospitals seeded in this wilaya yet") : "Pick a wilaya first"}</option>
          {hospitals.map((h) => <option key={h.id} value={h.id} className="bg-slate-900">{h.name} — {h.city}</option>)}
        </select>
        {wilaya && hospitals.length === 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">Ask the admin to add your facility, or pick a nearby wilaya.</p>
        )}
      </GlassCard>

      <Button onClick={submit} disabled={!role || !wilaya || !hospitalId || saving} className="w-full h-12">
        {saving ? <Loader2 className="animate-spin size-4 me-2" /> : null}
        Continue
      </Button>
    </div>
  );
}
