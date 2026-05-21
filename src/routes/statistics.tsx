import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import {
  getMonthlyHours,
  getMonthlyNightCount,
  getWorkDaysInMonth,
} from "@/lib/shift-engine";
import { getSystem } from "@/lib/shift-systems";
import { GlassCard } from "@/components/glass-card";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { CalendarDays, Clock, Moon, TrendingUp, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/statistics")({
  component: () => (
    <AppLayout>
      <Statistics />
    </AppLayout>
  ),
});

function fatigueLevel(hours: number, nights: number): "fatigueLow" | "fatigueMedium" | "fatigueHigh" {
  const score = hours + nights * 8;
  if (score < 120) return "fatigueLow";
  if (score < 200) return "fatigueMedium";
  return "fatigueHigh";
}

function Statistics() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  if (!anchor) return null;
  const system = getSystem(state.systemId);

  const now = new Date();
  const year = now.getFullYear();
  const data = Array.from({ length: 12 }, (_, m) => {
    const days = getWorkDaysInMonth(year, m, system, anchor);
    const hours = days.reduce((s, d) => s + d.slot.durationH, 0);
    return {
      month: new Date(year, m, 1).toLocaleDateString(state.language, { month: "short" }),
      shifts: days.length,
      hours,
    };
  });

  const monthShifts = data[now.getMonth()].shifts;
  const monthHours = getMonthlyHours(year, now.getMonth(), system, anchor);
  const monthNights = getMonthlyNightCount(year, now.getMonth(), system, anchor);
  const yearShifts = data.reduce((s, d) => s + d.shifts, 0);
  const yearHours = data.reduce((s, d) => s + d.hours, 0);
  const fatigueKey = fatigueLevel(monthHours, monthNights);
  const salary =
    state.hourlyRate > 0
      ? Math.round(
          monthHours * state.hourlyRate +
            monthNights * state.hourlyRate * (state.nightBonusPct / 100) * 1,
        )
      : null;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("statistics")}</h1>
        <p className="text-sm text-muted-foreground">
          {year} · {t(system.nameKey)}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <AnimatedStatCard icon={CalendarDays} label={t("monthly")} value={monthShifts} accent="shift" />
        <AnimatedStatCard icon={Clock} label={t("estimatedHours")} value={`${monthHours}h`} accent="accent" />
        <AnimatedStatCard icon={Moon} label={t("nightShifts")} value={monthNights} accent="rest" />
        <AnimatedStatCard icon={Activity} label={t("fatigue")} value={t(fatigueKey)} />
        <AnimatedStatCard icon={TrendingUp} label={t("total")} value={`${yearShifts} · ${yearHours}h`} />
        <AnimatedStatCard icon={Clock} label={t("salary")} value={salary != null ? `${salary}` : "—"} />
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4">{t("productivity")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar dataKey="hours" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
