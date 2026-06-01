import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  loadState,
  saveState,
  type AppState,
  type Language,
  type Theme,
  type QuickNote,
  type Destination,
} from "@/lib/storage";
import { isRTL, t as translate, type TKey } from "@/lib/i18n";
import type { SystemId } from "@/lib/shift-systems";

type Ctx = {
  state: AppState;
  setState: (s: AppState | ((prev: AppState) => AppState)) => void;
  t: (key: TKey) => string;
  setLanguage: (l: Language) => void;
  setTheme: (th: Theme) => void;
  setAnchorDate: (iso: string) => void;
  setSystemId: (id: SystemId) => void;
  setOnboarded: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  setAlarmEnabled: (v: boolean) => void;
  setAlarmTime: (v: string) => void;
  setAlarmLeadMinutes: (v: number) => void;
  setLastAlarmDate: (v: string | null) => void;
  setHourlyRate: (v: number) => void;
  setNightBonusPct: (v: number) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  setEvacuationDestination: (d: Destination) => void;
  moveNurse: (id: string, direction: -1 | 1) => void;
  completeEvacuationTurn: () => void;
  setExhaustionMode: (v: boolean) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, _setState] = useState<AppState>(() => loadState());

  const setState: Ctx["setState"] = (s) => {
    _setState((prev) => {
      const next = typeof s === "function" ? (s as (p: AppState) => AppState)(prev) : s;
      saveState(next);
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.classList.toggle("exhaustion-mode", state.exhaustionMode);
    root.setAttribute("dir", isRTL(state.language) ? "rtl" : "ltr");
    root.setAttribute("lang", state.language);
  }, [state.theme, state.language, state.exhaustionMode]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setState,
      t: (k) => translate(state.language, k),
      setLanguage: (language) => setState((p) => ({ ...p, language })),
      setTheme: (theme) => setState((p) => ({ ...p, theme })),
      setAnchorDate: (anchorDate) => setState((p) => ({ ...p, anchorDate })),
      setSystemId: (systemId) => setState((p) => ({ ...p, systemId, lastAlarmDate: null })),
      setOnboarded: (onboarded) => setState((p) => ({ ...p, onboarded })),
      setNotifications: (notifications) => setState((p) => ({ ...p, notifications })),
      setAlarmEnabled: (alarmEnabled) => setState((p) => ({ ...p, alarmEnabled })),
      setAlarmTime: (alarmTime) => setState((p) => ({ ...p, alarmTime })),
      setAlarmLeadMinutes: (alarmLeadMinutes) => setState((p) => ({ ...p, alarmLeadMinutes })),
      setLastAlarmDate: (lastAlarmDate) => setState((p) => ({ ...p, lastAlarmDate })),
      setHourlyRate: (hourlyRate) => setState((p) => ({ ...p, hourlyRate })),
      setNightBonusPct: (nightBonusPct) => setState((p) => ({ ...p, nightBonusPct })),
      setExhaustionMode: (exhaustionMode) => setState((p) => ({ ...p, exhaustionMode })),
      addNote: (text) =>
        setState((p) => {
          const note: QuickNote = { id: crypto.randomUUID(), text, createdAt: Date.now() };
          return { ...p, notes: [note, ...p.notes].slice(0, 50) };
        }),
      removeNote: (id) => setState((p) => ({ ...p, notes: p.notes.filter((n) => n.id !== id) })),
      setEvacuationDestination: (evacuationDestination) =>
        setState((p) => ({ ...p, evacuationDestination })),
      moveNurse: (id, direction) =>
        setState((p) => {
          const dest = p.evacuationDestination;
          const queue = [...(p.evacuationQueues[dest] ?? [])];
          const idx = queue.indexOf(id);
          const target = idx + direction;
          if (idx < 0 || target < 0 || target >= queue.length) return p;
          [queue[idx], queue[target]] = [queue[target], queue[idx]];
          return { ...p, evacuationQueues: { ...p.evacuationQueues, [dest]: queue } };
        }),
      completeEvacuationTurn: () =>
        setState((p) => {
          const dest = p.evacuationDestination;
          const queue = p.evacuationQueues[dest] ?? [];
          if (queue.length === 0) return p;
          const [first, ...rest] = queue;
          const nurse = p.nurses.find((n) => n.id === first);
          if (!nurse) return p;
          return {
            ...p,
            evacuationQueues: { ...p.evacuationQueues, [dest]: [...rest, first] },
            evacuationHistory: [
              {
                id: crypto.randomUUID(),
                nurseId: nurse.id,
                nurseName: nurse.name,
                destination: dest,
                completedAt: Date.now(),
              },
              ...p.evacuationHistory,
            ].slice(0, 100),
          };
        }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
