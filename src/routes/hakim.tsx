import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOnline } from "@/hooks/use-online";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Mic,
  Sparkles,
  Activity,
  Stethoscope,
  HeartPulse,
  Droplets,
  Moon,
  Brain,
  ShieldAlert,
  Calculator,
  Syringe,
  Pill,
  ScanLine,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { EmergencyQuickActions } from "@/components/emergency-quick-actions";
import { EmergencyOfflineReferences } from "@/components/emergency-offline-references";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate } from "@/lib/storage";
import {
  getMonthlyHours,
  getMonthlyNightCount,
  getSlotForDate,
  getConsecutiveNights,
} from "@/lib/shift-engine";
import { getSystem } from "@/lib/shift-systems";
import { computeFatigue } from "@/components/fatigue-intelligence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hakim")({
  component: () => (
    <AppLayout>
      <HakimPage />
    </AppLayout>
  ),
});

type Msg = { role: "user" | "assistant"; content: string };

const THINKING_PHRASES_KEY = [
  "hakimThinkingProtocols",
  "hakimThinkingWorkflow",
  "hakimThinkingFatigue",
  "hakimThinkingOps",
] as const;



function HakimPage() {
  const { state, t, setExhaustionMode } = useApp();
  const isOnline = useOnline();
  const anchor = parseAnchorDate(state.anchorDate);
  const system = getSystem(state.systemId);
  const now = new Date();
  const hours = anchor ? getMonthlyHours(now.getFullYear(), now.getMonth(), system, anchor) : 0;
  const nights = anchor ? getMonthlyNightCount(now.getFullYear(), now.getMonth(), system, anchor) : 0;

  const consecutiveNights = anchor ? getConsecutiveNights(now, system, anchor) : 0;
  const fatigue = computeFatigue(hours, nights, consecutiveNights);
  const todaySlot = anchor ? getSlotForDate(now, system, anchor) : null;

  const shiftContext = useMemo(() => {
    return [
      `Shift system: ${system.id}`,
      `Cycle length (days): ${system.cycleLength}`,
      todaySlot ? `Today's slot: ${todaySlot.kind}` : "",
      `Monthly hours so far: ${hours}`,
      `Monthly night shifts so far: ${nights}`,
      `Consecutive recent night shifts: ${consecutiveNights}`,
      `Fatigue score (0-100): ${fatigue.fatigueScore}`,
      `Recovery score (0-100): ${fatigue.recoveryScore}`,
      `User language: ${state.language}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [system, todaySlot, hours, nights, consecutiveNights, fatigue, state.language]);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinkingPhraseIdx, setThinkingPhraseIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    isSupported: voiceSupported,
    isListening: voiceListening,
    transcript: voiceTranscript,
    error: voiceError,
    start: voiceStart,
    stop: voiceStop,
    resetTranscript: voiceReset,
  } = useVoiceRecognition(state.language);

  // Sync voice transcript to input
  useEffect(() => {
    if (voiceListening && voiceTranscript) {
      setInput(voiceTranscript);
    }
  }, [voiceListening, voiceTranscript]);

  useEffect(() => {
    if (!streaming) return;
    const id = window.setInterval(() => {
      setThinkingPhraseIdx((i) => (i + 1) % THINKING_PHRASES_KEY.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [streaming]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setError(null);
      const userMsg: Msg = { role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setStreaming(true);
      voiceReset();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const endpoint = getApiUrl();
        
        if (!endpoint) {
          setError(t("hakimEndpointMissing"));
          setStreaming(false);
          return;
        }

        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, shiftContext }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) setError(t("hakimRateLimited"));
          else if (resp.status === 402) setError(t("hakimPaymentRequired"));
          else {
            try {
              const errData = await resp.clone().json();
              setError(`Error: ${errData.error || resp.statusText}`);
            } catch {
              if (resp.status === 401 || resp.status === 403) {
                setError(t("hakimAuthFailure"));
              } else if (resp.status === 404) {
                setError("Endpoint not found (404).");
              } else if (resp.status >= 500) {
                setError(t("hakimServerError"));
              } else {
                setError(`Error: HTTP ${resp.status} - API unreachable`);
              }
            }
          }
          setStreaming(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let assistantSoFar = "";
        let started = false;
        let done = false;

        const pushChunk = (chunk: string) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            if (!started) {
              started = true;
              return [...prev, { role: "assistant", content: assistantSoFar }];
            }
            const last = prev[prev.length - 1];
            if (last?.role !== "assistant") return [...prev, { role: "assistant", content: assistantSoFar }];
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          });
        };

        while (!done) {
          const r = await reader.read();
          if (r.done) break;
          buf += decoder.decode(r.value, { stream: true });
          let nlIdx: number;
          while ((nlIdx = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nlIdx);
            buf = buf.slice(nlIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") { done = true; break; }
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content as string | undefined;
              if (delta) pushChunk(delta);
            } catch {
              buf = line + "\n" + buf;
              break;
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          console.error(e);
          const errMsg = (e as Error).message;
          if (errMsg.includes("Failed to fetch") || errMsg.includes("Network Error")) {
            setError(t("hakimBackendUnreachable"));
          } else {
            setError(`Network Error: ${errMsg}`);
          }
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, shiftContext, streaming, t],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="drift absolute rounded-full bg-primary/40"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${80 + (i % 5) * 4}%`,
              width: `${3 + (i % 4)}px`,
              height: `${3 + (i % 4)}px`,
              animationDelay: `${(i * 0.7) % 8}s`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-40">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="grid place-items-center size-10 rounded-full glass hover:bg-white/5 transition"
            aria-label={t("back")}
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="pulse-dot" />
            {t("hakimOnline")}
          </div>
        </div>

        {/* Identity card */}
        <GlassCard variant="strong" className="relative overflow-hidden mb-5">
          <div className="grid-mesh absolute inset-0 opacity-40 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="relative size-16 grid place-items-center rounded-2xl overflow-hidden glass">
              <span className="absolute inset-0 ai-core" />
              <Sparkles className="relative z-10 size-7 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gradient leading-tight">
                {t("hakimTitle")}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {t("hakimSubtitle")}
              </p>
            </div>
          </div>
          {/* ECG line */}
          <svg viewBox="0 0 600 40" className="mt-4 w-full h-10 opacity-80">
            <polyline
              className="ecg-line"
              points="0,20 60,20 80,20 95,5 110,35 125,20 200,20 220,20 235,8 250,32 265,20 360,20 380,20 395,4 410,36 425,20 600,20"
            />
          </svg>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/80">
            {t("hakimSafetyNote")}
          </p>
        </GlassCard>

        {/* Empty state OR conversation */}
        {messages.length === 0 ? (
          <EmptyState 
            onPick={(p) => {
              setExhaustionMode(true);
              send(p);
            }} 
            t={t} 
            isOnline={isOnline} 
          />
        ) : (
          <div ref={scrollRef} className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {streaming && <ThinkingRow phraseKey={THINKING_PHRASES_KEY[thinkingPhraseIdx]} t={t} />}
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs px-3 py-2 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <form onSubmit={onSubmit} className="glass-strong rounded-full pl-2 pr-1 py-1.5 flex items-center gap-2 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              if (voiceListening) {
                voiceStop();
                if (input.trim() && isOnline) {
                  send(input);
                }
              } else {
                if (voiceSupported) voiceStart();
              }
            }}
            disabled={!voiceSupported && !voiceError}
            aria-label={t("hakimVoice")}
            className={cn(
              "grid place-items-center size-10 rounded-full transition relative",
              voiceListening
                ? "bg-destructive text-destructive-foreground"
                : "hover:bg-white/5 text-muted-foreground"
            )}
            title={
              voiceError === "denied"
                ? t("voiceDenied")
                : !voiceSupported
                ? t("voiceUnsupported")
                : t("hakimVoice")
            }
          >
            {voiceListening && <span className="absolute inset-0 rounded-full border border-destructive animate-ping" />}
            <Mic className={cn("size-5 relative z-10", voiceListening && "animate-pulse")} />
          </button>
          <input
            value={input}
            onChange={(e) => {
              if (voiceListening) voiceStop();
              setInput(e.target.value);
            }}
            placeholder={
              !isOnline && voiceListening 
                ? t("voiceOffline") 
                : voiceListening 
                  ? t("voiceListening") 
                  : t("hakimPlaceholder")
            }
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 py-2"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim() || !isOnline}
            aria-label={t("hakimSend")}
            className={cn(
              "grid place-items-center size-10 rounded-full text-primary-foreground transition relative overflow-hidden",
              streaming || !input.trim() ? "bg-muted text-muted-foreground" : "bg-primary glow",
            )}
          >
            <Send className="size-4 relative z-10" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass rounded-bl-md",
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-widest text-primary/80">
            <Sparkles className="size-3" />
            <span>الحكيم موح</span>
          </div>
        )}
        {content}
      </div>
    </motion.div>
  );
}

function ThinkingRow({ phraseKey, t }: { phraseKey: typeof THINKING_PHRASES_KEY[number]; t: (k: typeof phraseKey) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="glass rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="typing-dot" style={{ animationDelay: "0ms" }} />
          <span className="typing-dot" style={{ animationDelay: "150ms" }} />
          <span className="typing-dot" style={{ animationDelay: "300ms" }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-muted-foreground"
          >
            {t(phraseKey)}…
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EmptyState({
  onPick,
  t,
  isOnline,
}: {
  onPick: (prompt: string) => void;
  t: ReturnType<typeof useApp>["t"];
  isOnline: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Offline Banner */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="size-5 text-destructive" />
            <h3 className="font-bold text-destructive">{t("offlineBannerTitle")}</h3>
          </div>
          <p className="text-sm font-medium text-destructive/90 leading-relaxed">
            {t("offlineBannerDesc")}
          </p>
        </motion.div>
      )}

      {/* Idle AI core */}
      {isOnline && (
      <div className="relative grid place-items-center py-6">
        <div className="relative size-28">
          <span className="absolute inset-0 rounded-full ai-core" />
          <span className="absolute -inset-3 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "3.5s" }} />
          <span className="absolute -inset-6 rounded-full border border-primary/10" />
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="size-9 text-primary-foreground" />
          </div>
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground max-w-sm">
          {t("hakimIntro")}
        </p>
      </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <Activity className="size-4" />
          {t("toolkit")}
        </div>
        <EmergencyQuickActions onPick={onPick} isOnline={isOnline} />
      </div>

      {!isOnline && (
        <div className="mt-8">
          <EmergencyOfflineReferences />
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
}
