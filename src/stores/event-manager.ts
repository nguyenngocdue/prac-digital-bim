"use client";
import { signal } from "@preact/signals-react";

export type AppEvent = {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
  source?: string;
};

const MAX_EVENTS = 200;

export const eventLog = signal<AppEvent[]>([]);
export const lastEvent = signal<AppEvent | null>(null);

export const emitEvent = (event: Omit<AppEvent, "timestamp">) => {
  const next = { ...event, timestamp: Date.now() };
  lastEvent.value = next;
  const updated = [...eventLog.value, next];
  eventLog.value = updated.length > MAX_EVENTS ? updated.slice(-MAX_EVENTS) : updated;
};

export const clearEvents = () => {
  eventLog.value = [];
  lastEvent.value = null;
};
