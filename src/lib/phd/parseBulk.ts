import { parseISODate } from "./dates";
import type { BulkLeadRow } from "./store";

export interface ParsedBulk {
  rows: BulkLeadRow[];
  /** Lines that produced nothing usable, reported back so nothing is dropped silently. */
  skipped: { line: number; text: string; reason: string }[];
}

const SEPARATORS = ["\t", ";", "|", ","];

/**
 * Picks one separator for the whole pasted block.
 *
 * Choosing per line meant "University of California, Berkeley" split on its own
 * comma: the name was truncated to "University of California" and "Berkeley"
 * was invented as the programme. Deciding once, and preferring the unambiguous
 * separators over the comma, keeps a comma inside a name intact unless the
 * block genuinely uses commas as columns.
 */
function chooseSeparator(lines: string[]): string | null {
  for (const candidate of SEPARATORS) {
    if (candidate === ",") continue;
    if (lines.some((line) => line.includes(candidate))) return candidate;
  }
  // The comma is the risky one, because it occurs inside real names
  // ("University of California, Berkeley"). Accept it as a separator only when
  // the whole block looks like a genuine CSV: every line has one, every line
  // splits to the same width, and that width is at least three. A two-column
  // comma line is far more likely a place name than a table row.
  if (lines.length === 0) return null;
  if (!lines.every((line) => line.includes(","))) return null;
  const widths = new Set(lines.map((line) => line.split(",").length));
  if (widths.size !== 1) return null;
  return [...widths][0] >= 3 ? "," : null;
}

function splitLine(line: string, separator: string | null): string[] {
  if (!separator || !line.includes(separator)) return [line.trim()];
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

  const lines = input.split(/\r?\n/);
  const separator = chooseSeparator(lines.map((line) => line.trim()).filter((line) => line !== ""));

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line === "") return;

    const cells = splitLine(line, separator);
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
