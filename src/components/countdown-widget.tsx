import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatCountdown } from "@/lib/shift-engine";
import { useApp } from "@/lib/app-context";

export function CountdownWidget({ target, label }: { target: Date; label: string }) {
  const { t } = useApp();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { d, h, m, s } = formatCountdown(target.getTime() - now);

  const cells: { v: number; l: string }[] = [
    { v: d, l: t("d") },
    { v: h, l: t("h") },
    { v: m, l: t("m") },
    { v: s, l: t("s") },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="pulse-dot" />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <div className="flex gap-2">
        {cells.map((c, i) => (
          <motion.div
            key={c.l}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 240, damping: 22 }}
            className="flex-1 rounded-2xl bg-secondary/40 border border-border/60 backdrop-blur px-2 py-3 text-center relative overflow-hidden"
          >
            <motion.div
              key={String(c.v)}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-2xl font-semibold tabular-nums tracking-tight"
            >
              {String(c.v).padStart(2, "0")}
            </motion.div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              {c.l}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
