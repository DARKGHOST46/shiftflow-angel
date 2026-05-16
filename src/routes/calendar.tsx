import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import { getDayType, getMonthMatrix, getShiftDaysInMonth } from "@/lib/shift-engine";
import { GlassCard } from "@/components/glass-card";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  component: () => (
    <AppLayout>
      <CalendarPage />
    </AppLayout>
  ),
});

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CalendarPage() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());

  if (!anchor) return null;

  const weeks = getMonthMatrix(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = cursor.toLocaleDateString(state.language, { month: "long", year: "numeric" });
  const total = getShiftDaysInMonth(cursor.getFullYear(), cursor.getMonth(), anchor).length;
  const selType = getDayType(selected, anchor);

  const weekdayLabels = (() => {
    const fmt = new Intl.DateTimeFormat(state.language, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  })();

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight capitalize">{monthLabel}</h1>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="rounded-full glass" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full glass" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <GlassCard>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdayLabels.map((w) => (
            <div key={w} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const type = getDayType(d, anchor);
            const isShift = type === "shift";
            const isSel = sameDay(d, selected);
            const isToday = sameDay(d, new Date());
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelected(d)}
                className={cn(
                  "relative aspect-square rounded-xl text-sm font-medium transition-colors flex items-center justify-center",
                  !inMonth && "opacity-30",
                  isSel && "ring-2 ring-primary",
                  isShift
                    ? "bg-primary/15 text-foreground"
                    : "bg-secondary/40 text-muted-foreground",
                )}
              >
                <span>{d.getDate()}</span>
                {isShift && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
                {isToday && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("selectDay")}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-2xl font-semibold">
              {selected.toLocaleDateString(state.language, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {selType === "shift" ? t("shiftDay") : t(selType as "rest1" | "rest2" | "rest3" | "rest4")}
            </p>
          </div>
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-semibold"
            style={{ background: selType === "shift" ? "var(--shift)" : "var(--rest)" }}
          >
            {selType === "shift" ? "24" : selType.replace("rest", "R")}
          </div>
        </div>
      </GlassCard>

      <div className="text-center text-sm text-muted-foreground">
        {total} {t("shiftDay")}{total > 1 ? "s" : ""} · {monthLabel}
      </div>
    </div>
  );
}
