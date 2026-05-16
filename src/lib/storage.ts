export type Language = "en" | "ar" | "fr";
export type Theme = "light" | "dark";

export interface QuickNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface Nurse {
  id: string;
  name: string;
}

export interface EvacuationLog {
  id: string;
  nurseId: string;
  nurseName: string;
  completedAt: number;
}

export interface AppState {
  onboarded: boolean;
  anchorDate: string | null; // ISO date YYYY-MM-DD
  language: Language;
  theme: Theme;
  notifications: boolean;
  notes: QuickNote[];
  nurses: Nurse[];
  evacuationQueue: string[]; // nurse ids in order
  evacuationHistory: EvacuationLog[];
}

const KEY = "shiftflow:state:v1";

export const defaultState: AppState = {
  onboarded: false,
  anchorDate: null,
  language: "en",
  theme: "light",
  notifications: false,
  notes: [],
  nurses: [
    { id: "n1", name: "Sara" },
    { id: "n2", name: "Ahmed" },
    { id: "n3", name: "Lina" },
    { id: "n4", name: "Omar" },
  ],
  evacuationQueue: ["n1", "n2", "n3", "n4"],
  evacuationHistory: [],
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function parseAnchorDate(iso: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toAnchorIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
