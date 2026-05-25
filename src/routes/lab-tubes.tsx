import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { LAB_TUBES, RAPID_LOOKUP, type LabTube } from "@/lib/lab-tubes";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FlaskConical, AlertTriangle, ChevronDown, Beaker, Droplets, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TKey } from "@/lib/i18n";

export const Route = createFileRoute("/lab-tubes")({
  component: () => (
    <AppLayout>
      <LabTubesPage />
    </AppLayout>
  ),
});

function LabTubesPage() {
  const { state, t } = useApp();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const filteredTubes = useMemo(() => {
    if (!q) return LAB_TUBES;
    return LAB_TUBES.filter((tube) => {
      const hay = [
        tube.id,
        tube.additive,
        tube.sample,
        tube.notes,
        tube.colorName.en,
        tube.colorName.ar,
        tube.colorName.fr,
        ...tube.tests,
        ...tube.warnings,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [q]);

  const matchedRapid = useMemo(() => {
    if (!q) return RAPID_LOOKUP.slice(0, 6);
    return RAPID_LOOKUP.filter((r) => r.test.toLowerCase().includes(q)).slice(0, 8);
  }, [q]);

  const lang = state.language as "en" | "ar" | "fr";

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 relative z-10">
      <header>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="pulse-dot" />
          <span>{t("toolkit")}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-gradient flex items-center gap-2 mt-1">
          <FlaskConical className="size-7 text-primary" />
          {t("labTubesTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("labTubesSubtitle")}</p>
      </header>

      {/* Sticky search */}
      <div className="sticky top-2 z-20">
        <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
          <Search className="size-4 text-primary shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("labTubesSearch")}
            className="bg-transparent w-full outline-none text-sm placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Rapid lookup */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="size-4 text-primary" />
          <h3 className="font-semibold">{t("labTubesRapid")}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {matchedRapid.map((r) => (
            <motion.div
              key={r.test}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-center gap-2 rounded-xl bg-background/40 border border-border/40 px-3 py-2"
            >
              <div className="flex -space-x-1.5">
                {r.tubeIds.map((id) => {
                  const tube = LAB_TUBES.find((t) => t.id === id);
                  if (!tube) return null;
                  return (
                    <TubeIndicator key={id} swatch={tube.swatch} glow={tube.glow} size="sm" />
                  );
                })}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{r.test}</div>
                <div className="text-[10px] text-muted-foreground truncate">{r.hint}</div>
              </div>
            </motion.div>
          ))}
          {matchedRapid.length === 0 && (
            <p className="col-span-2 text-xs text-muted-foreground text-center py-4">
              {t("labTubesNoResults")}
            </p>
          )}
        </div>
      </GlassCard>

      {/* All tubes */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("labTubesAll")}
        </h3>
        <span className="text-[10px] text-muted-foreground">{filteredTubes.length} / {LAB_TUBES.length}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredTubes.map((tube) => (
            <TubeCard
              key={tube.id}
              tube={tube}
              lang={lang}
              open={openId === tube.id}
              onToggle={() => setOpenId(openId === tube.id ? null : tube.id)}
              t={t}
            />
          ))}
        </AnimatePresence>
        {filteredTubes.length === 0 && (
          <GlassCard>
            <p className="text-sm text-muted-foreground text-center">{t("labTubesNoResults")}</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function TubeIndicator({
  swatch,
  glow,
  size = "md",
}: {
  swatch: string;
  glow: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-16 w-6" : size === "md" ? "h-12 w-5" : "h-7 w-3";
  return (
    <div
      className={cn("relative rounded-b-full overflow-hidden shrink-0", dims)}
      style={{
        background: `linear-gradient(180deg, ${swatch} 0%, ${swatch} 28%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.04) 100%)`,
        boxShadow: `0 0 16px rgba(${glow}, 0.55), inset 0 -8px 12px rgba(0,0,0,0.35)`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-black/30" />
      <div className="absolute inset-x-1 top-3 bottom-1 rounded-sm bg-white/10 backdrop-blur-sm" />
    </div>
  );
}

function TubeCard({
  tube,
  lang,
  open,
  onToggle,
  t,
}: {
  tube: LabTube;
  lang: "en" | "ar" | "fr";
  open: boolean;
  onToggle: () => void;
  t: (k: TKey) => string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="glass rounded-3xl overflow-hidden border border-border/40"
      style={{ boxShadow: `0 0 0 1px rgba(${tube.glow}, 0.18), 0 12px 32px -16px rgba(${tube.glow}, 0.4)` }}
    >
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-4 cursor-pointer">
        <TubeIndicator swatch={tube.swatch} glow={tube.glow} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{tube.colorName[lang]}</h4>
            {tube.order && (
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border/40">
                #{tube.order}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{tube.additive}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tube.tests.slice(0, 3).map((test) => (
              <span
                key={test}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {test}
              </span>
            ))}
            {tube.tests.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{tube.tests.length - 3}</span>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              <DetailRow icon={Beaker} label={t("labTubesAdditive")} value={tube.additive} />
              <DetailRow icon={Droplets} label={t("labTubesSample")} value={tube.sample} />

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {t("labTubesTests")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tube.tests.map((test) => (
                    <span
                      key={test}
                      className="text-xs px-2.5 py-1 rounded-full bg-background/60 border border-border/40"
                    >
                      {test}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {t("labTubesNotes")}
                </div>
                <p className="text-sm">{tube.notes}</p>
                {tube.inversions != null && tube.inversions > 0 && (
                  <p className="text-xs text-primary mt-1">↻ Invert {tube.inversions}×</p>
                )}
              </div>

              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-destructive text-[10px] uppercase tracking-widest font-semibold">
                  <AlertTriangle className="size-3" />
                  {t("labTubesWarnings")}
                </div>
                {tube.warnings.map((w) => (
                  <p key={w} className="text-xs text-foreground/90">• {w}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}
