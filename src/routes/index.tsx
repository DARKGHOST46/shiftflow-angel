import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { ShiftStatusCard } from "@/components/shift-status-card";
import { QuickNotesWidget } from "@/components/quick-notes-widget";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import { getShiftDaysInMonth } from "@/lib/shift-engine";
import { getNextAlarm } from "@/lib/alarm";
import { CalendarDays, Clock, Siren, AlarmClock } from "lucide-react";
import { GlassCard } from "@/components/glass-card";

export const Route = createFileRoute("/")({
  component: () => (
    <AppLayout>
      <Home />
    </AppLayout>
  ),
});

function greeting(t: (k: "greetingMorning" | "greetingAfternoon" | "greetingEvening") => string) {
  const h = new Date().getHours();
  if (h < 12) return t("greetingMorning");
  if (h < 18) return t("greetingAfternoon");
  return t("greetingEvening");
}

function Home() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  const now = new Date();
  const shiftsThisMonth = anchor ? getShiftDaysInMonth(now.getFullYear(), now.getMonth(), anchor).length : 0;
  const hours = shiftsThisMonth * 24;
  const nextNurseId = state.evacuationQueues[state.evacuationDestination]?.[0];
  const nextNurse = state.nurses.find((n) => n.id === nextNurseId);
  const nextAlarm = state.alarmEnabled ? getNextAlarm(anchor, state.alarmTime) : null;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting(t)}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{t("appName")}</h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {now.toLocaleDateString(state.language, { weekday: "long", day: "numeric", month: "short" })}
        </span>
      </header>

      <ShiftStatusCard />

      <div className="grid grid-cols-2 gap-4">
        <AnimatedStatCard icon={CalendarDays} label={t("shiftsThisMonth")} value={shiftsThisMonth} accent="shift" />
        <AnimatedStatCard icon={Clock} label={t("estimatedHours")} value={`${hours}h`} accent="accent" />
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Siren className="size-4 text-primary" />
          <h3 className="font-semibold">{t("nextNurse")}</h3>
        </div>
        <p className="text-2xl font-semibold text-gradient">
          {nextNurse?.name ?? "—"}
        </p>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <AlarmClock className="size-4 text-primary" />
          <h3 className="font-semibold">{t("nextAlarm")}</h3>
        </div>
        <p className="text-lg font-semibold text-gradient">
          {nextAlarm
            ? nextAlarm.toLocaleString(state.language, {
                weekday: "long",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : t("noAlarmScheduled")}
        </p>
      </GlassCard>

      <QuickNotesWidget />
    </div>
  );
}
