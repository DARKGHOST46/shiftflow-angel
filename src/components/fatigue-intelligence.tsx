import { motion } from "framer-motion";
import { Activity, BatteryCharging, Brain, Moon, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { AnimatedCounter } from "@/components/animated-counter";

export interface FatigueModel {
  /** 0-100 — higher means more burnout risk. */
  fatigueScore: number;
  /** 0-100 — higher means better recovery readiness. */
  recoveryScore: number;
  consecutiveNights: number;
  monthHours: number;
  monthNights: number;
}

export function computeFatigue(
  monthHours: number,
  monthNights: number,
  consecutiveNights: number,
): FatigueModel {
  const hoursLoad = Math.min(1, monthHours / 220);
  const nightLoad = Math.min(1, monthNights / 10);
  const streakLoad = Math.min(1, consecutiveNights / 5);
  const fatigueScore = Math.round((hoursLoad * 0.55 + nightLoad * 0.25 + streakLoad * 0.2) * 100);
  const recoveryScore = Math.max(0, 100 - fatigueScore - Math.round(streakLoad * 8));
  return { fatigueScore, recoveryScore, consecutiveNights, monthHours, monthNights };
}

function RadialGauge({ value, label, accent }: { value: number; label: string; accent: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative w-[120px] h-[120px]">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`var(${accent})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px var(${accent}))` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold tabular-nums">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

export function FatigueIntelligence({
  data,
  insights,
  title,
  subtitle,
}: {
  data: FatigueModel;
  insights: string[];
  title: string;
  subtitle: string;
}) {
  const risk =
    data.fatigueScore < 40 ? "Low" : data.fatigueScore < 70 ? "Elevated" : "Critical";
  const riskColor =
    data.fatigueScore < 40 ? "--rest" : data.fatigueScore < 70 ? "--warn" : "--danger";

  return (
    <GlassCard className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-50"
        style={{ background: `radial-gradient(circle, var(${riskColor}) 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.6, 0.45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Brain className="size-3.5" />
            <span>{title}</span>
            <span className="pulse-dot ml-1" />
          </div>
          <h3 className="text-xl font-semibold mt-1">{subtitle}</h3>
        </div>
        <span
          className="text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            background: `color-mix(in oklab, var(${riskColor}) 18%, transparent)`,
            color: `var(${riskColor})`,
            border: `1px solid color-mix(in oklab, var(${riskColor}) 35%, transparent)`,
          }}
        >
          {risk}
        </span>
      </div>

      <div className="relative grid grid-cols-2 gap-4 items-center">
        <div className="flex justify-center">
          <RadialGauge value={data.fatigueScore} label="Fatigue" accent={riskColor} />
        </div>
        <div className="flex justify-center">
          <RadialGauge value={data.recoveryScore} label="Recovery" accent="--accent" />
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat icon={Activity} value={data.monthHours} label="Hours" suffix="h" />
        <Stat icon={Moon} value={data.monthNights} label="Nights" />
        <Stat icon={BatteryCharging} value={data.consecutiveNights} label="Streak" />
      </div>

      <div className="relative mt-5 space-y-2">
        {insights.map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-start gap-2 text-sm rounded-2xl px-3 py-2 bg-secondary/40 border border-border/60"
          >
            <Sparkles className="size-3.5 mt-0.5 text-primary shrink-0" />
            <span className="text-foreground/90 leading-relaxed">{line}</span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  suffix = "",
}: {
  icon: typeof Activity;
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/40 border border-border/60 px-2 py-3">
      <Icon className="size-3.5 mx-auto text-muted-foreground" />
      <div className="text-lg font-semibold mt-1">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
