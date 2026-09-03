"use client";

import { FaCircleExclamation, FaCircleInfo, FaTriangleExclamation } from "react-icons/fa6";
import { formatCountdown, formatDate } from "@/lib/phd/dates";
import { allDates, allInterviews, buildStats, readinessOf } from "@/lib/phd/derive";
import type { Alert, AlertLevel, DatedItem } from "@/lib/phd/derive";
import { INTERVIEW_MODE_LABELS, STATUS_META } from "@/lib/phd/presets";
import type { Lead, TrackerState } from "@/lib/phd/types";
import { CountdownChip, EmptyNote, ReadinessBar, SectionLabel, StatTile, StatusChip } from "./ui";

const LEVEL_STYLES: Record<AlertLevel, { row: string; icon: typeof FaCircleInfo; iconClass: string }> = {
  critical: {
    row: "border-track-rejected/30 bg-track-rejected/5",
    icon: FaCircleExclamation,
    iconClass: "text-track-rejected",
  },
  warning: { row: "border-gold/40 bg-gold/5", icon: FaTriangleExclamation, iconClass: "text-gold-deep" },
  info: { row: "border-stone-200 bg-paper-raised/40", icon: FaCircleInfo, iconClass: "text-ink-soft" },
};

function AlertRow({ alert, onOpen }: { alert: Alert; onOpen?: () => void }) {
  const style = LEVEL_STYLES[alert.level];
  const Icon = style.icon;
  const interactive = Boolean(alert.leadId && onOpen);

  const body = (
    <div className="flex items-start gap-3">
      <Icon size={14} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug text-ink">{alert.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{alert.detail}</p>
      </div>
    </div>
  );

  if (!interactive) {
    return <li className={`rounded-lg border px-4 py-3 ${style.row}`}>{body}</li>;
  }

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`w-full rounded-lg border px-4 py-3 text-left transition-colors hover:border-ink/30 ${style.row}`}
      >
        {body}
      </button>
    </li>
  );
}

function UpcomingRow({ item, onOpen }: { item: DatedItem; onOpen: () => void }) {
  const { lead, days } = item;
  const ready = readinessOf(lead);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-4 rounded-lg border border-stone-200 bg-paper-raised/40 px-4 py-3 text-left transition-colors hover:border-gold/60 hover:bg-paper-raised"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink group-hover:text-wine">{lead.university}</p>
          <p className="truncate text-xs text-ink-soft">
            {item.label}
            {lead.lab || lead.program ? ` · ${lead.lab ?? lead.program}` : ""}
          </p>
        </div>
        <div className="hidden w-32 shrink-0 sm:block">
          {item.kind === "deadline" && <ReadinessBar percent={ready.percent} done={ready.done} total={ready.total} />}
        </div>
        <div className="shrink-0 text-right">
          {/* An info-toned date is never coloured like a missed deadline. */}
          <CountdownChip days={days} kind={item.tone === "info" ? "rolling" : lead.deadlineKind} />
          <p className="mt-1 text-[0.7rem] text-ink-soft">{formatDate(item.date)}</p>
        </div>
      </button>
    </li>
  );
}

export default function DashboardView({
  state,
  alerts,
  onOpenLead,
  onAddLead,
}: {
  state: TrackerState;
  alerts: Alert[];
  onOpenLead: (id: string) => void;
  onAddLead: () => void;
}) {
  const stats = buildStats(state.leads);
  // The same feed the Dates tab reads, so the two can never disagree about
  // what is coming up. Interviews get their own section just above.
  const upcoming = allDates(state.leads).filter((item) => item.days >= 0 && item.kind !== "interview");
  const interviews = allInterviews(state.leads).filter((entry) => !entry.interview.done);
  const next = stats.nextDeadline;

  if (state.leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-paper-raised/40 px-6 py-16 text-center">
        <p className="font-heading text-2xl font-medium text-ink">Nothing on the bench yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Add the first programme you are considering, even if you only know the university name. Deadlines,
          advisors and requirement checklists can be filled in as you find them, and everything you add here stays
          in this browser.
        </p>
        <button
          type="button"
          onClick={onAddLead}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
        >
          Add your first lead
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="On the bench" value={stats.total} sub={`${stats.active} still open`} />
        <StatTile
          label="Next deadline"
          value={next ? (next.days === 0 ? "Today" : `${next.days}d`) : "None"}
          sub={next ? next.lead.university : "No dated deadline"}
          tone={next && next.days <= 7 ? "urgent" : "default"}
        />
        <StatTile label="Submitted" value={stats.submitted} sub={`of ${stats.total} tracked`} />
        <StatTile label="Interviews" value={stats.interviews} sub="invitations received" />
        <StatTile label="Offers" value={stats.offers} sub={stats.rejected > 0 ? `${stats.rejected} rejected` : "no rejections logged"} tone={stats.offers > 0 ? "good" : "default"} />
        <StatTile
          label="Fees paid"
          value={stats.feesCommitted > 0 ? `$${stats.feesCommitted}` : "$0"}
          sub={stats.feesWaived > 0 ? `$${stats.feesWaived} waived` : "on submitted applications"}
        />
      </div>

      <section>
        <SectionLabel
          action={
            alerts.length > 0 ? (
              <span className="text-xs text-ink-soft">
                {alerts.filter((a) => a.level === "critical").length} urgent
              </span>
            ) : undefined
          }
        >
          Needs attention
        </SectionLabel>
        {alerts.length === 0 ? (
          <EmptyNote>
            Nothing flagged. Every dated application has letter writers assigned and no deadline is inside the next
            week.
          </EmptyNote>
        ) : (
          <ul className="space-y-2">
            {alerts.slice(0, 12).map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onOpen={alert.leadId ? () => onOpenLead(alert.leadId as string) : undefined}
              />
            ))}
          </ul>
        )}
        {alerts.length > 12 && (
          <p className="mt-2 text-xs text-ink-soft">and {alerts.length - 12} more, resolve these first.</p>
        )}
      </section>

      {interviews.length > 0 && (
        <section>
          <SectionLabel action={<span className="text-xs text-ink-soft">{interviews.length} scheduled</span>}>
            Interviews
          </SectionLabel>
          <ul className="space-y-2">
            {interviews.slice(0, 6).map(({ lead, interview, days }) => (
              <li key={interview.id}>
                <button
                  type="button"
                  onClick={() => onOpenLead(lead.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
                    days !== null && days >= 0 && days <= 3
                      ? "border-track-rejected/40 bg-track-rejected/5 hover:border-track-rejected/60"
                      : "border-stone-200 bg-paper-raised/40 hover:border-gold/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{lead.university}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {INTERVIEW_MODE_LABELS[interview.mode]}
                      {interview.time && ` · ${interview.time}`}
                      {interview.timezone && ` ${interview.timezone}`}
                      {interview.withWhom && ` · ${interview.withWhom}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-medium text-ink">
                      {days === null ? "No date set" : formatCountdown(days)}
                    </span>
                    <p className="mt-0.5 text-[0.7rem] text-ink-soft">{formatDate(interview.date)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionLabel
          action={<span className="text-xs text-ink-soft">{upcoming.length} dated</span>}
        >
          Coming up
        </SectionLabel>
        {upcoming.length === 0 ? (
          <EmptyNote>
No open application carries a date yet. Add deadlines, portal opening dates or letter dates and they get
            sequenced here.
          </EmptyNote>
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 10).map((item) => (
              <UpcomingRow
                key={`${item.lead.id}-${item.kind}-${item.date}`}
                item={item}
                onOpen={() => onOpenLead(item.lead.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {stats.averageReadiness > 0 && (
        <section>
          <SectionLabel>Where the open applications stand</SectionLabel>
          <div className="rounded-lg border border-stone-200 bg-paper-raised/40 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-ink-soft">
                Average readiness across {stats.openWithDeadline || stats.active} open application
                {(stats.openWithDeadline || stats.active) === 1 ? "" : "s"}
              </p>
              <p className="font-heading text-xl font-medium tabular-nums text-ink">{stats.averageReadiness}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${stats.averageReadiness}%` }} />
            </div>
          </div>
        </section>
      )}

      <section>
        <SectionLabel>By status</SectionLabel>
        <ul className="flex flex-wrap gap-2">
          {Object.entries(
            state.leads.reduce<Record<string, number>>((counts, lead) => {
              counts[lead.status] = (counts[lead.status] ?? 0) + 1;
              return counts;
            }, {}),
          )
            .sort((a, b) => STATUS_META[a[0] as Lead["status"]].order - STATUS_META[b[0] as Lead["status"]].order)
            .map(([status, count]) => (
              <li key={status} className="flex items-center gap-2 rounded-full border border-stone-200 bg-paper px-3 py-1.5">
                <StatusChip status={status as Lead["status"]} />
                <span className="text-sm font-medium tabular-nums text-ink">{count}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
