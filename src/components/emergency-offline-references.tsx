import { useApp } from "@/lib/app-context";
import { GlassCard } from "@/components/glass-card";
import { HeartPulse, Activity, BrainCircuit, Flame, Pill } from "lucide-react";
import type { TKey } from "@/lib/i18n";

type Ref = {
  icon: typeof HeartPulse;
  titleKey: TKey;
  bodyKey: TKey;
};

const REFS: Ref[] = [
  { icon: HeartPulse, titleKey: "refCPRTitle", bodyKey: "refCPRBody" },
  { icon: Activity, titleKey: "refVitalsTitle", bodyKey: "refVitalsBody" },
  { icon: BrainCircuit, titleKey: "refGCSTitle", bodyKey: "refGCSBody" },
  { icon: Flame, titleKey: "refBurnsTitle", bodyKey: "refBurnsBody" },
  { icon: Pill, titleKey: "refMedsTitle", bodyKey: "refMedsBody" },
];

export function EmergencyOfflineReferences() {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      {REFS.map((r) => {
        const Icon = r.icon;
        return (
          <GlassCard key={r.titleKey} className="border-2 border-border/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <h3 className="font-bold text-lg">{t(r.titleKey)}</h3>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">
              {t(r.bodyKey)}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
