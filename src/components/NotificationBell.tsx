import { useEffect, useRef, useState } from "react";
import type { ProgramRow } from "../types";
import type { ReminderDays } from "../notifications";

interface Props {
  row: ProgramRow;
  subscribed: boolean;
  reminderDays: ReminderDays;
  permission: NotificationPermission;
  supported: boolean;
  onToggle: (row: ProgramRow) => Promise<boolean>;
}

export function NotificationBell({
  row,
  subscribed,
  reminderDays,
  permission,
  supported,
  onToggle,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!supported) return null;

  async function handleClick() {
    const nowSubscribed = await onToggle(row);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!nowSubscribed) {
      setMessage(null);
      return;
    }

    if (permission === "denied" || Notification.permission === "denied") {
      setMessage("Notifiche bloccate dal browser: abilitale nelle impostazioni del sito.");
    } else {
      setMessage(
        `Promemoria impostato: te lo ricorderò ${reminderDays} giorn${reminderDays === 1 ? "o" : "i"} prima (default).`,
      );
    }
    timeoutRef.current = setTimeout(() => setMessage(null), 4000);
  }

  return (
    <div className="notify">
      <button
        type="button"
        className={`icon-button notify__bell${subscribed ? " notify__bell--active" : ""}`}
        onClick={handleClick}
        aria-pressed={subscribed}
        aria-label={subscribed ? "Disattiva promemoria per questo evento" : "Attiva promemoria per questo evento"}
        title={subscribed ? "Promemoria attivo" : "Attiva promemoria"}
      >
        <BellIcon filled={subscribed} />
      </button>
      {message && <p className="notify__message">{message}</p>}
    </div>
  );
}

function BellIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 3.5c-3 0-4.6 2.1-4.6 4.9v2.7c0 .9-.3 1.7-.9 2.5l-.9 1.2c-.5.7 0 1.7.9 1.7h11c.9 0 1.4-1 .9-1.7l-.9-1.2c-.6-.8-.9-1.6-.9-2.5V8.4c0-2.8-1.6-4.9-4.6-4.9Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
