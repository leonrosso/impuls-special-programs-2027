import { useEffect, useState } from "react";
import { CSV_URL, parseCsv } from "./csv";
import type { ProgramRow } from "./types";

const CACHE_TEXT_KEY = "impuls-2027-csv-cache";
const CACHE_TIME_KEY = "impuls-2027-csv-cache-time";

interface DeadlinesState {
  rows: ProgramRow[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  lastUpdated: Date | null;
}

export function useDeadlines(): DeadlinesState {
  const [state, setState] = useState<DeadlinesState>({
    rows: [],
    loading: true,
    error: null,
    isOffline: false,
    lastUpdated: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(CSV_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Richiesta fallita con stato ${response.status}`);
        }
        const text = await response.text();
        const now = new Date();

        try {
          localStorage.setItem(CACHE_TEXT_KEY, text);
          localStorage.setItem(CACHE_TIME_KEY, now.toISOString());
        } catch {
          // localStorage can fail (quota, private mode) — not fatal.
        }

        if (cancelled) return;
        setState({
          rows: parseCsv(text),
          loading: false,
          error: null,
          isOffline: false,
          lastUpdated: now,
        });
      } catch (fetchError) {
        if (cancelled) return;

        const cachedText = safeGetItem(CACHE_TEXT_KEY);
        const cachedTime = safeGetItem(CACHE_TIME_KEY);

        if (cachedText) {
          setState({
            rows: parseCsv(cachedText),
            loading: false,
            error: null,
            isOffline: true,
            lastUpdated: cachedTime ? new Date(cachedTime) : null,
          });
        } else {
          console.error("[deadlines] fetch fallito e nessuna cache disponibile", fetchError);
          setState({
            rows: [],
            loading: false,
            error: "Impossibile caricare le scadenze e nessun dato offline disponibile.",
            isOffline: false,
            lastUpdated: null,
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
