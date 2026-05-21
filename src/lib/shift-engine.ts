import { getSystem, type ShiftSlot, type ShiftSystem, type SystemId } from "@/lib/shift-systems";

export type { ShiftSlot, SystemId } from "@/lib/shift-systems";

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((toLocalMidnight(a).getTime() - toLocalMidnight(b).getTime()) / 86_400_000);
}
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getSlotForDate(date: Date, system: ShiftSystem, anchor: Date): ShiftSlot {
  const idx = mod(daysBetween(date, anchor), system.cycleLength);
  return system.pattern[idx];
}

export function getSlotStartOn(date: Date, slot: ShiftSlot): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    slot.startHour,
    slot.startMinute,
    0,
    0,
  );
}

export interface ActiveSlot {
  slot: ShiftSlot;
  start: Date;
  end: Date;
  /** Day-cell date the slot was scheduled on. */
  date: Date;
}

/** Returns the slot currently in progress (may have started yesterday for cross-midnight shifts). */
export function getActiveSlot(
  now: Date,
  system: ShiftSystem,
  anchor: Date,
): ActiveSlot | null {
  for (const offset of [0, -1]) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const slot = getSlotForDate(day, system, anchor);
    if (slot.kind === "rest") continue;
    const start = getSlotStartOn(day, slot);
    const end = new Date(start.getTime() + slot.durationH * 3600_000);
    if (now.getTime() >= start.getTime() && now.getTime() < end.getTime()) {
      return { slot, start, end, date: day };
    }
  }
  return null;
}

/** Next non-rest slot strictly after `now`. */
export function getNextWorkSlot(
  now: Date,
  system: ShiftSystem,
  anchor: Date,
): ActiveSlot {
  const today = toLocalMidnight(now);
  for (let i = 0; i <= system.cycleLength * 2 + 2; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    const slot = getSlotForDate(day, system, anchor);
    if (slot.kind === "rest") continue;
    const start = getSlotStartOn(day, slot);
    if (start.getTime() > now.getTime()) {
      const end = new Date(start.getTime() + slot.durationH * 3600_000);
      return { slot, start, end, date: day };
    }
  }
  // theoretical fallback
  const day = new Date(today);
  day.setDate(today.getDate() + system.cycleLength);
  const slot = system.pattern[0];
  const start = getSlotStartOn(day, slot);
  return {
    slot,
    start,
    end: new Date(start.getTime() + slot.durationH * 3600_000),
    date: day,
  };
}

export function isWorkDay(date: Date, system: ShiftSystem, anchor: Date): boolean {
  return getSlotForDate(date, system, anchor).kind !== "rest";
}

/** Backwards-compatible alias used by alarm logic — any non-rest day counts. */
export function isShiftDay(date: Date, anchor: Date, systemId: SystemId = "24h_4rest"): boolean {
  return isWorkDay(date, getSystem(systemId), anchor);
}

export function getWorkDaysInMonth(
  year: number,
  month: number,
  system: ShiftSystem,
  anchor: Date,
): { date: Date; slot: ShiftSlot }[] {
  const out: { date: Date; slot: ShiftSlot }[] = [];
  const last = new Date(year, month + 1, 0);
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    const slot = getSlotForDate(date, system, anchor);
    if (slot.kind !== "rest") out.push({ date, slot });
  }
  return out;
}

export function getMonthlyHours(
  year: number,
  month: number,
  system: ShiftSystem,
  anchor: Date,
): number {
  return getWorkDaysInMonth(year, month, system, anchor).reduce(
    (s, d) => s + d.slot.durationH,
    0,
  );
}

export function getMonthlyNightCount(
  year: number,
  month: number,
  system: ShiftSystem,
  anchor: Date,
): number {
  return getWorkDaysInMonth(year, month, system, anchor).filter((d) => d.slot.kind === "night")
    .length;
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
