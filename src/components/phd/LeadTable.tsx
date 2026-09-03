"use client";

import { useMemo, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { daysUntil, formatDate } from "@/lib/phd/dates";
import { buildAlerts, isActive, readinessOf, sortLeads } from "@/lib/phd/derive";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from "@/lib/phd/presets";
import type { LeadStatus, Priority, TrackerState } from "@/lib/phd/types";
import { CountdownChip, EmptyNote, ReadinessBar, StatusChip } from "./ui";

type StatusFilter = "all" | "open" | LeadStatus;

export default function LeadTable({
  state,
  onOpenLead,
}: {
  state: TrackerState;
  onOpenLead: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const countries = useMemo(
    () => Array.from(new Set(state.leads.map((lead) => lead.country).filter((c): c is string => Boolean(c)))).sort(),
    [state.leads],
  );

  /** Ids with at least one warning or critical alert, for the "needs attention" toggle. */
  const flaggedIds = useMemo(() => {
    const set = new Set<string>();
    for (const alert of buildAlerts(state)) {
      if (alert.leadId && alert.level !== "info") set.add(alert.leadId);
    }
    return set;
  }, [state]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sortLeads(
      state.leads.filter((lead) => {
        if (statusFilter === "open" && !isActive(lead.status)) return false;
        if (statusFilter !== "all" && statusFilter !== "open" && lead.status !== statusFilter) return false;
        if (priorityFilter !== "all" && lead.priority !== priorityFilter) return false;
        if (countryFilter !== "all" && lead.country !== countryFilter) return false;
        if (flaggedOnly && !flaggedIds.has(lead.id)) return false;
        if (!needle) return true;
        return [lead.university, lead.program, lead.country, lead.notes, lead.funding, lead.intake]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      }),
    );
  }, [state.leads, query, statusFilter, priorityFilter, countryFilter, flaggedOnly, flaggedIds]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-48 flex-1">
          <FaMagnifyingGlass size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search university, programme, notes"
            aria-label="Search leads"
            className="track-field pl-8"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          aria-label="Filter by status"
          className="track-field w-auto"
        >
          <option value="open">Open only</option>
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as Priority | "all")}
          aria-label="Filter by priority"
          className="track-field w-auto"
        >
          <option value="all">Any priority</option>
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>

        {countries.length > 0 && (
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            aria-label="Filter by country"
            className="track-field w-auto"
          >
            <option value="all">Anywhere</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        )}

        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-200 bg-paper px-3 py-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(event) => setFlaggedOnly(event.target.checked)}
            className="accent-wine"
          />
          Needs attention
        </label>
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        {rows.length} of {state.leads.length} shown
      </p>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyNote>Nothing matches these filters.</EmptyNote>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-paper-raised">
              <tr>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Programme</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Status</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Deadline</th>
                <th scope="col" className="hidden border-b border-stone-200 px-4 py-2.5 font-semibold text-ink md:table-cell">Ready</th>
                <th scope="col" className="hidden border-b border-stone-200 px-4 py-2.5 font-semibold text-ink lg:table-cell">Letters</th>
                <th scope="col" className="hidden border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink lg:table-cell">Fee</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => {
                const ready = readinessOf(lead);
                const days = daysUntil(lead.deadline);
                const flagged = flaggedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onOpenLead(lead.id)}
                    className="cursor-pointer odd:bg-paper even:bg-paper-raised/40 hover:bg-gold/8"
                  >
                    <td className="border-b border-stone-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_META[lead.priority].dot}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">
                            {lead.university}
                            {flagged && (
                              <span className="ml-2 align-middle text-[0.65rem] font-semibold uppercase tracking-wider text-track-rejected">
                                needs attention
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {[lead.program, lead.country].filter(Boolean).join(" · ") || "No programme set"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-stone-100 px-4 py-3">
                      <StatusChip status={lead.status} />
                    </td>
                    <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3">
                      <CountdownChip days={days} kind={lead.deadlineKind} />
                      <p className="mt-1 text-[0.7rem] text-ink-soft">{formatDate(lead.deadline)}</p>
                    </td>
                    <td className="hidden w-36 border-b border-stone-100 px-4 py-3 md:table-cell">
                      <ReadinessBar percent={ready.percent} done={ready.done} total={ready.total} />
                    </td>
                    <td className="hidden whitespace-nowrap border-b border-stone-100 px-4 py-3 text-ink-soft lg:table-cell">
                      {lead.recommenderIds.length}
                      {lead.lorCount ? ` / ${lead.lorCount}` : ""}
                    </td>
                    <td className="hidden whitespace-nowrap border-b border-stone-100 px-4 py-3 text-right tabular-nums text-ink-soft lg:table-cell">
                      {lead.feeWaiver ? "waived" : lead.feeUsd ? `$${lead.feeUsd}` : "not set"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
