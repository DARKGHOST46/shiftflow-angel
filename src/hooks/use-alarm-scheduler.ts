import { useEffect, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { parseAnchorDate, toAnchorIso } from "@/lib/storage";
import { shouldFireAlarmNow } from "@/lib/alarm";
import { toast } from "sonner";

export function useAlarmScheduler() {
  const { state, setLastAlarmDate, t } = useApp();
  const firedRef = useRef<string | null>(state.lastAlarmDate);

  useEffect(() => {
    firedRef.current = state.lastAlarmDate;
  }, [state.lastAlarmDate]);

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

      firedRef.current = todayIso;
      setLastAlarmDate(todayIso);

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
          new Notification(title, { body, tag: "shiftflow-alarm" });
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
