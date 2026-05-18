export type ShiftDayType = "shift" | "rest1" | "rest2" | "rest3" | "rest4";

export const CYCLE_LENGTH = 5;
export const SHIFT_START_HOUR = 8;
export const SHIFT_START_MINUTE = 30;
export const SHIFT_DURATION_HOURS = 24;

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function withShiftStartTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0);
}

function daysBetween(a: Date, b: Date): number {
  const ms = toLocalMidnight(a).getTime() - toLocalMidnight(b).getTime();
  return Math.round(ms / 86_400_000);
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Calendar-day classification. A calendar day is a "shift" day when the 24h
 * shift block STARTS on that day (at SHIFT_START_HOUR:SHIFT_START_MINUTE).
 */
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

/** True when `now` falls inside an active 24h shift window. */
export function isOnShift(now: Date, anchorDate: Date): boolean {
  return getCurrentShiftStart(anchorDate, now) !== null;
}

/** Start of the currently active shift window, else null. */
export function getCurrentShiftStart(anchorDate: Date, now: Date = new Date()): Date | null {
  const today = toLocalMidnight(now);
  if (isShiftDay(today, anchorDate)) {
    const start = withShiftStartTime(today);
    if (now.getTime() >= start.getTime()) return start;
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isShiftDay(yesterday, anchorDate)) {
    const start = withShiftStartTime(yesterday);
    const end = new Date(start.getTime() + SHIFT_DURATION_HOURS * 3600_000);
    if (now.getTime() < end.getTime()) return start;
  }
  return null;
}

/** End of currently active shift (start + 24h), else null. */
export function getCurrentShiftEnd(anchorDate: Date, now: Date = new Date()): Date | null {
  const start = getCurrentShiftStart(anchorDate, now);
  if (!start) return null;
  return new Date(start.getTime() + SHIFT_DURATION_HOURS * 3600_000);
}

/** Start (08:30) of the next upcoming shift strictly after `from`. */
export function getNextShiftStart(anchorDate: Date, from: Date = new Date()): Date {
  const today = toLocalMidnight(from);
  for (let i = 0; i <= CYCLE_LENGTH * 2; i++) {
    const candidateDay = new Date(today);
    candidateDay.setDate(today.getDate() + i);
    if (!isShiftDay(candidateDay, anchorDate)) continue;
    const start = withShiftStartTime(candidateDay);
    if (start.getTime() > from.getTime()) return start;
  }
  const fallback = new Date(today);
  fallback.setDate(today.getDate() + CYCLE_LENGTH);
  return withShiftStartTime(fallback);
}

export function getShiftDaysInMonth(year: number, month: number, anchorDate: Date): Date[] {
  const days: Date[] = [];
  const last = new Date(year, month + 1, 0);
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    if (isShiftDay(date, anchorDate)) days.push(date);
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
