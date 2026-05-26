import { AlarmTrigger } from "./alarm";
import { isPermissionGranted, requestPermission, sendNotification, Schedule, pending, cancelAll } from "@tauri-apps/plugin-notification";

/**
 * Safely detects if the application is running inside the Tauri desktop environment.
 * We use this instead of @tauri-apps/api/core isTauri() to ensure we don't break
 * Cloudflare SSR or web deployments with unwanted imports.
 */
export const isNativeNotificationsSupported = () => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

/**
 * Requests notification permissions.
 * On Tauri: Uses the native OS permission prompt via the notification plugin.
 * On Web: Uses the standard browser Notification API.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNativeNotificationsSupported()) {
    try {
      const granted = await isPermissionGranted();
      if (granted) return true;
      const permission = await requestPermission();
      return permission === "granted";
    } catch (e) {
      console.error("Tauri permission request failed:", e);
      return false;
    }
  } else if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
  }
  return false;
}

/**
 * Schedules an alarm to fire at the correct time.
 *
 * ARCHITECTURE NOTE:
 * WebView timers (`setInterval`, `setTimeout`) are inherently unreliable on desktop OSes
 * when the application is minimized or suspended to save battery.
 * To guarantee exhaustion-proof reliability for nurses, we hand off the scheduled time
 * to the native OS via the Tauri notification plugin's `Schedule.at()` API.
 *
 * This keeps TypeScript as the scheduling authority (we compute the time here),
 * while letting the OS handle the delivery when the webview is asleep.
 *
 * On Web: We do nothing here, because the existing `use-alarm-scheduler` loop
 * handles the real-time firing for browser tabs.
 */
export async function scheduleShiftAlarm(
  trigger: AlarmTrigger,
  title: string,
  body: string
): Promise<void> {
  if (!isNativeNotificationsSupported()) return;

  try {
    const granted = await isPermissionGranted();
    if (!granted) return;

    // Use the composite ID as the string channel or we just rely on OS.
    // The plugin expects a unique ID if we want to cancel it, but it takes a number.
    // We can just use the schedule API.
    // Actually, `cancelAll()` clears all pending, and we only have 1-2 alarms at most.
    
    // First, clear any previously scheduled alarms to avoid duplicates
    await cancelAll();

    // Schedule the new alarm
    sendNotification({
      title,
      body,
      schedule: Schedule.at(trigger.fire),
      sound: "default", // Plays the default OS notification sound
    });
    
  } catch (error) {
    console.error("Failed to schedule native notification:", error);
  }
}

/**
 * Cancels all scheduled shift alarms.
 * On Web: Handled implicitly by `use-alarm-scheduler` state.
 */
export async function cancelShiftAlarm(): Promise<void> {
  if (!isNativeNotificationsSupported()) return;
  try {
    await cancelAll();
  } catch (error) {
    console.error("Failed to cancel native notification:", error);
  }
}

/**
 * Triggers an immediate test notification to verify OS settings.
 */
export async function triggerTestAlarm(title: string, body: string): Promise<boolean> {
  if (isNativeNotificationsSupported()) {
    try {
      const granted = await isPermissionGranted();
      if (!granted) return false;
      
      sendNotification({
        title,
        body,
        sound: "default",
      });
      return true;
    } catch (e) {
      console.error("Test native notification failed:", e);
      return false;
    }
  } else if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, tag: "shiftflow-test" });
      return true;
    }
  }
  return false;
}
