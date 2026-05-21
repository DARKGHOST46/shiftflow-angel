import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { ShiftStatusCard } from "@/components/shift-status-card";
import { QuickNotesWidget } from "@/components/quick-notes-widget";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import {
  getMonthlyHours,
  getMonthlyNightCount,
  getWorkDaysInMonth,
} from "@/lib/shift-engine";
import { getSystem } from "@/lib/shift-systems";
import { getNextAlarm } from "@/lib/alarm";
import { CalendarDays, Clock, Siren, AlarmClock, Moon } from "lucide-react";
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
  const system = getSystem(state.systemId);
  const now = new Date();
  const workDays = anchor ? getWorkDaysInMonth(now.getFullYear(), now.getMonth(), system, anchor) : [];
  const hours = anchor ? getMonthlyHours(now.getFullYear(), now.getMonth(), system, anchor) : 0;
  const nights = anchor ? getMonthlyNightCount(now.getFullYear(), now.getMonth(), system, anchor) : 0;
  const nextNurseId = state.evacuationQueues[state.evacuationDestination]?.[0];
  const nextNurse = state.nurses.find((n) => n.id === nextNurseId);
  const nextAlarm = state.alarmEnabled
    ? getNextAlarm(anchor, state.alarmTime, state.systemId, state.alarmLeadMinutes)
    : null;

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
        <AnimatedStatCard icon={CalendarDays} label={t("shiftsThisMonth")} value={workDays.length} accent="shift" />
        <AnimatedStatCard icon={Clock} label={t("estimatedHours")} value={`${hours}h`} accent="accent" />
        <AnimatedStatCard icon={Moon} label={t("nightShifts")} value={nights} accent="rest" />
        <AnimatedStatCard
          icon={Clock}
          label={t("salary")}
          value={
            state.hourlyRate > 0
              ? `${Math.round(hours * state.hourlyRate + nights * state.hourlyRate * (state.nightBonusPct / 100) * 1)}`
              : "—"
          }
        />
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Siren className="size-4 text-primary" />
          <h3 className="font-semibold">{t("nextNurse")}</h3>
        </div>
        <p className="text-2xl font-semibold text-gradient">{nextNurse?.name ?? "—"}</p>
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
