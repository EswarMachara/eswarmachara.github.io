"use client";

import { useState } from "react";
import { FaCircleCheck, FaRegCalendarCheck } from "react-icons/fa6";
import { formatCountdown, formatDate, formatMonthYear } from "@/lib/phd/dates";
import { allDates } from "@/lib/phd/derive";
import type { DatedItem } from "@/lib/phd/derive";
import { INTERVIEW_MODE_LABELS } from "@/lib/phd/presets";
import type { TrackerState } from "@/lib/phd/types";
import { EmptyNote, GhostButton, SectionLabel, StatusChip } from "./ui";

/**
 * Urgency band for a date. Info-toned dates (a portal opening, an expected
 * decision) never take a red band: they are news, and colouring them like a
 * missed deadline trains you to ignore the colour.
 */
function band(item: DatedItem) {
  if (item.tone === "info") {
    if (item.days < 0) return { label: "Passed", ring: "border-stone-200 bg-paper-raised/40", dot: "bg-stone-400", text: "text-ink-soft" };
    if (item.days <= 7) return { label: "This week", ring: "border-track-interview/30 bg-track-interview/5", dot: "bg-track-interview", text: "text-track-interview" };
    return { label: "Ahead", ring: "border-stone-200 bg-paper-raised/40", dot: "bg-stone-300", text: "text-ink-soft" };
  }
  if (item.days < 0) return { label: "Overdue", ring: "border-track-rejected/40 bg-track-rejected/8", dot: "bg-track-rejected", text: "text-track-rejected" };
  if (item.days <= 7) return { label: "Critical", ring: "border-track-rejected/35 bg-track-rejected/5", dot: "bg-track-rejected", text: "text-track-rejected" };
  if (item.days <= 14) return { label: "Urgent", ring: "border-gold/50 bg-gold/8", dot: "bg-gold-deep", text: "text-gold-deep" };
  if (item.days <= 30) return { label: "Soon", ring: "border-gold/30 bg-gold/4", dot: "bg-gold", text: "text-gold-deep" };
  return { label: "Later", ring: "border-stone-200 bg-paper-raised/40", dot: "bg-stone-300", text: "text-ink-soft" };
}

function DateRow({ item, onOpen }: { item: DatedItem; onOpen: () => void }) {
  const tone = band(item);
  const clock = item.interview ? [item.interview.time, item.interview.timezone].filter(Boolean).join(" ") : "";

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors hover:border-ink/30 ${tone.ring}`}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {item.lead.university}
            {item.lead.lab && <span className="font-normal text-ink-soft"> · {item.lead.lab}</span>}
          </p>
          <p className="truncate text-xs text-ink-soft">
            {item.label}
            {clock && ` · ${clock}`}
            {item.interview && ` · ${INTERVIEW_MODE_LABELS[item.interview.mode]}`}
            {!item.interview && item.lead.program && ` · ${item.lead.program}`}
          </p>
        </div>

        <div className="hidden shrink-0 sm:block">
          <StatusChip status={item.lead.status} />
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-sm font-medium tabular-nums ${tone.text}`}>
            {item.days === 0 ? "Today" : formatCountdown(item.days)}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-ink-soft">{formatDate(item.date)}</p>
        </div>
      </button>
    </li>
  );
}

export default function DeadlinesView({
  state,
  onOpenLead,
}: {
  state: TrackerState;
  onOpenLead: (id: string) => void;
}) {
  const [showPast, setShowPast] = useState(false);
  const [pressureOnly, setPressureOnly] = useState(false);

  const everything = allDates(state.leads);
  const visible = pressureOnly ? everything.filter((item) => item.tone === "pressure") : everything;
  const upcoming = visible.filter((item) => item.days >= 0);
  const past = visible.filter((item) => item.days < 0);

  const counts = {
    critical: upcoming.filter((item) => item.tone === "pressure" && item.days <= 7).length,
    urgent: upcoming.filter((item) => item.tone === "pressure" && item.days <= 14).length,
    month: upcoming.filter((item) => item.days <= 30).length,
    total: upcoming.length,
  };

  // Group the upcoming feed by calendar month so a long season stays readable.
  const months = new Map<string, DatedItem[]>();
  for (const item of upcoming) {
    const key = item.date.slice(0, 7);
    const bucket = months.get(key);
    if (bucket) bucket.push(item);
    else months.set(key, [item]);
  }

  if (everything.length === 0) {
    return (
      <EmptyNote>
        No dates on any open application yet. Add a deadline, a portal opening date or an interview slot and
        everything lands here in one ordered feed.
      </EmptyNote>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { label: "Critical, 7 days", value: counts.critical, tone: "bg-track-rejected/10 text-track-rejected" },
          { label: "Urgent, 14 days", value: counts.urgent, tone: "bg-gold/12 text-gold-deep" },
          { label: "This month", value: counts.month, tone: "bg-track-interview/10 text-track-interview" },
          { label: "Upcoming", value: counts.total, tone: "bg-stone-100 text-ink-soft" },
        ].map((chip) => (
          <span key={chip.label} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${chip.tone}`}>
            <span className="font-bold tabular-nums">{chip.value}</span> {chip.label}
          </span>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-md border border-stone-200 bg-paper px-3 py-1.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={pressureOnly}
            onChange={(event) => setPressureOnly(event.target.checked)}
            className="accent-wine"
          />
          Deadlines only
        </label>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-paper-raised/40 px-6 py-14 text-center">
          <FaCircleCheck size={30} className="mx-auto text-track-offer" />
          <p className="mt-4 font-heading text-xl font-medium text-ink">Nothing ahead of you</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            No upcoming dates on any open application. Either you are genuinely clear, or some dates still need
            filling in.
          </p>
        </div>
      ) : (
        [...months.entries()].map(([month, items]) => (
          <section key={month}>
            <SectionLabel action={<span className="text-xs text-ink-soft">{items.length} dates</span>}>
              {formatMonthYear(`${month}-01`)}
            </SectionLabel>
            <ul className="space-y-2">
              {items.map((item) => (
                <DateRow
                  key={`${item.lead.id}-${item.kind}-${item.interview?.id ?? item.date}`}
                  item={item}
                  onOpen={() => onOpenLead(item.lead.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {past.length > 0 && (
        <section>
          <GhostButton onClick={() => setShowPast((value) => !value)}>
            <FaRegCalendarCheck size={11} />
            {showPast ? "Hide" : "Show"} {past.length} past date{past.length === 1 ? "" : "s"}
          </GhostButton>
          {showPast && (
            <ul className="mt-3 space-y-2">
              {past.map((item) => (
                <DateRow
                  key={`past-${item.lead.id}-${item.kind}-${item.interview?.id ?? item.date}`}
                  item={item}
                  onOpen={() => onOpenLead(item.lead.id)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
