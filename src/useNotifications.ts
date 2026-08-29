import { useCallback, useEffect, useState } from "react";
import type { ProgramRow } from "./types";
import {
  checkAndFireReminders,
  getDefaultReminderDays,
  getSubscriptions,
  requestNotificationPermission,
  setDefaultReminderDays as persistDefaultReminderDays,
  toggleSubscription as persistToggleSubscription,
  type ReminderDays,
} from "./notifications";

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export interface NotificationsState {
  supported: boolean;
  permission: NotificationPermission;
  reminderDays: ReminderDays;
  subscriptions: Set<string>;
  setReminderDays: (days: ReminderDays) => void;
  toggleSubscription: (row: ProgramRow) => Promise<boolean>;
}

export function useNotifications(rows: ProgramRow[]): NotificationsState {
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : "denied",
  );
  const [reminderDays, setReminderDaysState] = useState<ReminderDays>(getDefaultReminderDays);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(getSubscriptions);

  useEffect(() => {
    if (!supported || permission !== "granted" || rows.length === 0) return;

    checkAndFireReminders(rows);
    const interval = setInterval(() => checkAndFireReminders(rows), CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") checkAndFireReminders(rows);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [supported, permission, rows]);

  const setReminderDays = useCallback((days: ReminderDays) => {
    persistDefaultReminderDays(days);
    setReminderDaysState(days);
  }, []);

  const toggleSubscription = useCallback(
    async (row: ProgramRow) => {
      if (supported && Notification.permission === "default") {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result !== "granted") return isCurrentlySubscribed(row);
      }

      const nowSubscribed = persistToggleSubscription(row);
      setSubscriptions(getSubscriptions());
      return nowSubscribed;
    },
    [supported],
  );

  return { supported, permission, reminderDays, subscriptions, setReminderDays, toggleSubscription };
}

function isCurrentlySubscribed(row: ProgramRow): boolean {
  return getSubscriptions().has(`${row.title}__${row.deadlineRaw}`);
}
