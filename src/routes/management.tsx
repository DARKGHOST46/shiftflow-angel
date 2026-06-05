import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { GlassCard } from "@/components/glass-card";
import { HospitalHeader } from "@/components/hospital-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";
import { Megaphone, Users, BarChart3, Plus, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/management")({
  component: () => (
    <RoleGuard allow={["management"]}>
      <ManagementDashboard />
    </RoleGuard>
  ),
});

type Staff = { id: string; display_name: string | null; email: string | null; phone: string | null; roles: string[] };
type Ann = { id: string; title: string; body: string; target_roles: string[]; created_at: string };

function ManagementDashboard() {
  const { user } = useAuth(); const { profile } = useProfile();
  const [tab, setTab] = useState<"kpi" | "staff" | "ann">("kpi");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [ann, setAnn] = useState<Ann[]>([]);
  const [kpis, setKpis] = useState({ patients: 0, consultations: 0, prescriptions: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    if (!profile?.hospital_id) { setLoading(false); return; }
    const [{ data: ps }, { data: rs }, { data: as }, { count: pCount }, { count: cCount }, { count: rxCount }, { data: stk }] = await Promise.all([
      supabase.from("profiles").select("id,display_name,email,phone").eq("hospital_id", profile.hospital_id),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("consultations").select("*", { count: "exact", head: true }),
      supabase.from("prescriptions").select("*", { count: "exact", head: true }),
      supabase.from("pharmacy_stock").select("qty,min_threshold"),
    ]);
    const rolesByUser = new Map<string, string[]>();
    ((rs ?? []) as { user_id: string; role: string }[]).forEach((r) => {
      rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
    });
    setStaff(((ps ?? []) as Omit<Staff, "roles">[]).map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] })));
    setAnn((as ?? []) as Ann[]);
    setKpis({
      patients: pCount ?? 0,
      consultations: cCount ?? 0,
      prescriptions: rxCount ?? 0,
      low: ((stk ?? []) as { qty: number; min_threshold: number }[]).filter((s) => s.qty <= s.min_threshold).length,
    });
    setLoading(false);
  }
  useEffect(() => { load(); }, [profile?.hospital_id]);

  async function exportCSV() {
    const { data } = await supabase.from("consultations").select("*").order("visit_date", { ascending: false });
    const rows = (data ?? []) as { visit_date: string; complaint: string; diagnosis: string; plan: string }[];
    const csv = ["date,complaint,diagnosis,plan", ...rows.map((r) => `${r.visit_date},"${(r.complaint ?? "").replace(/"/g, '""')}","${(r.diagnosis ?? "").replace(/"/g, '""')}","${(r.plan ?? "").replace(/"/g, '""')}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "consultations.csv"; a.click();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-32 space-y-4">
      <HospitalHeader />
      <header>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Management workspace</div>
        <h1 className="text-2xl font-semibold text-gradient">Hospital Operations</h1>
      </header>

      <div className="flex gap-1 glass rounded-full p-1">
        {(["kpi", "staff", "ann"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t === "ann" ? "News" : t}</button>
        ))}
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-primary" /></div> : (
        <>
          {tab === "kpi" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Staff", v: staff.length, i: Users },
                  { label: "Patients", v: kpis.patients, i: BarChart3 },
                  { label: "Consultations", v: kpis.consultations, i: BarChart3 },
                  { label: "Prescriptions", v: kpis.prescriptions, i: BarChart3 },
                ].map((k) => (
                  <GlassCard key={k.label}><div className="flex items-center gap-2"><k.i className="size-4 text-primary" /><div><div className="text-2xl font-bold text-gradient">{k.v}</div><div className="text-[10px] uppercase text-muted-foreground">{k.label}</div></div></div></GlassCard>
                ))}
              </div>
              {kpis.low > 0 && <GlassCard className="border-amber-500/40"><div className="text-sm">⚠ {kpis.low} pharmacy items below threshold</div></GlassCard>}
              <Button onClick={exportCSV} variant="outline" className="w-full"><Download className="size-4 me-2" />Export consultations CSV</Button>
            </div>
          )}
          {tab === "staff" && (
            <div className="space-y-2">
              {staff.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No staff yet</p>}
              {staff.map((s) => (
                <GlassCard key={s.id}>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/20 grid place-items-center text-sm font-semibold">{(s.display_name ?? s.email ?? "?")[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{s.display_name ?? s.email}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{s.email}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {s.roles.map((r) => <span key={r} className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">{r}</span>)}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          {tab === "ann" && (
            <>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button className="w-full"><Plus className="size-4 me-1" />New announcement</Button></DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10"><DialogHeader><DialogTitle>Announcement</DialogTitle></DialogHeader>
                  <AnnForm hospitalId={profile?.hospital_id ?? ""} userId={user?.id ?? ""} onDone={() => { setOpen(false); load(); }} />
                </DialogContent>
              </Dialog>
              <div className="space-y-2">
                {ann.map((a) => (
                  <GlassCard key={a.id}>
                    <div className="flex items-start gap-2"><Megaphone className="size-4 text-primary mt-1" />
                      <div className="flex-1"><div className="font-semibold">{a.title}</div><div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()} · {a.target_roles.join(", ")}</div><div className="text-sm mt-1 whitespace-pre-wrap">{a.body}</div></div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function AnnForm({ hospitalId, userId, onDone }: { hospitalId: string; userId: string; onDone: () => void }) {
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const [targets, setTargets] = useState<string[]>(["doctor", "nurse", "pharmacist", "management"]);
  const [saving, setSaving] = useState(false);
  function toggle(r: string) { setTargets(targets.includes(r) ? targets.filter((x) => x !== r) : [...targets, r]); }
  async function save() {
    if (!title || !body) return;
    setSaving(true);
    const { error } = await supabase.from("announcements").insert({ hospital_id: hospitalId, author_id: userId, title, body, target_roles: targets });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Posted"); onDone();
  }
  return (
    <div className="space-y-2">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
      <div className="flex flex-wrap gap-1.5">
        {["doctor", "nurse", "pharmacist", "management"].map((r) => (
          <button key={r} onClick={() => toggle(r)} className={`px-2 py-1 rounded text-[11px] uppercase ${targets.includes(r) ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{r}</button>
        ))}
      </div>
      <Button onClick={save} disabled={saving || !title || !body} className="w-full">{saving && <Loader2 className="size-4 animate-spin me-2" />}Post</Button>
    </div>
  );
}
