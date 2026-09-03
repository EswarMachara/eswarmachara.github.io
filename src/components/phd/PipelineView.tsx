"use client";

import { daysUntil } from "@/lib/phd/dates";
import { readinessOf, sortLeads } from "@/lib/phd/derive";
import { BOARD_STATUSES, STATUS_META } from "@/lib/phd/presets";
import type { Lead, LeadStatus } from "@/lib/phd/types";
import { CountdownChip, PriorityDot, ReadinessBar } from "./ui";

function BoardCard({
  lead,
  onOpen,
  onMove,
}: {
  lead: Lead;
  onOpen: () => void;
  onMove: (next: LeadStatus) => void;
}) {
  const ready = readinessOf(lead);
  const days = daysUntil(lead.deadline);

  return (
    <li className="rounded-lg border border-stone-200 bg-paper p-3 transition-colors hover:border-gold/60">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-ink hover:text-wine">{lead.university}</p>
          <PriorityDot priority={lead.priority} />
        </div>
        {lead.program && <p className="mt-0.5 truncate text-xs text-ink-soft">{lead.program}</p>}
        <div className="mt-2.5">
          <CountdownChip days={days} kind={lead.deadlineKind} />
        </div>
        {ready.total > 0 && (
          <div className="mt-2.5">
            <ReadinessBar percent={ready.percent} done={ready.done} total={ready.total} />
          </div>
        )}
      </button>
      <select
        value={lead.status}
        onChange={(event) => onMove(event.target.value as LeadStatus)}
        aria-label={`Move ${lead.university} to another status`}
        className="mt-2.5 w-full rounded border border-stone-200 bg-paper-raised/60 px-2 py-1 text-[0.7rem] font-medium text-ink-soft"
      >
        {(Object.keys(STATUS_META) as LeadStatus[])
          .sort((a, b) => STATUS_META[a].order - STATUS_META[b].order)
          .map((status) => (
            <option key={status} value={status}>
              Move to {STATUS_META[status].label}
            </option>
          ))}
      </select>
    </li>
  );
}

export default function PipelineView({
  leads,
  onOpenLead,
  onMove,
}: {
  leads: Lead[];
  onOpenLead: (id: string) => void;
  onMove: (id: string, next: LeadStatus) => void;
}) {
  const ordered = sortLeads(leads);
  const closedOut = ordered.filter(
    (lead) => lead.status === "rejected" || lead.status === "declined" || lead.status === "withdrawn" || lead.status === "waitlisted",
  );

  return (
    <div className="space-y-8">
      <div className="-mx-5 overflow-x-auto px-5 pb-2">
        <div className="flex min-w-max gap-4">
          {BOARD_STATUSES.map((status) => {
            const column = ordered.filter((lead) => lead.status === status);
            return (
              <section key={status} className="w-64 shrink-0">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[status].chip.split(" ")[0]}`} aria-hidden="true" />
                    {STATUS_META[status].label}
                  </h3>
                  <span className="text-xs tabular-nums text-ink-soft">{column.length}</span>
                </div>
                {column.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-stone-200 px-3 py-6 text-center text-xs text-ink-soft/70">
                    Empty
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {column.map((lead) => (
                      <BoardCard
                        key={lead.id}
                        lead={lead}
                        onOpen={() => onOpenLead(lead.id)}
                        onMove={(next) => onMove(lead.id, next)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {closedOut.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">Closed out</h3>
          <ul className="flex flex-wrap gap-2">
            {closedOut.map((lead) => (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => onOpenLead(lead.id)}
                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-paper-raised/50 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                >
                  <span className={`h-2 w-2 rounded-full ${STATUS_META[lead.status].chip.split(" ")[0]}`} aria-hidden="true" />
                  {lead.university}
                  <span className="text-ink-soft/60">{STATUS_META[lead.status].label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
