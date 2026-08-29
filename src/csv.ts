import Papa from "papaparse";
import type { ProgramRow } from "./types";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRoJ5CF-FcDyBPkF_-LVqSKedKLh7DqIvj3uWv4xRXSzZxOfG-qvVVi2Sx5LCS6B9YdCYdQdxVUdw-k/pub?output=csv";

const EXPECTED_COLUMNS = 8;

/**
 * The source header row is malformed (an unquoted comma inside one column
 * title splits it into two tokens) and many rows carry a trailing comma
 * that produces a phantom empty 9th column. Both are known defects of the
 * published sheet, so we parse positionally (header: false) and never
 * trust papaparse's own header-derived keys.
 */
export function parseCsv(text: string): ProgramRow[] {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  // First row is the broken header — skip it.
  const dataRows = rows.slice(1);

  const parsed: ProgramRow[] = [];

  dataRows.forEach((row, idx) => {
    const filledCount = row.filter((cell) => cell && cell.trim() !== "").length;
    if (filledCount < EXPECTED_COLUMNS) {
      console.warn(
        `[csv] Riga ${idx + 2} ha meno di ${EXPECTED_COLUMNS} colonne valorizzate, mostrata comunque:`,
        row,
      );
    }

    const cell = (i: number) => (row[i] ?? "").trim();

    const title = cell(0);
    if (!title) return; // skip fully blank / phantom rows

    const deadlineRaw = cell(2);
    const equivalentRaw = cell(6);
    const equivalentHours = Number.parseInt(equivalentRaw, 10);

    parsed.push({
      title,
      coach: cell(1),
      deadlineRaw,
      deadlineDate: parseLeadingDate(deadlineRaw),
      zoomMeetings: cell(3),
      decision: cell(4),
      deadline2: cell(5),
      equivalentHours: Number.isFinite(equivalentHours) ? equivalentHours : 0,
      description: cell(7),
    });
  });

  return parsed;
}

/**
 * Extracts a DD.MM.YYYY date anchored at the start of a raw cell.
 * Returns null for free-text cells (no fixed deadline) and for dates that
 * fail to parse or land on an implausible year — e.g. the known "20.10.20216"
 * typo in the source sheet — rather than throwing.
 */
export function parseLeadingDate(raw: string): Date | null {
  if (!raw) return null;
  const match = raw.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 2000 || year > 2100) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  // Guard against JS rolling over invalid days (e.g. 31.02) into another month.
  if (date.getMonth() !== month - 1) return null;

  return date;
}
