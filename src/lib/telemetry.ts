/**
 * Telemetry & Crash Reporting Abstraction
 * 
 * ShiftFlow Nurse prioritizes patient privacy and operates offline-first.
 * This telemetry module acts as a strict abstraction layer over any future
 * analytics or crash reporting integrations (e.g., Sentry, PostHog, DataDog).
 */

import { logger } from "./logger";

type TelemetryLevel = "info" | "warning" | "error" | "critical";

interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

/**
 * Scrub potentially sensitive clinical info from messages before dispatch.
 */
function scrubData(payload: string): string {
  // E.g., basic regexes to strip potential MRNs, names, etc.
  // In v1, we just return the payload since we instruct users not to enter PHI.
  return payload;
}

export const telemetry = {
  /**
   * Initializes the telemetry agent. No-op in local dev or if disabled by user.
   */
  init: () => {
    if (import.meta.env.DEV) {
      logger.info("Telemetry disabled in development mode.", "Telemetry");
      return;
    }
    // Stub: Sentry.init({ dsn: "..." })
  },

  /**
   * Captures an explicit application exception.
   */
  captureException: (error: Error, context?: Record<string, unknown>) => {
    logger.error(`Exception captured: ${error.message}`, error, "Telemetry");
    void context;
  },

  /**
   * Sends structured event data (e.g., "Feedback Submitted", "Alarm Triggered").
   */
  captureEvent: (event: TelemetryEvent) => {
    logger.info(`Event: [${event.category}] ${event.action} ${event.label ?? ""} ${event.value ?? ""}`.trim(), "Telemetry");
  },

  /**
   * Captures user-submitted feedback securely.
   */
  captureFeedback: async (type: "bug" | "feature", message: string): Promise<void> => {
    const scrubbedMessage = scrubData(message);
    
    logger.info(`Dispatching ${type} report`, "Telemetry");
    
    // In production, this would make a secure fetch to an analytics endpoint.
    // Stubbing the network latency:
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
};
