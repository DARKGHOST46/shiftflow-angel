import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  FERMLI_CARDS,
  ALGERIA_LAWS,
  FERMLI_CATEGORIES,
  type FermliCard,
  type FermliLang,
} from "@/lib/fermli-data";
import {
  Search,
  Siren,
  Activity,
  Calculator,
  Pill,
  ListOrdered,
  ShieldAlert,
  Layers,
  Scale,
  Sparkles,
  Send,
  Loader2,
  X,
  BookOpen,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/fermli")({
  component: () => (
    <AppLayout>
      <Fermli />
    </AppLayout>
  ),
});

const ICONS: Record<string, LucideIcon> = {
  Layers,
  Siren,
  Activity,
  Calculator,
  Pill,
  ListOrdered,
  ShieldAlert,
};

const CAT_LABELS: Record<string, { en: string; ar: string; fr: string }> = {
  all: { en: "All", ar: "الكل", fr: "Tout" },
  emergency: { en: "Emergency", ar: "طوارئ", fr: "Urgence" },
  vitals: { en: "Vitals", ar: "علامات حيوية", fr: "Constantes" },
  calculation: { en: "Calculation", ar: "حسابات", fr: "Calculs" },
  drug: { en: "Drugs", ar: "أدوية", fr: "Médicaments" },
  triage: { en: "Triage", ar: "فرز", fr: "Triage" },
  infection: { en: "Infection", ar: "عدوى", fr: "Infection" },
};

function langKey(lang: string): FermliLang {
  if (lang === "ar") return "ar";
  if (lang === "fr") return "fr";
  return "en";
}

function Fermli() {
  const { state, t } = useApp();
  const lang = langKey(state.language);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tab, setTab] = useState<"knowledge" | "laws">("knowledge");
  const [open, setOpen] = useState<FermliCard | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FERMLI_CARDS.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      const hay = [
        c.title.en,
        c.title.ar,
        c.title.fr,
        c.summary.en,
        c.summary.ar,
        c.summary.fr,
        ...(c.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  const filteredLaws = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALGERIA_LAWS;
    return ALGERIA_LAWS.filter((l) =>
      [l.ref, l.title.en, l.title.ar, l.title.fr, l.summary.en, l.summary.ar, l.summary.fr]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 relative z-10 pb-8">
      {/* Hero */}
      <header className="relative">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="size-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white grid place-items-center shadow-lg shadow-rose-500/30"
          >
            <Siren className="size-7" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="pulse-dot" />
              <span>{t("fermliEyebrow")}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gradient">
              {t("fermliTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {t("fermliSubtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* AI Helper banner */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setAiSeed(undefined);
          setAiOpen(true);
        }}
        className="w-full text-start glass-strong rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden group"
      >
        <motion.div
          aria-hidden
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center glow relative z-10">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <div className="text-sm font-semibold">{t("fermliAskAi")}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {t("fermliAskAiSub")}
          </div>
        </div>
      </motion.button>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl glass">
        <button
          onClick={() => setTab("knowledge")}
          className={cn(
            "h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            tab === "knowledge"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          <BookOpen className="size-4" />
          {t("fermliKnowledge")}
        </button>
        <button
          onClick={() => setTab("laws")}
          className={cn(
            "h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            tab === "laws"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          <Scale className="size-4" />
          {t("fermliLaws")}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("fermliSearch")}
          className="w-full h-11 ps-10 pe-3 rounded-2xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
        />
      </div>

      {tab === "knowledge" ? (
        <>
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {FERMLI_CATEGORIES.map((c) => {
              const Icon = ICONS[c.icon] ?? Layers;
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary glow"
                      : "bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {CAT_LABELS[c.id]?.[lang] ?? c.id}
                </button>
              );
            })}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t("fermliNoResults")}
              </p>
            )}
            {filtered.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setOpen(c)}
                className="w-full text-start glass rounded-2xl p-4 hover:scale-[1.005] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-xl grid place-items-center shrink-0",
                      c.category === "emergency" &&
                        "bg-rose-500/20 text-rose-400 border border-rose-500/30",
                      c.category === "vitals" &&
                        "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
                      c.category === "calculation" &&
                        "bg-violet-500/20 text-violet-400 border border-violet-500/30",
                      c.category === "drug" &&
                        "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                      c.category === "triage" &&
                        "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                      c.category === "infection" &&
                        "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
                    )}
                  >
                    {(() => {
                      const Icon =
                        c.category === "emergency"
                          ? Siren
                          : c.category === "vitals"
                            ? Activity
                            : c.category === "calculation"
                              ? Calculator
                              : c.category === "drug"
                                ? Pill
                                : c.category === "triage"
                                  ? ListOrdered
                                  : ShieldAlert;
                      return <Icon className="size-5" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-tight">{c.title[lang]}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {c.summary[lang]}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-[11px] text-amber-200/90 leading-relaxed">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{t("fermliLawsDisclaimer")}</span>
          </div>
          <div className="space-y-3">
            {filteredLaws.map((law, i) => (
              <motion.div
                key={law.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 border border-primary/30">
                    <Scale className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      {law.ref}
                    </div>
                    <div className="font-semibold leading-tight mt-0.5">
                      {law.title[lang]}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {law.summary[lang]}
                </p>
                <details className="group">
                  <summary className="text-xs font-medium text-primary cursor-pointer list-none flex items-center gap-1">
                    {t("fermliReadMore")}
                    <span className="transition-transform group-open:rotate-90">→</span>
                  </summary>
                  <p className="text-xs leading-relaxed mt-2 whitespace-pre-line">
                    {law.body[lang]}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 h-8 text-[11px]"
                    onClick={() => {
                      setAiSeed(
                        `${law.ref} — ${law.title[lang]}\n${law.body[lang]}\n\nExplain this in simple terms and how it affects me as a nurse working in Algeria.`,
                      );
                      setAiOpen(true);
                    }}
                  >
                    <Sparkles className="size-3" /> {t("fermliExplainAi")}
                  </Button>
                </details>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Card detail sheet */}
      <AnimatePresence>
        {open && (
          <DetailSheet
            card={open}
            lang={lang}
            onClose={() => setOpen(null)}
            onAsk={(seed) => {
              setOpen(null);
              setAiSeed(seed);
              setAiOpen(true);
            }}
            askLabel={t("fermliExplainAi")}
          />
        )}
      </AnimatePresence>

      {/* AI sheet */}
      <AnimatePresence>
        {aiOpen && (
          <AiSheet
            initialPrompt={aiSeed}
            onClose={() => setAiOpen(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSheet({
  card,
  lang,
  onClose,
  onAsk,
  askLabel,
}: {
  card: FermliCard;
  lang: FermliLang;
  onClose: () => void;
  onAsk: (seed: string) => void;
  askLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-start justify-between p-5 border-b border-border/40">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-primary">
              {card.category}
            </div>
            <h2 className="text-lg font-semibold mt-1">{card.title[lang]}</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <p className="whitespace-pre-line text-sm leading-relaxed">{card.body[lang]}</p>
        </div>
        <div className="p-4 border-t border-border/40">
          <Button
            onClick={() =>
              onAsk(
                `${card.title[lang]}\n\n${card.body[lang]}\n\nExpand on this in a real clinical scenario and warn me about common mistakes.`,
              )
            }
            className="w-full h-11 rounded-2xl"
          >
            <Sparkles className="size-4" /> {askLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Msg = { role: "user" | "assistant"; content: string };

function AiSheet({
  initialPrompt,
  onClose,
  lang,
}: {
  initialPrompt?: string;
  onClose: () => void;
  lang: FermliLang;
}) {
  const { t } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialPrompt ?? "");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: acc } : m,
          );
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const resp = await fetch("/api/fermli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: `User's preferred language: ${lang}. Reply in this language unless the user writes in another.`,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error(t("hakimRateLimited"));
        else if (resp.status === 402) toast.error(t("hakimPaymentRequired"));
        else toast.error(t("hakimGenericError"));
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += decoder.decode(r.value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") {
            done = true;
            break;
          }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(e);
        toast.error(t("hakimGenericError"));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-t-3xl w-full max-w-2xl h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-border/40 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center glow">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{t("fermliAskAi")}</div>
            <div className="text-[10px] text-muted-foreground">
              {t("fermliAskAiSub")}
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("fermliAiEmpty")}
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm whitespace-pre-line max-w-[90%]",
                m.role === "user"
                  ? "ms-auto bg-primary text-primary-foreground"
                  : "me-auto bg-secondary/60",
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="me-auto bg-secondary/60 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> {t("fermliAiThinking")}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || loading) return;
            send(input.trim());
          }}
          className="p-3 border-t border-border/40 flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("hakimPlaceholder")}
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-secondary/50 border border-border/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60 max-h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !loading) send(input.trim());
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-11 rounded-2xl glow"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
