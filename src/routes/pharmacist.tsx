import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { GlassCard } from "@/components/glass-card";
import { HospitalHeader } from "@/components/hospital-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pill, AlertTriangle, Loader2, Trash2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacist")({
  component: () => (
    <RoleGuard allow={["pharmacist"]}>
      <PharmacistDashboard />
    </RoleGuard>
  ),
});

type Stock = { id: string; dci: string; brand: string | null; form: string | null; strength: string | null; qty: number; unit: string | null; expiry: string | null; batch: string | null; supplier: string | null; min_threshold: number };
type Disp = { id: string; dispensed_at: string; items: { drug: string; qty: number }[]; notes: string | null };

function PharmacistDashboard() {
  const { user } = useAuth(); const { profile } = useProfile();
  const [tab, setTab] = useState<"stock" | "dispense" | "alerts">("stock");
  const [stock, setStock] = useState<Stock[]>([]);
  const [logs, setLogs] = useState<Disp[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: d }] = await Promise.all([
      supabase.from("pharmacy_stock").select("*").order("dci"),
      supabase.from("dispensing_log").select("*").order("dispensed_at", { ascending: false }).limit(50),
    ]);
    setStock((s ?? []) as Stock[]); setLogs((d ?? []) as unknown as Disp[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const low = stock.filter((s) => s.qty <= s.min_threshold);
  const soon = stock.filter((s) => s.expiry && new Date(s.expiry).getTime() - Date.now() < 90 * 86400000);

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("pharmacy_stock").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-32 space-y-4">
      <HospitalHeader />
      <header>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Pharmacy workspace</div>
        <h1 className="text-2xl font-semibold text-gradient">Inventory & Dispensing</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="text-center"><div className="text-2xl font-bold text-gradient">{stock.length}</div><div className="text-[10px] uppercase text-muted-foreground">Items</div></GlassCard>
        <GlassCard className="text-center border-amber-500/30"><div className="text-2xl font-bold text-amber-400">{low.length}</div><div className="text-[10px] uppercase text-muted-foreground">Low stock</div></GlassCard>
        <GlassCard className="text-center border-rose-500/30"><div className="text-2xl font-bold text-rose-400">{soon.length}</div><div className="text-[10px] uppercase text-muted-foreground">Expiring</div></GlassCard>
      </div>

      <div className="flex gap-1 glass rounded-full p-1">
        {(["stock", "dispense", "alerts"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-primary" /></div> : (
        <>
          {tab === "stock" && (
            <>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button className="w-full"><Plus className="size-4 me-1" />Add drug</Button></DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10"><DialogHeader><DialogTitle>Add stock</DialogTitle></DialogHeader>
                  <StockForm hospitalId={profile?.hospital_id ?? ""} onDone={() => { setOpen(false); load(); }} />
                </DialogContent>
              </Dialog>
              <div className="space-y-2">
                {stock.map((s) => (
                  <GlassCard key={s.id} className={s.qty <= s.min_threshold ? "border-amber-500/40" : ""}>
                    <div className="flex items-center gap-3">
                      <Pill className="size-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{s.dci} {s.strength && <span className="text-muted-foreground font-normal text-xs">{s.strength}</span>}</div>
                        <div className="text-[11px] text-muted-foreground">{[s.form, s.brand, s.batch && `lot ${s.batch}`].filter(Boolean).join(" · ")}</div>
                        {s.expiry && <div className="text-[11px] text-muted-foreground">Exp: {s.expiry}</div>}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${s.qty <= s.min_threshold ? "text-amber-400" : "text-primary"}`}>{s.qty}</div>
                        <div className="text-[10px] text-muted-foreground">{s.unit}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="size-4 text-rose-400" /></Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
          {tab === "dispense" && (
            <DispenseForm hospitalId={profile?.hospital_id ?? ""} userId={user?.id ?? ""} logs={logs} reload={load} />
          )}
          {tab === "alerts" && (
            <div className="space-y-2">
              {low.length === 0 && soon.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">All good ✓</p>}
              {low.map((s) => (
                <GlassCard key={s.id} className="border-amber-500/40">
                  <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-400" /><div className="flex-1"><div className="font-semibold">{s.dci}</div><div className="text-xs text-muted-foreground">Low: {s.qty}/{s.min_threshold}</div></div></div>
                </GlassCard>
              ))}
              {soon.map((s) => (
                <GlassCard key={"e" + s.id} className="border-rose-500/40">
                  <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-rose-400" /><div className="flex-1"><div className="font-semibold">{s.dci}</div><div className="text-xs text-muted-foreground">Expires {s.expiry}</div></div></div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StockForm({ hospitalId, onDone }: { hospitalId: string; onDone: () => void }) {
  const [f, setF] = useState({ dci: "", brand: "", form: "", strength: "", qty: "0", unit: "box", expiry: "", batch: "", supplier: "", min_threshold: "10" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.dci) return;
    setSaving(true);
    const { error } = await supabase.from("pharmacy_stock").insert({
      hospital_id: hospitalId, dci: f.dci, brand: f.brand || null, form: f.form || null, strength: f.strength || null,
      qty: Number(f.qty) || 0, unit: f.unit, expiry: f.expiry || null, batch: f.batch || null, supplier: f.supplier || null,
      min_threshold: Number(f.min_threshold) || 10,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Added"); onDone();
  }
  return (
    <div className="space-y-2">
      <Input placeholder="DCI (generic name) *" value={f.dci} onChange={(e) => setF({ ...f, dci: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Brand" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} />
        <Input placeholder="Strength (500mg)" value={f.strength} onChange={(e) => setF({ ...f, strength: e.target.value })} />
        <Input placeholder="Form (tab/inj)" value={f.form} onChange={(e) => setF({ ...f, form: e.target.value })} />
        <Input placeholder="Batch" value={f.batch} onChange={(e) => setF({ ...f, batch: e.target.value })} />
        <Input type="number" placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
        <Input placeholder="Unit" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
        <Input type="number" placeholder="Min threshold" value={f.min_threshold} onChange={(e) => setF({ ...f, min_threshold: e.target.value })} />
        <Input type="date" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} />
      </div>
      <Input placeholder="Supplier" value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} />
      <Button onClick={save} disabled={saving || !f.dci} className="w-full">{saving && <Loader2 className="size-4 animate-spin me-2" />}Save</Button>
    </div>
  );
}

function DispenseForm({ hospitalId, userId, logs, reload }: { hospitalId: string; userId: string; logs: { id: string; dispensed_at: string; items: { drug: string; qty: number }[]; notes: string | null }[]; reload: () => void }) {
  const [drug, setDrug] = useState(""); const [qty, setQty] = useState("1");
  async function dispense() {
    if (!drug.trim()) return;
    const item = { drug: drug.trim(), qty: Number(qty) || 1 };
    const { error } = await supabase.from("dispensing_log").insert({ hospital_id: hospitalId, dispensed_by: userId, items: [item] });
    if (error) return toast.error(error.message);
    // Decrement stock by matching DCI
    const { data: matches } = await supabase.from("pharmacy_stock").select("id,qty").eq("dci", item.drug).limit(1);
    if (matches && matches[0]) {
      await supabase.from("pharmacy_stock").update({ qty: Math.max(0, matches[0].qty - item.qty) }).eq("id", matches[0].id);
    }
    setDrug(""); setQty("1"); toast.success("Dispensed"); reload();
  }
  return (
    <>
      <GlassCard>
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><PackageCheck className="size-4 text-primary" />Quick dispense</div>
        <Input placeholder="Drug (DCI)" value={drug} onChange={(e) => setDrug(e.target.value)} />
        <div className="flex gap-2 mt-2">
          <Input type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} className="w-24" />
          <Button onClick={dispense} className="flex-1">Dispense</Button>
        </div>
      </GlassCard>
      <div className="space-y-2 mt-3">
        {logs.map((l) => (
          <GlassCard key={l.id}>
            <div className="text-[11px] text-muted-foreground">{new Date(l.dispensed_at).toLocaleString()}</div>
            <div className="text-sm">{(l.items ?? []).map((it) => `${it.drug} ×${it.qty}`).join(", ")}</div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
