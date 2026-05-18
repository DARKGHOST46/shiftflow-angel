import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Siren, CheckCircle2, History, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/storage";

export const Route = createFileRoute("/evacuation")({
  component: () => (
    <AppLayout>
      <Evacuation />
    </AppLayout>
  ),
});

const DESTINATIONS: Destination[] = ["oran", "ain_temouchent"];

function Evacuation() {
  const { state, completeEvacuationTurn, moveNurse, setEvacuationDestination, t } = useApp();
  const queueNurses = state.evacuationQueue
    .map((id) => state.nurses.find((n) => n.id === id))
    .filter((n): n is { id: string; name: string } => !!n);
  const next = queueNurses[0];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("evacuation")}</h1>
        <p className="text-sm text-muted-foreground">{t("evacuationQueue")}</p>
      </header>

      <GlassCard className="relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center glow">
            <Siren className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("nextNurse")}</p>
            <p className="text-3xl font-semibold text-gradient">{next?.name ?? "—"}</p>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="size-4 text-primary" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("destination")}</p>
          </div>
          <div className="flex gap-2 bg-secondary/50 rounded-full p-1">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setEvacuationDestination(d)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  state.evacuationDestination === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t(d)}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={completeEvacuationTurn}
          className="w-full mt-5 rounded-2xl glow h-12 text-base"
        >
          <CheckCircle2 className="size-5" />
          {t("completeTurn")}
        </Button>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-1">{t("upcoming")}</h3>
        <p className="text-xs text-muted-foreground mb-3">{t("reorderHelp")}</p>
        <div className="space-y-2">
          {queueNurses.map((n, i) => (
            <motion.div
              key={n.id}
              layout
              className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2"
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </div>
              <span className="flex-1 font-medium">{n.name}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("moveUp")}
                disabled={i === 0}
                onClick={() => moveNurse(n.id, -1)}
                className="rounded-full h-8 w-8"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("moveDown")}
                disabled={i === queueNurses.length - 1}
                onClick={() => moveNurse(n.id, 1)}
                className="rounded-full h-8 w-8"
              >
                <ChevronDown className="size-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <History className="size-4 text-primary" />
          <h3 className="font-semibold">{t("history")}</h3>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
          <AnimatePresence initial={false}>
            {state.evacuationHistory.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noHistory")}</p>
            )}
            {state.evacuationHistory.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-sm gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{h.nurseName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.destination ? t(h.destination) : "—"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(h.completedAt).toLocaleString(state.language, {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
