import { formatDateTime } from "../urgency";

interface Props {
  lastUpdated: Date | null;
}

export function OfflineBanner({ lastUpdated }: Props) {
  return (
    <div className="offline-banner" role="status">
      Dati offline — ultimo aggiornamento:{" "}
      {lastUpdated ? formatDateTime(lastUpdated) : "sconosciuto"}
    </div>
  );
}
