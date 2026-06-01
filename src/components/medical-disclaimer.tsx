import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-2xl flex gap-3 text-sm mt-6">
      <ShieldAlert className="size-5 shrink-0 text-destructive" />
      <div className="leading-relaxed opacity-90">
        <strong className="block text-destructive mb-1">Medical Disclaimer</strong>
        ShiftFlow Nurse and the Al-Hakim Assistant are clinical workflow tools, not replacements for physician judgment. 
        Always verify pediatric doses, drip rates, and triage protocols against your hospital's official guidelines before execution.
      </div>
    </div>
  );
}
