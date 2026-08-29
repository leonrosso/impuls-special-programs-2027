import { useState } from "react";
import type { ProgramRow } from "../types";
import { formatDate, getUrgency } from "../urgency";
import type { NotificationsState } from "../useNotifications";
import { DescriptionModal } from "./DescriptionModal";
import { NotificationBell } from "./NotificationBell";

interface Props {
  row: ProgramRow;
  notifications: NotificationsState;
}

const URGENCY_LABEL: Record<string, string> = {
  urgent: "Entro 7 giorni",
  soon: "Entro 30 giorni",
  neutral: "In programma",
  past: "Scaduta",
};

export function ProgramCard({ row, notifications }: Props) {
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const urgency = row.deadlineDate ? getUrgency(row.deadlineDate) : null;
  const subscribed = notifications.subscriptions.has(`${row.title}__${row.deadlineRaw}`);

  return (
    <article className={`card${urgency === "past" ? " card--past" : ""}`}>
      <header className="card__header">
        <div className="card__heading">
          <h2 className="card__title">{row.title}</h2>
          {row.coach && <p className="card__coach">{row.coach}</p>}
        </div>
        <div className="card__actions">
          <NotificationBell
            row={row}
            subscribed={subscribed}
            reminderDays={notifications.reminderDays}
            permission={notifications.permission}
            supported={notifications.supported}
            onToggle={notifications.toggleSubscription}
          />
          {row.description && (
            <button
              type="button"
              className="icon-button card__expand"
              onClick={() => setDescriptionOpen(true)}
              aria-label="Leggi la descrizione completa"
              title="Leggi la descrizione completa"
            >
              +
            </button>
          )}
        </div>
      </header>

      <div className="card__deadline">
        {row.deadlineDate ? (
          <span className={`badge badge--${urgency}`}>
            {formatDate(row.deadlineDate)}
            <em>{URGENCY_LABEL[urgency ?? "neutral"]}</em>
          </span>
        ) : (
          <span className="badge badge--none">{row.deadlineRaw || "Nessuna data indicata"}</span>
        )}
      </div>

      {(row.decision || row.deadline2) && (
        <dl className="card__secondary">
          {row.decision && (
            <div>
              <dt>Decision</dt>
              <dd>{row.decision}</dd>
            </div>
          )}
          {row.deadline2 && (
            <div>
              <dt>Deadline 2</dt>
              <dd>{row.deadline2}</dd>
            </div>
          )}
        </dl>
      )}

      <p className="card__equivalent">
        Equivalent: <strong>{row.equivalentHours}</strong> h/lezione
      </p>

      {descriptionOpen && (
        <DescriptionModal
          title={row.title}
          description={row.description}
          onClose={() => setDescriptionOpen(false)}
        />
      )}
    </article>
  );
}
