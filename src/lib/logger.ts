/**
 * Production Observability Logger
 * 
 * Strict requirement: NO PHI, NO clinical data, NO personal nurse inputs.
 * This is solely for application lifecycle events and unhandled exceptions.
 */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: string;
  error?: Error | unknown;
  // Intentionally omitting user/session identifiers for PHI safety.
}

class Logger {
  private log(level: LogLevel, payload: LogPayload) {
    // In development, log colorfully to console
    if (import.meta.env.DEV) {
      const tag = `[ShiftFlow:${payload.context || "App"}]`;
      if (level === "error") {
        console.error(tag, payload.message, payload.error || "");
      } else if (level === "warn") {
        console.warn(tag, payload.message);
      } else {
        console.info(tag, payload.message);
      }
    }

    // In production, format gracefully for Datadog/Sentry (placeholder)
    if (import.meta.env.PROD) {
      // Safe telemetry placeholder
      // We stringify explicitly safe fields to prevent accidental object leakage.
      const safePayload = JSON.stringify({
        level,
        message: payload.message,
        context: payload.context,
        timestamp: new Date().toISOString(),
      });
      
      // Simulate telemetry dispatch
      // navigator.sendBeacon('/api/telemetry', safePayload);
      if (level === "error") {
        console.error("ShiftFlow SysErr:", safePayload);
      }
    }
  }

  info(message: string, context?: string) {
    this.log("info", { message, context });
  }

  warn(message: string, context?: string) {
    this.log("warn", { message, context });
  }

  error(message: string, error?: unknown, context?: string) {
    this.log("error", { message, error, context });
  }
}

export const logger = new Logger();
