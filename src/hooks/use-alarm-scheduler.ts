import { useEffect, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate, toAnchorIso } from "@/lib/storage";
import { shouldFireAlarmNow, getUpcomingAlarmTrigger } from "@/lib/alarm";
import { scheduleShiftAlarm, cancelShiftAlarm, isNativeNotificationsSupported } from "@/lib/native-notifications";
import { toast } from "sonner";

export function useAlarmScheduler() {
  const { state, setLastAlarmDate, t } = useApp();
  const firedRef = useRef<string | null>(state.lastAlarmDate);

  useEffect(() => {
    firedRef.current = state.lastAlarmDate;
  }, [state.lastAlarmDate]);

  // NATIVE SCHEDULING EFFECT:
  // If native notifications are supported (Tauri desktop), we compute the future alarm
  // date ahead of time and register it with the OS scheduler. This guarantees it fires
  // even if the WebView process is throttled or suspended.
  useEffect(() => {
    if (!isNativeNotificationsSupported()) return;
    if (!state.alarmEnabled) {
      cancelShiftAlarm();
      return;
    }
    const anchor = parseAnchorDate(state.anchorDate);
    if (!anchor) return;

    const trigger = getUpcomingAlarmTrigger(
      anchor,
      state.alarmTime,
      state.systemId,
      state.alarmLeadMinutes,
    );

    if (trigger) {
      const labelKey =
        trigger.slot.kind === "night"
          ? "nightShiftAlarm"
          : trigger.slot.kind === "day"
            ? "dayShiftAlarm"
            : "shiftAlarm";
      
      const title = t("appName");
      const body = `${t(labelKey)} • ${t(trigger.slot.labelKey)}`;
      
      scheduleShiftAlarm(trigger, title, body);
    }
  }, [
    state.alarmEnabled,
    state.alarmTime,
    state.anchorDate,
    state.systemId,
    state.alarmLeadMinutes,
    state.lastAlarmDate,
    t,
  ]);

  // EXISTING WEB BROWSER EFFECT:
  // Still fully functions in browsers or when Tauri is open in foreground.
  useEffect(() => {
    if (!state.alarmEnabled) return;
    const anchor = parseAnchorDate(state.anchorDate);
    if (!anchor) return;

    const tick = () => {
      const now = new Date();
      const todayIso = toAnchorIso(now);
      if (firedRef.current === todayIso) return;
      const trigger = shouldFireAlarmNow(
        anchor,
        state.alarmTime,
        state.systemId,
        state.alarmLeadMinutes,
        firedRef.current,
        now,
      );
      if (!trigger) return;

      firedRef.current = trigger.id;
      setLastAlarmDate(trigger.id);

      const title = t("appName");
      const labelKey =
        trigger.slot.kind === "night"
          ? "nightShiftAlarm"
          : trigger.slot.kind === "day"
            ? "dayShiftAlarm"
            : "shiftAlarm";
      const body = `${t(labelKey)} • ${t(trigger.slot.labelKey)}`;
      
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          // Prevent double notification if native desktop already handles it
          if (!isNativeNotificationsSupported()) {
            new Notification(title, { body, tag: "shiftflow-alarm" });
          }
        }
      } catch {
        // ignore
      }
      try {
        playBeep();
      } catch {
        // ignore
      }
      toast(title, { description: body });
    };

    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [
    state.alarmEnabled,
    state.alarmTime,
    state.anchorDate,
    state.systemId,
    state.alarmLeadMinutes,
    setLastAlarmDate,
    t,
  ]);
}

function playBeep() {
  const AC: typeof AudioContext | undefined =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.start();
  osc.stop(ctx.currentTime + 1.3);
  setTimeout(() => ctx.close(), 1500);
}
