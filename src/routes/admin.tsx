import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { GlassCard } from "@/components/glass-card";
import { HospitalHeader } from "@/components/hospital-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ROLES, WILAYAS, type AppRole } from "@/lib/roles";
import { Shield, Hospital, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleGuard allow={["admin"]}>
      <AdminDashboard />
    </RoleGuard>
  ),
});

type User = { id: string; email: string | null; display_name: string | null; roles: AppRole[]; hospital_id: string | null };
type H = { id: string; name: string; wilaya_code: number; wilaya_name: string; city: string; type: string; lat: number; lng: number };

function AdminDashboard() {
  const [tab, setTab] = useState<"users" | "hospitals">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [hosp, setHosp] = useState<H[]>([]);
  const [loading, setLoading] = useState(true);
  const [openH, setOpenH] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: ps }, { data: rs }, { data: hs }] = await Promise.all([
      supabase.from("profiles").select("id,email,display_name,hospital_id"),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("hospitals").select("*").order("wilaya_code"),
    ]);
    const byU = new Map<string, AppRole[]>();
    ((rs ?? []) as { user_id: string; role: AppRole }[]).forEach((r) => byU.set(r.user_id, [...(byU.get(r.user_id) ?? []), r.role]));
    setUsers(((ps ?? []) as Omit<User, "roles">[]).map((p) => ({ ...p, roles: byU.get(p.id) ?? [] })));
    setHosp((hs ?? []) as H[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleRole(uid: string, role: AppRole, has: boolean) {
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) return toast.error(error.message);
    }
    load();
  }

  async function delHosp(id: string) {
    if (!confirm("Delete hospital?")) return;
    const { error } = await supabase.from("hospitals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-32 space-y-4">
      <HospitalHeader />
      <header className="flex items-center gap-2">
        <Shield className="size-5 text-primary" />
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Admin</div>
          <h1 className="text-2xl font-semibold text-gradient">System administration</h1>
        </div>
      </header>

      <div className="flex gap-1 glass rounded-full p-1">
        {(["users", "hospitals"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-primary" /></div> : (
        <>
          {tab === "users" && (
            <div className="space-y-2">
              {users.map((u) => (
                <GlassCard key={u.id}>
                  <div className="font-semibold text-sm">{u.display_name ?? u.email}</div>
                  <div className="text-[11px] text-muted-foreground mb-2">{u.email}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button key={r} onClick={() => toggleRole(u.id, r, has)}
                          className={`px-2 py-1 rounded text-[10px] uppercase font-semibold ${has ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          {tab === "hospitals" && (
            <>
              <Dialog open={openH} onOpenChange={setOpenH}>
                <DialogTrigger asChild><Button className="w-full"><Plus className="size-4 me-1" />Add hospital</Button></DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10"><DialogHeader><DialogTitle>New hospital</DialogTitle></DialogHeader>
                  <HospForm onDone={() => { setOpenH(false); load(); }} />
                </DialogContent>
              </Dialog>
              <div className="space-y-2">
                {hosp.map((h) => (
                  <GlassCard key={h.id}>
                    <div className="flex items-center gap-3">
                      <Hospital className="size-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{h.name}</div>
                        <div className="text-[11px] text-muted-foreground">{h.city} · {h.wilaya_name} ({String(h.wilaya_code).padStart(2, "0")}) · {h.type.toUpperCase()}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => delHosp(h.id)}><Trash2 className="size-4 text-rose-400" /></Button>
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

function HospForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: "", wilaya_code: 16, city: "", type: "eph", lat: "36.75", lng: "3.05", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.name || !f.city) return;
    setSaving(true);
    const w = WILAYAS.find((x) => x.code === f.wilaya_code);
    const { error } = await supabase.from("hospitals").insert({
      name: f.name, wilaya_code: f.wilaya_code, wilaya_name: w?.name ?? "", city: f.city, type: f.type,
      lat: Number(f.lat), lng: Number(f.lng), phone: f.phone || null, address: f.address || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Added"); onDone();
  }
  return (
    <div className="space-y-2">
      <Input placeholder="Name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded-md bg-transparent glass px-3 py-2 text-sm" value={f.wilaya_code} onChange={(e) => setF({ ...f, wilaya_code: +e.target.value })}>
          {WILAYAS.map((w) => <option key={w.code} value={w.code} className="bg-slate-900">{String(w.code).padStart(2,"0")} {w.name}</option>)}
        </select>
        <Input placeholder="City *" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        <select className="rounded-md bg-transparent glass px-3 py-2 text-sm" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {["chu", "eph", "ehs", "epsp", "clinic", "military"].map((t) => <option key={t} value={t} className="bg-slate-900">{t.toUpperCase()}</option>)}
        </select>
        <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input placeholder="Lat" value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} />
        <Input placeholder="Lng" value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} />
      </div>
      <Input placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      <Button onClick={save} disabled={saving || !f.name || !f.city} className="w-full">{saving && <Loader2 className="size-4 animate-spin me-2" />}Save</Button>
    </div>
  );
}
