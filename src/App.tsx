import { useMemo, useState } from "react";
import { OfflineBanner } from "./components/OfflineBanner";
import { ProgramCard } from "./components/ProgramCard";
import { SearchBar } from "./components/SearchBar";
import { useDeadlines } from "./useDeadlines";

function App() {
  const { rows, loading, error, isOffline, lastUpdated } = useDeadlines();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) || row.coach.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const { withDate, withoutDate } = useMemo(() => {
    const withDate = filtered
      .filter((row) => row.deadlineDate)
      .sort((a, b) => a.deadlineDate!.getTime() - b.deadlineDate!.getTime());
    const withoutDate = filtered.filter((row) => !row.deadlineDate);
    return { withDate, withoutDate };
  }, [filtered]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>impuls Academy 2027</h1>
        <p className="app__subtitle">Special Programs — scadenze</p>
      </header>

      {isOffline && <OfflineBanner lastUpdated={lastUpdated} />}

      <SearchBar value={query} onChange={setQuery} />

      {loading && <p className="status-message">Caricamento scadenze…</p>}
      {error && <p className="status-message status-message--error">{error}</p>}

      {!loading && !error && (
        <>
          {filtered.length === 0 && (
            <p className="status-message">Nessun risultato per "{query}".</p>
          )}

          {withDate.length > 0 && (
            <section className="program-list">
              {withDate.map((row, i) => (
                <ProgramCard key={`${row.title}-${i}`} row={row} />
              ))}
            </section>
          )}

          {withoutDate.length > 0 && (
            <section className="program-list-section">
              <h2 className="section-title">
                Senza scadenza fissa — preannuncia il tuo interesse
              </h2>
              <section className="program-list">
                {withoutDate.map((row, i) => (
                  <ProgramCard key={`${row.title}-nodate-${i}`} row={row} />
                ))}
              </section>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;
