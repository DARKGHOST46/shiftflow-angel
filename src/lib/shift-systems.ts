import type { TKey } from "@/lib/i18n";

export type SlotKind = "shift24" | "day" | "night" | "rest";

export interface ShiftSlot {
  kind: SlotKind;
  startHour: number;
  startMinute: number;
  durationH: number;
  labelKey: TKey;
  /** CSS var or color token (without var()) used for accents. */
  colorVar: string;
}

export type SystemId = "24h_4rest" | "8d_16n_3rest" | "12_12_2rest";

export interface ShiftSystem {
  id: SystemId;
  nameKey: TKey;
  descKey: TKey;
  cycleLength: number;
  pattern: ShiftSlot[];
}

const REST: ShiftSlot = {
  kind: "rest",
  startHour: 0,
  startMinute: 0,
  durationH: 0,
  labelKey: "rest",
  colorVar: "--rest",
};

export const SHIFT_SYSTEMS: Record<SystemId, ShiftSystem> = {
  "24h_4rest": {
    id: "24h_4rest",
    nameKey: "sys24h",
    descKey: "sys24hDesc",
    cycleLength: 5,
    pattern: [
      {
        kind: "shift24",
        startHour: 8,
        startMinute: 30,
        durationH: 24,
        labelKey: "shiftDay",
        colorVar: "--shift",
      },
      REST,
      REST,
      REST,
      REST,
    ],
  },
  "8d_16n_3rest": {
    id: "8d_16n_3rest",
    nameKey: "sys8d16n",
    descKey: "sys8d16nDesc",
    cycleLength: 5,
    pattern: [
      {
        kind: "day",
        startHour: 8,
        startMinute: 0,
        durationH: 8,
        labelKey: "dayShift",
        colorVar: "--shift",
      },
      {
        kind: "night",
        startHour: 16,
        startMinute: 0,
        durationH: 16,
        labelKey: "nightShift",
        colorVar: "--accent",
      },
      REST,
      REST,
      REST,
    ],
  },
  "12_12_2rest": {
    id: "12_12_2rest",
    nameKey: "sys12h",
    descKey: "sys12hDesc",
    cycleLength: 4,
    pattern: [
      {
        kind: "day",
        startHour: 8,
        startMinute: 0,
        durationH: 12,
        labelKey: "dayShift",
        colorVar: "--shift",
      },
      {
        kind: "night",
        startHour: 20,
        startMinute: 0,
        durationH: 12,
        labelKey: "nightShift",
        colorVar: "--accent",
      },
      REST,
      REST,
    ],
  },
};

export const SYSTEM_LIST: ShiftSystem[] = Object.values(SHIFT_SYSTEMS);

export function getSystem(id: SystemId): ShiftSystem {
  return SHIFT_SYSTEMS[id] ?? SHIFT_SYSTEMS["24h_4rest"];
}
