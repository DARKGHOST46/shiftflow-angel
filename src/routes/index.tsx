import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { LandingPage } from "@/components/landing-page";
import { ShiftStatusCard } from "@/components/shift-status-card";
import { QuickNotesWidget } from "@/components/quick-notes-widget";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import {
  getMonthlyHours,
  getMonthlyNightCount,
  getSlotForDate,
  getWorkDaysInMonth,
  getConsecutiveNights,
} from "@/lib/shift-engine";
import { getSystem } from "@/lib/shift-systems";
import { getNextAlarm } from "@/lib/alarm";
import { CalendarDays, Clock, Siren, AlarmClock, Moon, Sparkles, FlaskConical, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/glass-card";
import { FatigueIntelligence, computeFatigue } from "@/components/fatigue-intelligence";
import { motion } from "framer-motion";

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
  
  if (!state.onboarded) {
    return <LandingPage />;
  }

  const anchor = parseAnchorDate(state.anchorDate);
  const system = getSystem(state.systemId);
  const now = new Date();
  const workDays = anchor ? getWorkDaysInMonth(now.getFullYear(), now.getMonth(), system, anchor) : [];
  const hours = anchor ? getMonthlyHours(now.getFullYear(), now.getMonth(), system, anchor) : 0;
  const nights = anchor ? getMonthlyNightCount(now.getFullYear(), now.getMonth(), system, anchor) : 0;

  // Consecutive night streak ending today (or most recent run)
  const consecutiveNights = anchor ? getConsecutiveNights(now, system, anchor) : 0;
  const fatigue = computeFatigue(hours, nights, consecutiveNights);

  const insights: string[] = [];
  if (fatigue.fatigueScore >= 70) insights.push(t("highWorkload"));
  if (consecutiveNights >= 2) insights.push(t("sleepRisk"));
  if (fatigue.recoveryScore >= 60) insights.push(t("recoveryAdvised"));
  if (insights.length === 0) insights.push(t("optimalRecovery"));

  const nextNurseId = state.evacuationQueues[state.evacuationDestination]?.[0];
  const nextNurse = state.nurses.find((n) => n.id === nextNurseId);
  const nextAlarm = state.alarmEnabled
    ? getNextAlarm(anchor, state.alarmTime, state.systemId, state.alarmLeadMinutes)
    : null;

  const salary =
    state.hourlyRate > 0
      ? Math.round(hours * state.hourlyRate + nights * state.hourlyRate * (state.nightBonusPct / 100))
      : null;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 relative z-10">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="pulse-dot" />
            <span>{t("liveOps")}</span>
            <span className="opacity-50">·</span>
            <span>{t("commandCenter")}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{greeting(t)}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-gradient">{t("appName")}</h1>
        </div>
        <span className="text-xs text-muted-foreground text-right">
          {now.toLocaleDateString(state.language, { weekday: "long", day: "numeric", month: "short" })}
        </span>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 text-[11px] uppercase tracking-widest px-3 py-2 rounded-full glass w-fit"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span>{t("aiOptimized")}</span>
        <span className="opacity-50">·</span>
        <span className="text-primary">{t(system.nameKey)}</span>
      </motion.div>

      <ShiftStatusCard />

      <FatigueIntelligence
        data={fatigue}
        insights={insights}
        title={t("fatigueIntel")}
        subtitle={t("fatigueIntelSub")}
      />

      <div className="grid grid-cols-2 gap-4">
        <AnimatedStatCard icon={CalendarDays} label={t("shiftsThisMonth")} value={workDays.length} accent="shift" />
        <AnimatedStatCard icon={Clock} label={t("estimatedHours")} value={`${hours}h`} accent="accent" />
        <AnimatedStatCard icon={Moon} label={t("nightShifts")} value={nights} accent="rest" />
        <AnimatedStatCard
          icon={Clock}
          label={t("salary")}
          value={salary != null ? `${salary}` : "—"}
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

      <Link to="/lab-tubes" className="block">
        <GlassCard className="hover:scale-[1.01] transition-transform cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/15 border border-primary/30 grid place-items-center glow">
              <FlaskConical className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("toolkit")}
              </div>
              <div className="font-semibold text-gradient">{t("labTubesTitle")}</div>
              <div className="text-xs text-muted-foreground truncate">{t("labTubesSubtitle")}</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </GlassCard>
      </Link>

      <QuickNotesWidget />
    </div>
  );
}
