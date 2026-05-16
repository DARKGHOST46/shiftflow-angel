export type ShiftDayType = "shift" | "rest1" | "rest2" | "rest3" | "rest4";

export const CYCLE_LENGTH = 5;

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const ms = toLocalMidnight(a).getTime() - toLocalMidnight(b).getTime();
  return Math.round(ms / 86_400_000);
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getDayType(date: Date, anchorDate: Date): ShiftDayType {
  const diff = daysBetween(date, anchorDate);
  const idx = mod(diff, CYCLE_LENGTH);
  return (["shift", "rest1", "rest2", "rest3", "rest4"] as const)[idx];
}

export function getRestDayNumber(date: Date, anchorDate: Date): number | null {
  const t = getDayType(date, anchorDate);
  if (t === "shift") return null;
  return Number(t.replace("rest", ""));
}

export function isShiftDay(date: Date, anchorDate: Date): boolean {
  return getDayType(date, anchorDate) === "shift";
}

/** Returns the start (00:00 local) of the next shift day strictly after `from`. */
export function getNextShiftStart(anchorDate: Date, from: Date = new Date()): Date {
  const today = toLocalMidnight(from);
  for (let i = 0; i <= CYCLE_LENGTH; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i);
    if (isShiftDay(candidate, anchorDate)) {
      // If today is a shift but `from` time has already passed start (00:00), still treat as today
      if (i === 0 && from.getTime() >= candidate.getTime() && from.getHours() >= 0) {
        // current shift started today; next start is in (cycleLength) days
        const next = new Date(candidate);
        next.setDate(candidate.getDate() + CYCLE_LENGTH);
        return next;
      }
      return candidate;
    }
  }
  return today;
}

/** Returns the start of the current shift if today IS a shift day, else null. */
export function getCurrentShiftStart(anchorDate: Date, now: Date = new Date()): Date | null {
  if (isShiftDay(now, anchorDate)) return toLocalMidnight(now);
  return null;
}

export function getCurrentShiftEnd(anchorDate: Date, now: Date = new Date()): Date | null {
  const start = getCurrentShiftStart(anchorDate, now);
  if (!start) return null;
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return end;
}

export function getShiftDaysInMonth(year: number, month: number, anchorDate: Date): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    if (isShiftDay(date, anchorDate)) days.push(date);
    void first;
  }
  return days;
}

export function getMonthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const start = new Date(year, month, 1 - startWeekday);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      row.push(date);
    }
    weeks.push(row);
  }
  return weeks;
}

export function formatCountdown(ms: number): { d: number; h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}
