/**
 * Authentication & Sync Abstraction Layer
 * 
 * ShiftFlow Nurse is explicitly designed as an offline-first tool.
 * Currently, all users operate in "Guest Mode" implicitly.
 * 
 * Future roadmap (v2.0): Optional E2EE Cloud Sync for preferences/shifts.
 * This file serves as the abstraction boundary for those future implementations.
 */

export type UserMode = "guest" | "authenticated";

export interface UserSession {
  mode: UserMode;
  accountId?: string;
  lastSyncAt?: number;
}

export const auth = {
  getCurrentSession: (): UserSession => {
    // Hardcoded to guest for v1.0
    return {
      mode: "guest",
    };
  },

  syncStateToCloud: async (localData: unknown): Promise<void> => {
    // Stub: No-op for v1.0
    // In v2.0, this will encrypt localData with a master password derived key (E2EE)
    // before transmitting to the server.
    return Promise.resolve();
  },

  logout: async (): Promise<void> => {
    // No-op for v1.0
    return Promise.resolve();
  }
};
