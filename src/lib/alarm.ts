import { isShiftDay } from "@/lib/shift-engine";
import { toAnchorIso } from "@/lib/storage";

/** Parse "HH:MM" into [h, m]. */
export function parseTime(time: string): [number, number] {
  const [h, m] = time.split(":").map(Number);
  return [isFinite(h) ? h : 0, isFinite(m) ? m : 0];
}

/**
 * Compute the next datetime at which the alarm should fire.
 * Alarms only fire on shift days. Returns null if no anchor.
 */
export function getNextAlarm(anchorDate: Date | null, alarmTime: string, from: Date = new Date()): Date | null {
  if (!anchorDate) return null;
  const [h, m] = parseTime(alarmTime);
  for (let i = 0; i < 10; i++) {
    const candidate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, h, m, 0, 0);
    if (!isShiftDay(candidate, anchorDate)) continue;
    if (candidate.getTime() <= from.getTime()) continue;
    return candidate;
  }
  return null;
}

/** True if `now` is within `windowSec` seconds AFTER the scheduled alarm time on a shift day. */
export function shouldFireAlarm(
  anchorDate: Date | null,
  alarmTime: string,
  lastAlarmDate: string | null,
  now: Date = new Date(),
  windowSec = 60,
): boolean {
  if (!anchorDate) return false;
  if (!isShiftDay(now, anchorDate)) return false;
  const todayIso = toAnchorIso(now);
  if (lastAlarmDate === todayIso) return false;
  const [h, m] = parseTime(alarmTime);
  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  const diff = (now.getTime() - scheduled.getTime()) / 1000;
  return diff >= 0 && diff <= windowSec;
}
