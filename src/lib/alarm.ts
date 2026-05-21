import { getNextWorkSlot, getActiveSlot } from "@/lib/shift-engine";
import { getSystem, type SystemId, type ShiftSlot } from "@/lib/shift-systems";
import { toAnchorIso } from "@/lib/storage";

/** Parse "HH:MM" into [h, m]. */
export function parseTime(time: string): [number, number] {
  const [h, m] = time.split(":").map(Number);
  return [isFinite(h) ? h : 0, isFinite(m) ? m : 0];
}

/**
 * Next alarm time. For the 24h system this is at the user-chosen `alarmTime` on the next
 * working day. For multi-slot systems (day/night) we ring `leadMinutes` before each
 * upcoming shift start so the user is alerted before BOTH the day and night shifts.
 */
export function getNextAlarm(
  anchorDate: Date | null,
  alarmTime: string,
  systemId: SystemId,
  leadMinutes: number,
  from: Date = new Date(),
): Date | null {
  if (!anchorDate) return null;
  const system = getSystem(systemId);

  if (system.id === "24h_4rest") {
    const [h, m] = parseTime(alarmTime);
    for (let i = 0; i < 15; i++) {
      const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
      const next = getNextWorkSlot(
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), -1, 0, 0, 0),
        system,
        anchorDate,
      );
      if (next.date.toDateString() !== day.toDateString()) continue;
      const candidate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
      if (candidate.getTime() > from.getTime()) return candidate;
    }
    return null;
  }

  // Day/night systems: alert before each non-rest slot start.
  const next = getNextWorkSlot(from, system, anchorDate);
  return new Date(next.start.getTime() - leadMinutes * 60_000);
}

export interface AlarmTrigger {
  fire: Date;
  slot: ShiftSlot;
}

/** Returns the alarm trigger (and slot it belongs to) if it should fire right now. */
export function shouldFireAlarmNow(
  anchorDate: Date | null,
  alarmTime: string,
  systemId: SystemId,
  leadMinutes: number,
  lastAlarmDate: string | null,
  now: Date = new Date(),
  windowSec = 60,
): AlarmTrigger | null {
  if (!anchorDate) return null;
  const system = getSystem(systemId);
  const todayIso = toAnchorIso(now);
  if (lastAlarmDate === todayIso) return null;

  // Determine upcoming slot today: either the active one (just started) or
  // the next one starting today.
  const candidates: { start: Date; slot: ShiftSlot }[] = [];
  const active = getActiveSlot(now, system, anchorDate);
  if (active) candidates.push({ start: active.start, slot: active.slot });
  const next = getNextWorkSlot(now, system, anchorDate);
  candidates.push({ start: next.start, slot: next.slot });

  for (const c of candidates) {
    let fire: Date;
    if (system.id === "24h_4rest") {
      const [h, m] = parseTime(alarmTime);
      fire = new Date(c.start.getFullYear(), c.start.getMonth(), c.start.getDate(), h, m, 0, 0);
    } else {
      fire = new Date(c.start.getTime() - leadMinutes * 60_000);
    }
    if (toAnchorIso(fire) !== todayIso) continue;
    const diff = (now.getTime() - fire.getTime()) / 1000;
    if (diff >= 0 && diff <= windowSec) return { fire, slot: c.slot };
  }
  return null;
}
