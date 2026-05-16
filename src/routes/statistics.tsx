import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import { getShiftDaysInMonth } from "@/lib/shift-engine";
import { GlassCard } from "@/components/glass-card";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/statistics")({
  component: () => (
    <AppLayout>
      <Statistics />
    </AppLayout>
  ),
});

function Statistics() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  if (!anchor) return null;

  const now = new Date();
  const year = now.getFullYear();
  const data = Array.from({ length: 12 }, (_, m) => {
    const count = getShiftDaysInMonth(year, m, anchor).length;
    return {
      month: new Date(year, m, 1).toLocaleDateString(state.language, { month: "short" }),
      shifts: count,
      hours: count * 24,
    };
  });

  const thisMonth = data[now.getMonth()].shifts;
  const yearTotal = data.reduce((s, d) => s + d.shifts, 0);
  const avg = (yearTotal / 12).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("statistics")}</h1>
        <p className="text-sm text-muted-foreground">{year}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <AnimatedStatCard icon={CalendarDays} label={t("monthly")} value={thisMonth} accent="shift" />
        <AnimatedStatCard icon={Clock} label={t("estimatedHours")} value={`${thisMonth * 24}h`} accent="accent" />
        <AnimatedStatCard icon={TrendingUp} label={t("total")} value={yearTotal} />
        <AnimatedStatCard icon={TrendingUp} label={t("weeklyFreq")} value={`~${avg}/mo`} accent="rest" />
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
              <Bar dataKey="shifts" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
