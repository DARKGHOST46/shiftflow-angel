import type { SystemId } from "@/lib/shift-systems";

export type Language = "en" | "ar" | "fr";
export type Theme = "light" | "dark";
export type Destination = "oran" | "ain_temouchent";

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
  destination: Destination;
  completedAt: number;
}

export interface AppState {
  onboarded: boolean;
  anchorDate: string | null;
  systemId: SystemId;
  language: Language;
  theme: Theme;
  notifications: boolean;
  alarmEnabled: boolean;
  alarmTime: string;
  /** Minutes before each shift to trigger the pre-shift reminder. */
  alarmLeadMinutes: number;
  lastAlarmDate: string | null;
  notes: QuickNote[];
  nurses: Nurse[];
  evacuationQueues: Record<Destination, string[]>;
  evacuationHistory: EvacuationLog[];
  evacuationDestination: Destination;
  /** Hourly rate (local currency) used for salary estimates. */
  hourlyRate: number;
  /** Bonus multiplier applied to night-shift hours. */
  nightBonusPct: number;
  exhaustionMode: boolean;
}

const KEY = "shiftflow:state:v5";

export const defaultState: AppState = {
  onboarded: false,
  anchorDate: null,
  systemId: "24h_4rest",
  language: "en",
  theme: "dark",
  notifications: false,
  alarmEnabled: false,
  alarmTime: "07:00",
  alarmLeadMinutes: 60,
  lastAlarmDate: null,
  notes: [],
  nurses: [
    { id: "n1", name: "Mohamed" },
    { id: "n2", name: "Cheikh" },
    { id: "n3", name: "Amel" },
    { id: "n4", name: "Nourhouda" },
  ],
  evacuationQueues: {
    oran: ["n1", "n2", "n3", "n4"],
    ain_temouchent: ["n1", "n2", "n3", "n4"],
  },
  evacuationHistory: [],
  evacuationDestination: "oran",
  hourlyRate: 0,
  nightBonusPct: 25,
  exhaustionMode: false,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    
    // Safety check against corrupted local storage primitives/arrays
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      console.warn("[ShiftFlow] Corrupted state detected. Falling back to default.");
      return defaultState;
    }

    // Ensure critical arrays and nested objects exist even if partially corrupted
    return { 
      ...defaultState, 
      ...parsed,
      notes: Array.isArray(parsed.notes) ? parsed.notes : defaultState.notes,
      nurses: Array.isArray(parsed.nurses) ? parsed.nurses : defaultState.nurses,
      evacuationHistory: Array.isArray(parsed.evacuationHistory) ? parsed.evacuationHistory : defaultState.evacuationHistory,
      evacuationQueues: (parsed.evacuationQueues && typeof parsed.evacuationQueues === "object") ? parsed.evacuationQueues : defaultState.evacuationQueues,
    };
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
