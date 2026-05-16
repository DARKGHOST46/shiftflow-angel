import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadState, saveState, type AppState, type Language, type Theme, type QuickNote } from "@/lib/storage";
import { isRTL, t as translate, type TKey } from "@/lib/i18n";

type Ctx = {
  state: AppState;
  setState: (s: AppState | ((prev: AppState) => AppState)) => void;
  t: (key: TKey) => string;
  setLanguage: (l: Language) => void;
  setTheme: (th: Theme) => void;
  setAnchorDate: (iso: string) => void;
  setOnboarded: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  completeEvacuationTurn: () => void;
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
    root.setAttribute("dir", isRTL(state.language) ? "rtl" : "ltr");
    root.setAttribute("lang", state.language);
  }, [state.theme, state.language]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setState,
      t: (k) => translate(state.language, k),
      setLanguage: (language) => setState((p) => ({ ...p, language })),
      setTheme: (theme) => setState((p) => ({ ...p, theme })),
      setAnchorDate: (anchorDate) => setState((p) => ({ ...p, anchorDate })),
      setOnboarded: (onboarded) => setState((p) => ({ ...p, onboarded })),
      setNotifications: (notifications) => setState((p) => ({ ...p, notifications })),
      addNote: (text) =>
        setState((p) => {
          const note: QuickNote = { id: crypto.randomUUID(), text, createdAt: Date.now() };
          return { ...p, notes: [note, ...p.notes].slice(0, 50) };
        }),
      removeNote: (id) => setState((p) => ({ ...p, notes: p.notes.filter((n) => n.id !== id) })),
      completeEvacuationTurn: () =>
        setState((p) => {
          if (p.evacuationQueue.length === 0) return p;
          const [first, ...rest] = p.evacuationQueue;
          const nurse = p.nurses.find((n) => n.id === first);
          if (!nurse) return p;
          return {
            ...p,
            evacuationQueue: [...rest, first],
            evacuationHistory: [
              { id: crypto.randomUUID(), nurseId: nurse.id, nurseName: nurse.name, completedAt: Date.now() },
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
