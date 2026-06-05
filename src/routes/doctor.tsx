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
import { Plus, User, FileText, FlaskConical, Pill, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor")({
  component: () => (
    <RoleGuard allow={["doctor"]}>
      <DoctorDashboard />
    </RoleGuard>
  ),
});

type Patient = { id: string; full_name: string; dob: string | null; sex: string | null; mrn: string | null; allergies: string | null; notes: string | null };
type Rx = { id: string; patient_id: string; issued_date: string; items: { drug: string; dose: string; freq: string; duration: string }[]; notes: string | null };

function DoctorDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [tab, setTab] = useState<"patients" | "prescriptions" | "lab">("patients");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rxs, setRxs] = useState<Rx[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewPatient, setOpenNewPatient] = useState(false);
  const [openNewRx, setOpenNewRx] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: ps }, { data: rs }] = await Promise.all([
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").order("issued_date", { ascending: false }).limit(50),
    ]);
    setPatients((ps ?? []) as Patient[]);
    setRxs((rs ?? []) as unknown as Rx[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-32 space-y-4">
      <HospitalHeader />
      <header>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Doctor workspace</div>
        <h1 className="text-2xl font-semibold text-gradient">Patients & Care</h1>
      </header>

      <div className="flex gap-1 glass rounded-full p-1">
        {(["patients", "prescriptions", "lab"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-full text-xs font-semibold uppercase ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-primary" /></div> : (
        <>
          {tab === "patients" && (
            <>
              <Dialog open={openNewPatient} onOpenChange={setOpenNewPatient}>
                <DialogTrigger asChild><Button className="w-full"><Plus className="size-4 me-1" />New patient</Button></DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10">
                  <DialogHeader><DialogTitle>New patient</DialogTitle></DialogHeader>
                  <PatientForm onDone={() => { setOpenNewPatient(false); load(); }} hospitalId={profile?.hospital_id ?? ""} userId={user?.id ?? ""} />
                </DialogContent>
              </Dialog>
              <div className="space-y-2">
                {patients.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No patients yet</p>}
                {patients.map((p) => (
                  <GlassCard key={p.id}>
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-primary/15 grid place-items-center"><User className="size-5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.full_name}</div>
                        <div className="text-xs text-muted-foreground">{p.mrn ? `MRN ${p.mrn}` : ""} {p.dob ? ` · ${p.dob}` : ""} {p.sex ? ` · ${p.sex}` : ""}</div>
                        {p.allergies && <div className="text-[11px] text-rose-300 mt-1">⚠ Allergies: {p.allergies}</div>}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setOpenNewRx(p.id)}><Pill className="size-3 me-1" />Rx</Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
              <Dialog open={!!openNewRx} onOpenChange={(o) => !o && setOpenNewRx(null)}>
                <DialogContent className="bg-slate-900 border-white/10 max-h-[85vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>New prescription</DialogTitle></DialogHeader>
                  {openNewRx && <RxForm patientId={openNewRx} hospitalId={profile?.hospital_id ?? ""} userId={user?.id ?? ""} onDone={() => { setOpenNewRx(null); load(); }} />}
                </DialogContent>
              </Dialog>
            </>
          )}
          {tab === "prescriptions" && (
            <div className="space-y-2">
              {rxs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No prescriptions</p>}
              {rxs.map((r) => {
                const pat = patients.find((p) => p.id === r.patient_id);
                return (
                  <GlassCard key={r.id}>
                    <div className="flex items-start gap-3">
                      <FileText className="size-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{pat?.full_name ?? "—"}</div>
                        <div className="text-[11px] text-muted-foreground">{r.issued_date}</div>
                        <ul className="text-xs mt-2 space-y-0.5">
                          {(r.items ?? []).map((it, i) => <li key={i}>• <b>{it.drug}</b> {it.dose} · {it.freq} · {it.duration}</li>)}
                        </ul>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
          {tab === "lab" && <LabOrders patients={patients} hospitalId={profile?.hospital_id ?? ""} userId={user?.id ?? ""} />}
        </>
      )}
    </div>
  );
}

function PatientForm({ onDone, hospitalId, userId }: { onDone: () => void; hospitalId: string; userId: string }) {
  const [f, setF] = useState({ full_name: "", dob: "", sex: "", mrn: "", allergies: "", notes: "" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.full_name) return;
    setSaving(true);
    const { error } = await supabase.from("patients").insert({
      hospital_id: hospitalId, created_by: userId, full_name: f.full_name,
      dob: f.dob || null, sex: f.sex || null, mrn: f.mrn || null,
      allergies: f.allergies || null, notes: f.notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Patient added"); onDone();
  }
  return (
    <div className="space-y-2">
      <Input placeholder="Full name *" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" placeholder="DOB" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} />
        <select className="rounded-md bg-transparent glass px-3 py-2 text-sm" value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value })}>
          <option value="" className="bg-slate-900">Sex</option>
          <option value="M" className="bg-slate-900">Male</option>
          <option value="F" className="bg-slate-900">Female</option>
        </select>
      </div>
      <Input placeholder="MRN" value={f.mrn} onChange={(e) => setF({ ...f, mrn: e.target.value })} />
      <Input placeholder="Allergies" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} />
      <Textarea placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <Button onClick={save} disabled={saving || !f.full_name} className="w-full">{saving && <Loader2 className="size-4 animate-spin me-2" />}Save</Button>
    </div>
  );
}

function RxForm({ patientId, hospitalId, userId, onDone }: { patientId: string; hospitalId: string; userId: string; onDone: () => void }) {
  const [items, setItems] = useState<{ drug: string; dose: string; freq: string; duration: string }[]>([{ drug: "", dose: "", freq: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  function update(i: number, k: keyof typeof items[number], v: string) { setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it)); }
  async function save() {
    const clean = items.filter((i) => i.drug.trim());
    if (!clean.length) return toast.error("Add at least one drug");
    setSaving(true);
    const { error } = await supabase.from("prescriptions").insert({
      patient_id: patientId, doctor_id: userId, hospital_id: hospitalId, items: clean, notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Prescription saved"); onDone();
  }
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="glass rounded-xl p-2 space-y-1.5">
          <div className="flex gap-2 items-center">
            <Input placeholder="Drug (DCI)" value={it.drug} onChange={(e) => update(i, "drug", e.target.value)} />
            {items.length > 1 && <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><Trash2 className="size-4" /></Button>}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Input placeholder="Dose" value={it.dose} onChange={(e) => update(i, "dose", e.target.value)} />
            <Input placeholder="Freq" value={it.freq} onChange={(e) => update(i, "freq", e.target.value)} />
            <Input placeholder="Duration" value={it.duration} onChange={(e) => update(i, "duration", e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setItems([...items, { drug: "", dose: "", freq: "", duration: "" }])}><Plus className="size-3 me-1" />Add drug</Button>
      <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button onClick={save} disabled={saving} className="w-full">{saving && <Loader2 className="size-4 animate-spin me-2" />}Issue prescription</Button>
    </div>
  );
}

function LabOrders({ patients, hospitalId, userId }: { patients: Patient[]; hospitalId: string; userId: string }) {
  type LabOrder = { id: string; patient_id: string; ordered_at: string; tests: string[]; status: string };
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [pid, setPid] = useState(""); const [tests, setTests] = useState("");
  async function load() {
    const { data } = await supabase.from("lab_orders").select("*").order("ordered_at", { ascending: false }).limit(50);
    setOrders((data ?? []) as unknown as LabOrder[]);
  }
  useEffect(() => { load(); }, []);
  async function order() {
    if (!pid || !tests.trim()) return;
    const arr = tests.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("lab_orders").insert({ patient_id: pid, ordered_by: userId, hospital_id: hospitalId, tests: arr });
    if (error) return toast.error(error.message);
    setTests(""); setPid(""); toast.success("Order created"); load();
  }
  return (
    <>
      <GlassCard>
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><FlaskConical className="size-4 text-primary" />New lab order</div>
        <select className="w-full rounded-md bg-transparent glass px-3 py-2 text-sm mb-2" value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="" className="bg-slate-900">Choose patient</option>
          {patients.map((p) => <option key={p.id} value={p.id} className="bg-slate-900">{p.full_name}</option>)}
        </select>
        <Input placeholder="Tests, comma-separated (CBC, BMP, …)" value={tests} onChange={(e) => setTests(e.target.value)} />
        <Button onClick={order} className="w-full mt-2" disabled={!pid || !tests.trim()}>Order</Button>
      </GlassCard>
      <div className="space-y-2 mt-3">
        {orders.map((o) => {
          const p = patients.find((x) => x.id === o.patient_id);
          return (
            <GlassCard key={o.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{p?.full_name ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(o.ordered_at).toLocaleString()}</div>
                  <div className="text-xs mt-1">{(o.tests ?? []).join(", ")}</div>
                </div>
                <span className="text-[10px] uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-300">{o.status}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
