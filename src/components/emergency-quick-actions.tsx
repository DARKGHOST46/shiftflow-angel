import { motion } from "framer-motion";
import { useApp } from "@/lib/app-context";
import {
  HeartPulse,
  Syringe,
  Baby,
  Droplets,
  Activity,
  BrainCircuit,
  Flame,
  Zap,
  ShieldAlert,
  Wind,
} from "lucide-react";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type QA = {
  icon: typeof HeartPulse;
  labelKey: TKey;
  prompt: string;
};

const ACTIONS: QA[] = [
  { icon: HeartPulse, labelKey: "qaAdultDrug", prompt: "Provide step-by-step adult critical drug dilution guides (e.g. Noradrenaline, Amiodarone) including standard concentrations." },
  { icon: Baby, labelKey: "qaPediatric", prompt: "List common pediatric emergency weight-based doses (Adrenaline, Amiodarone, Defibrillation Joules) with a quick calculation formula." },
  { icon: Droplets, labelKey: "qpIvDrip", prompt: "Walk me through IV drip rate calculation with a worked example (gtts/min from mL and hours)." },
  { icon: Activity, labelKey: "qpTriage", prompt: "Explain ESI-style triage priorities with a quick decision pattern for the ER." },
  { icon: BrainCircuit, labelKey: "refGCSTitle", prompt: "Explain how to rapidly assess the Glasgow Coma Scale (GCS) and what critical score requires intubation." },
  { icon: Flame, labelKey: "refBurnsTitle", prompt: "Explain the Rule of Nines for burn surface estimation and the Parkland formula for initial fluid resuscitation." },
  { icon: Zap, labelKey: "qaShock", prompt: "What are the immediate nursing interventions and assessments for a patient in undifferentiated shock?" },
  { icon: ShieldAlert, labelKey: "qaSepsis", prompt: "List the early red flags for sepsis (SIRS criteria, qSOFA) and the 'Sepsis Six' immediate interventions." },
  { icon: Wind, labelKey: "qpOxygen", prompt: "Compare common oxygen delivery methods and approximate FiO2 ranges for emergency respiratory distress." },
  { icon: HeartPulse, labelKey: "refCPRTitle", prompt: "Give me the adult CPR sequence step by step, including compression depth, rate, ratio, and medication reminders." },
];

export function EmergencyQuickActions({
  onPick,
  isOnline,
}: {
  onPick: (prompt: string) => void;
  isOnline: boolean;
}) {
  const { t } = useApp();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ACTIONS.map((qa, i) => {
        const Icon = qa.icon;
        return (
          <motion.button
            key={qa.labelKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.2 }}
            onClick={() => {
              if (isOnline) onPick(qa.prompt);
            }}
            disabled={!isOnline}
            className={cn(
              "group relative text-left rounded-2xl p-4 transition-all overflow-hidden border-2",
              isOnline
                ? "glass border-border hover:border-primary/50 hover:ring-glow"
                : "bg-muted/50 border-muted opacity-50 cursor-not-allowed"
            )}
          >
            {isOnline && (
              <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
            )}
            <div className="flex items-start justify-between mb-2">
              <Icon className={cn("size-6", isOnline ? "text-primary" : "text-muted-foreground")} />
              {isOnline && (
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldAlert className="size-2.5" />
                  Verified
                </div>
              )}
            </div>
            <div className="text-sm font-semibold leading-tight">
              {t(qa.labelKey)}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
