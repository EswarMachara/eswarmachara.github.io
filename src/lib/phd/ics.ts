import { addDays, parseISODate, toISODate } from "./dates";
import { allDates, isActive, isFiled, milestonesFor } from "./derive";
import { INTERVIEW_MODE_LABELS } from "./presets";
import type { Lead, TrackerState } from "./types";

/** RFC 5545 wants CRLF line breaks and lines folded at 75 octets. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest.length > 0) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stampNow(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function compact(value: string): string {
  return value.replace(/-/g, "");
}

/**
 * Builds a calendar feed of every live deadline plus the internal milestones
 * worked back from it, so the dates exist somewhere other than this page.
 * All-day events, since application deadlines carry their own local cutoffs
 * that a timed event would misrepresent.
 */
function allDayEvent(options: {
  uid: string;
  stamp: string;
  date: string;
  summary: string;
  description?: string;
  url?: string;
}): string[] {
  const start = parseISODate(options.date);
  if (!start) return [];
  // DTEND is exclusive for all-day events, so it points at the following day.
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);

  return [
    "BEGIN:VEVENT",
    `UID:${options.uid}@phd-bench`,
    `DTSTAMP:${options.stamp}`,
    `DTSTART;VALUE=DATE:${compact(options.date)}`,
    `DTEND;VALUE=DATE:${compact(toISODate(end))}`,
    fold(`SUMMARY:${escapeText(options.summary)}`),
    options.description ? fold(`DESCRIPTION:${escapeText(options.description)}`) : "",
    options.url ? fold(`URL:${escapeText(options.url)}`) : "",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ].filter((line) => line !== "");
}

function contextFor(lead: Lead): string {
  return [
    lead.program ? `Programme: ${lead.program}` : "",
    lead.lab ? `Lab: ${lead.lab}` : "",
    lead.intake ? `Intake: ${lead.intake}` : "",
    lead.portalUrl ? `Portal: ${lead.portalUrl}` : "",
    lead.programUrl ? `Programme page: ${lead.programUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCalendar(state: TrackerState): string {
  const stamp = stampNow();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PhD Bench//Tracker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:PhD applications",
  ];

  // The derived milestones (ask referees by, first draft by) still come from the
  // deadline, but every other date now arrives through the same unified feed the
  // Deadlines view reads, so the two can never disagree about what exists.
  for (const lead of state.leads) {
    if (!lead.deadline || lead.deadlineKind === "rolling") continue;
    if (!isActive(lead.status) || isFiled(lead.status)) continue;
    const where = [lead.university, lead.lab || lead.program].filter(Boolean).join(", ");

    for (const milestone of milestonesFor(lead, state.settings)) {
      // The deadline itself is emitted by the feed loop below.
      if (milestone.offset === 0) continue;
      const eventDate = addDays(lead.deadline, milestone.offset);
      if (!eventDate) continue;
      lines.push(
        ...allDayEvent({
          uid: `${lead.id}-${milestone.offset}`,
          stamp,
          date: eventDate,
          summary: `${milestone.label.replace(/ by$/, "")}: ${where}`,
          description: contextFor(lead),
          url: lead.programUrl,
        }),
      );
    }
  }

  for (const item of allDates(state.leads)) {
    const { lead, kind, interview } = item;
    const where = [lead.university, lead.lab || lead.program].filter(Boolean).join(", ");
    const clock = interview ? [interview.time, interview.timezone].filter(Boolean).join(" ") : "";

    const summary =
      kind === "deadline"
        ? `Deadline: ${where}`
        : kind === "opens"
          ? `Portal opens: ${where}`
          : kind === "lor"
            ? `Letters due: ${where}`
            : kind === "interview"
              ? `Interview: ${where}${clock ? ` (${clock})` : ""}`
              : kind === "decision"
                ? `Decision expected: ${where}`
                : `Reply to offer: ${where}`;

    const extra =
      kind === "interview" && interview
        ? [
            clock ? `Scheduled for ${clock}` : "",
            `Format: ${INTERVIEW_MODE_LABELS[interview.mode]}`,
            interview.withWhom ? `With: ${interview.withWhom}` : "",
            interview.prepNotes ? `Prep: ${interview.prepNotes}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        : "";

    lines.push(
      ...allDayEvent({
        // Interviews are keyed by their own id so several slots stay distinct.
        uid: interview ? `${lead.id}-interview-${interview.id}` : `${lead.id}-${kind}`,
        stamp,
        date: item.date,
        summary,
        description: [extra, contextFor(lead)].filter(Boolean).join("\n"),
        url: lead.portalUrl ?? lead.programUrl,
      }),
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter((line) => line !== "").join("\r\n");
}
