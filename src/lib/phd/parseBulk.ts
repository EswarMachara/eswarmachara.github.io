import { parseISODate } from "./dates";
import type { BulkLeadRow } from "./store";

export interface ParsedBulk {
  rows: BulkLeadRow[];
  /** Lines that produced nothing usable, reported back so nothing is dropped silently. */
  skipped: { line: number; text: string; reason: string }[];
}

const SEPARATORS = ["\t", ";", "|", ","];

/** Splits on whichever supported separator the line actually uses. */
function splitLine(line: string): string[] {
  const separator = SEPARATORS.find((candidate) => line.includes(candidate));
  if (!separator) return [line];
  return line.split(separator).map((cell) => cell.trim());
}

/**
 * Turns a pasted block into leads. One line per programme, columns in the order
 * university, programme, country, deadline, with any of tab, semicolon, pipe or
 * comma as the separator. Only the first column is required, so a bare list of
 * university names is valid input.
 */
export function parseBulk(input: string): ParsedBulk {
  const rows: BulkLeadRow[] = [];
  const skipped: ParsedBulk["skipped"] = [];

  input.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (line === "") return;

    const cells = splitLine(line);
    const university = cells[0]?.trim() ?? "";
    if (university === "") {
      skipped.push({ line: index + 1, text: line, reason: "no university name in the first column" });
      return;
    }

    // Skip a header row rather than turning it into a lead.
    if (/^(university|school|institution|name)$/i.test(university)) {
      skipped.push({ line: index + 1, text: line, reason: "looks like a header row" });
      return;
    }

    const deadlineCell = cells[3]?.trim() ?? "";
    let deadline: string | undefined;
    if (deadlineCell !== "") {
      if (parseISODate(deadlineCell)) {
        deadline = deadlineCell;
      } else {
        // Keep the lead, drop only the unreadable date, and say so.
        skipped.push({
          line: index + 1,
          text: deadlineCell,
          reason: "date not in YYYY-MM-DD form, lead added without it",
        });
      }
    }

    rows.push({
      university,
      program: cells[1]?.trim() || undefined,
      country: cells[2]?.trim() || undefined,
      deadline,
    });
  });

  return { rows, skipped };
}
