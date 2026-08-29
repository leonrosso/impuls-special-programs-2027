import { useState } from "react";
import type { ProgramRow } from "../types";
import { formatDate, getUrgency } from "../urgency";

interface Props {
  row: ProgramRow;
}

const URGENCY_LABEL: Record<string, string> = {
  urgent: "Entro 7 giorni",
  soon: "Entro 30 giorni",
  neutral: "In programma",
  past: "Scaduta",
};

export function ProgramCard({ row }: Props) {
  const [expanded, setExpanded] = useState(false);

  const urgency = row.deadlineDate ? getUrgency(row.deadlineDate) : null;

  return (
    <article className={`card${urgency === "past" ? " card--past" : ""}`}>
      <header className="card__header">
        <h2 className="card__title">{row.title}</h2>
        {row.coach && <p className="card__coach">{row.coach}</p>}
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

      {row.description && (
        <div className="card__description">
          <p className={expanded ? "" : "clamp-2"}>{row.description}</p>
          <button
            type="button"
            className="card__toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "mostra meno" : "leggi tutto"}
          </button>
        </div>
      )}
    </article>
  );
}
