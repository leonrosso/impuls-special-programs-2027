import { daysUntil } from "./urgency";
import type { ProgramRow } from "./types";

export type ReminderDays = 1 | 3 | 7;

const DEFAULT_DAYS_KEY = "impuls-2027-notify-default-days";
const SUBS_KEY = "impuls-2027-notify-subs";
const FIRED_KEY = "impuls-2027-notify-fired";

export const DEFAULT_REMINDER_DAYS: ReminderDays = 7;

export function eventKey(row: ProgramRow): string {
  return `${row.title}__${row.deadlineRaw}`;
}

export function getDefaultReminderDays(): ReminderDays {
  const raw = safeGet(DEFAULT_DAYS_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_REMINDER_DAYS;
  if (parsed === 1 || parsed === 3 || parsed === 7) return parsed;
  return DEFAULT_REMINDER_DAYS;
}

export function setDefaultReminderDays(days: ReminderDays): void {
  safeSet(DEFAULT_DAYS_KEY, String(days));
}

export function getSubscriptions(): Set<string> {
  const raw = safeGet(SUBS_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {
    // ignore malformed cache
  }
  return new Set();
}

function saveSubscriptions(subs: Set<string>): void {
  safeSet(SUBS_KEY, JSON.stringify(Array.from(subs)));
}

export function isSubscribed(row: ProgramRow): boolean {
  return getSubscriptions().has(eventKey(row));
}

export function toggleSubscription(row: ProgramRow): boolean {
  const subs = getSubscriptions();
  const key = eventKey(row);
  let nowSubscribed: boolean;
  if (subs.has(key)) {
    subs.delete(key);
    nowSubscribed = false;
  } else {
    subs.add(key);
    nowSubscribed = true;
    clearFired(key);
  }
  saveSubscriptions(subs);
  return nowSubscribed;
}

function getFired(): Set<string> {
  const raw = safeGet(FIRED_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {
    // ignore malformed cache
  }
  return new Set();
}

function saveFired(fired: Set<string>): void {
  safeSet(FIRED_KEY, JSON.stringify(Array.from(fired)));
}

function clearFired(key: string): void {
  const fired = getFired();
  if (fired.delete(key)) saveFired(fired);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

async function showNotification(title: string, body: string): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: "/icon.svg",
          badge: "/icon.svg",
        });
        return;
      }
    }
  } catch {
    // fall through to plain Notification
  }

  try {
    new Notification(title, { body, icon: "/icon.svg" });
  } catch {
    // notifications unsupported in this context — nothing more we can do
  }
}

/**
 * Fires a reminder for every subscribed event whose deadline is within the
 * configured reminder window and hasn't already fired. Meant to be called on
 * load and periodically while the app is open — there is no server-side push,
 * so reminders only reach the user while the PWA is running.
 */
export function checkAndFireReminders(rows: ProgramRow[]): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const subs = getSubscriptions();
  if (subs.size === 0) return;

  const fired = getFired();
  const reminderDays = getDefaultReminderDays();
  let changed = false;

  for (const row of rows) {
    if (!row.deadlineDate) continue;
    const key = eventKey(row);
    if (!subs.has(key) || fired.has(key)) continue;

    const remaining = daysUntil(row.deadlineDate);
    if (remaining >= 0 && remaining <= reminderDays) {
      showNotification(
        row.title,
        remaining === 0
          ? "Scade oggi."
          : `Scade tra ${remaining} giorno${remaining === 1 ? "" : "i"}.`,
      );
      fired.add(key);
      changed = true;
    }
  }

  if (changed) saveFired(fired);
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage can fail (quota, private mode) — not fatal.
  }
}
