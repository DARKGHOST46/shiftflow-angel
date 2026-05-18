import { GlassCard } from "@/components/glass-card";
import { CountdownWidget } from "@/components/countdown-widget";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import {
  getCurrentShiftEnd,
  getDayType,
  getNextShiftStart,
  isOnShift,
} from "@/lib/shift-engine";
import { motion } from "framer-motion";
import { Activity, Moon } from "lucide-react";

export function ShiftStatusCard() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  if (!anchor) return null;

  const now = new Date();
  const onShift = isOnShift(now, anchor);
  const type = getDayType(now, anchor);
  const end = getCurrentShiftEnd(anchor, now);
  const next = getNextShiftStart(anchor, now);
  const target = onShift && end ? end : next;
  const label = onShift ? t("shiftEndsIn") : t("shiftStartsIn");

  return (
    <GlassCard className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-60"
        style={{
          background: onShift
            ? "radial-gradient(circle, var(--shift) 0%, transparent 70%)"
            : "radial-gradient(circle, var(--rest) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            {onShift ? <Activity className="size-3.5" /> : <Moon className="size-3.5" />}
            <span>{onShift ? t("onShift") : t("resting")}</span>
          </div>
          <h2 className="text-3xl font-semibold mt-1 text-gradient">
            {onShift ? t("shiftDay") : t(type as "rest1" | "rest2" | "rest3" | "rest4")}
          </h2>
        </div>
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-lg font-semibold glow"
          style={{ background: onShift ? "var(--shift)" : "var(--rest)" }}
        >
          {onShift ? "24" : type.replace("rest", "R")}
        </div>
      </div>
      <CountdownWidget target={target} label={label} />
    </GlassCard>
  );
}
