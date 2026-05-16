import { GlassCard } from "@/components/glass-card";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function AnimatedStatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "accent" | "shift" | "rest";
}) {
  const color =
    accent === "shift" ? "var(--shift)" : accent === "rest" ? "var(--rest)" : accent === "accent" ? "var(--accent)" : "var(--primary)";
  return (
    <GlassCard className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-50"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <motion.p
            key={String(value)}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-semibold mt-2 tabular-nums"
          >
            {value}
          </motion.p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: color }}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </GlassCard>
  );
}
