import { GlassCard } from "@/components/glass-card";
import { CountdownWidget } from "@/components/countdown-widget";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import { getActiveSlot, getNextWorkSlot, getSlotForDate } from "@/lib/shift-engine";
import { getSystem } from "@/lib/shift-systems";
import { motion } from "framer-motion";
import { Activity, Moon, Sun } from "lucide-react";

export function ShiftStatusCard() {
  const { state, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  if (!anchor) return null;

  const system = getSystem(state.systemId);
  const now = new Date();
  const active = getActiveSlot(now, system, anchor);
  const next = getNextWorkSlot(now, system, anchor);
  const todaySlot = getSlotForDate(now, system, anchor);

  const onShift = !!active;
  const slot = active?.slot ?? next.slot;
  const target = active ? active.end : next.start;
  const label = active ? t("shiftEndsIn") : t("shiftStartsIn");
  const Icon = slot.kind === "night" ? Moon : slot.kind === "day" ? Sun : Activity;
  const accentVar = onShift ? slot.colorVar : "--rest";
  const badgeText =
    slot.kind === "shift24"
      ? "24h"
      : slot.kind === "night"
        ? `${slot.durationH}N`
        : slot.kind === "day"
          ? `${slot.durationH}D`
          : "R";

  return (
    <GlassCard className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-60"
        style={{
          background: `radial-gradient(circle, var(${accentVar}) 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Icon className="size-3.5" />
            <span>{onShift ? t("onShift") : t("resting")}</span>
          </div>
          <h2 className="text-3xl font-semibold mt-1 text-gradient">
            {onShift ? t(slot.labelKey) : t(todaySlot.labelKey)}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{t(system.nameKey)}</p>
        </div>
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-base font-semibold glow"
          style={{ background: `var(${onShift ? slot.colorVar : "--rest"})` }}
        >
          {onShift ? badgeText : "R"}
        </div>
      </div>
      <CountdownWidget target={target} label={label} />
    </GlassCard>
  );
}
