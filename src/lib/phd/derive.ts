import { daysSince, daysUntil, startOfToday } from "./dates";
import { DATE_KIND_META, DOCUMENT_STATUS_META, PRIORITY_META, STATUS_META, TIMELINE_KIND_META } from "./presets";
import type { DateKind } from "./presets";
import type {
  DocumentDef,
  InterviewRecord,
  Lead,
  LeadStatus,
  Recommender,
  TestRecord,
  TimelineEntry,
  TrackerSettings,
  TrackerState,
} from "./types";

export type Urgency = "overdue" | "critical" | "soon" | "later" | "none";

/** Colour band for a countdown, derived from days remaining. */
export function urgencyOf(days: number | null, kind: Lead["deadlineKind"]): Urgency {
  if (days === null || kind === "rolling") return "none";
  if (days < 0) return "overdue";
  if (days <= 7) return "critical";
  if (days <= 30) return "soon";
  return "later";
}

export const URGENCY_CLASSES: Record<Urgency, string> = {
  overdue: "bg-track-rejected/12 text-track-rejected border-track-rejected/30",
  critical: "bg-track-rejected/10 text-track-rejected border-track-rejected/25",
  soon: "bg-gold/12 text-gold-deep border-gold/30",
  later: "bg-stone-100 text-ink-soft border-stone-200",
  none: "bg-stone-100 text-ink-soft border-stone-200",
};

export interface Readiness {
  done: number;
  total: number;
  /** 0 to 100. A lead with no checklist reads as 0 rather than complete. */
  percent: number;
}

export function readinessOf(lead: Lead): Readiness {
  const total = lead.requirements.length;
  const done = lead.requirements.filter((item) => item.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function isActive(status: LeadStatus): boolean {
  return !STATUS_META[status].terminal;
}

/** True once the application itself is in, so checklist nagging is pointless. */
export function isFiled(status: LeadStatus): boolean {
  return STATUS_META[status].filed;
}

export type AlertKind =
  | "overdue"
  | "due-soon"
  | "not-started"
  | "behind"
  | "lor-window"
  | "lor-short"
  | "follow-up"
  | "no-deadline"
  | "recommender-silent"
  | "test-expiring"
  | "doc-not-started"
  | "interview-soon"
  | "interview-unlogged"
  | "offer-respond-by"
  | "backup-stale"
  | "portal-opens"
  | "lor-deadline"
  | "decision-overdue"
  | "outreach-silent";

export type AlertLevel = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  kind: AlertKind;
  level: AlertLevel;
  title: string;
  detail: string;
  leadId?: string;
  /** Days remaining where one applies, used to sort alerts of equal level. */
  days?: number;
}

const LEVEL_WEIGHT: Record<AlertLevel, number> = { critical: 0, warning: 1, info: 2 };

/**
 * The part that makes this a tracker rather than a list: everything that needs
 * attention today, worked out from deadlines, checklists and outreach dates.
 */
export function buildAlerts(state: TrackerState, today: Date = startOfToday()): Alert[] {
  const { settings } = state;
  const alerts: Alert[] = [];
  const recommenderById = new Map(state.recommenders.map((person) => [person.id, person]));
  const docNameById = new Map((state.documents ?? []).map((def) => [def.id, def.name]));

  for (const lead of state.leads) {
    const where = `${lead.university}${lead.program ? `, ${lead.program}` : ""}`;
    const days = daysUntil(lead.deadline, today);
    const ready = readinessOf(lead);
    const active = isActive(lead.status);
    const filed = isFiled(lead.status);
    const dated = lead.deadlineKind !== "rolling";

    if (active && !filed && dated && days !== null && days < 0) {
      alerts.push({
        id: `${lead.id}:overdue`,
        kind: "overdue",
        level: "critical",
        title: `Deadline passed: ${where}`,
        detail: `The deadline was ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago and this is still marked ${STATUS_META[lead.status].label.toLowerCase()}. Submit, or move it to withdrawn so it stops showing up here.`,
        leadId: lead.id,
        days,
      });
    }

    if (active && !filed && dated && days !== null && days >= 0 && days <= 7) {
      alerts.push({
        id: `${lead.id}:due-soon`,
        kind: "due-soon",
        level: "critical",
        title: `Due in ${days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`}: ${where}`,
        detail: `${ready.done} of ${ready.total || 0} requirements ticked off.`,
        leadId: lead.id,
        days,
      });
    }

    if (active && !filed && dated && days !== null && days > 7 && days <= 30 && (lead.status === "researching" || lead.status === "shortlisted")) {
      alerts.push({
        id: `${lead.id}:not-started`,
        kind: "not-started",
        level: "warning",
        title: `Not started yet: ${where}`,
        detail: `Deadline is ${days} days out but this is still at ${STATUS_META[lead.status].label.toLowerCase()}. Move it to preparing once you begin the statement.`,
        leadId: lead.id,
        days,
      });
    }

    if (active && !filed && dated && days !== null && days > 7 && days <= settings.draftLeadDays && ready.total > 0 && ready.percent < 50) {
      alerts.push({
        id: `${lead.id}:behind`,
        kind: "behind",
        level: "warning",
        title: `Behind on materials: ${where}`,
        detail: `${ready.percent}% ready with ${days} days left. Your draft lead time is ${settings.draftLeadDays} days.`,
        leadId: lead.id,
        days,
      });
    }

    if (active && !filed && dated && days !== null && days >= 0 && days <= settings.lorLeadDays && lead.recommenderIds.length === 0) {
      alerts.push({
        id: `${lead.id}:lor-window`,
        kind: "lor-window",
        level: days <= 21 ? "critical" : "warning",
        title: `No letter writers assigned: ${where}`,
        detail: `Deadline is ${days} days out. Referees need at least ${settings.lorLeadDays} days of notice, so assign them in the detail panel now.`,
        leadId: lead.id,
        days,
      });
    }

    if (active && !filed && lead.lorCount && lead.recommenderIds.length > 0 && lead.recommenderIds.length < lead.lorCount) {
      alerts.push({
        id: `${lead.id}:lor-short`,
        kind: "lor-short",
        level: "warning",
        title: `Short on letters: ${where}`,
        detail: `This programme asks for ${lead.lorCount} and you have ${lead.recommenderIds.length} assigned.`,
        leadId: lead.id,
        days: days ?? undefined,
      });
    }

    if (active && !dated && lead.status !== "researching") {
      // Rolling applications have no clock, so the risk is quietly forgetting them.
      const idle = daysSince(lead.updatedAt.slice(0, 10), today);
      if (idle !== null && idle >= 30) {
        alerts.push({
          id: `${lead.id}:rolling-idle`,
          kind: "no-deadline",
          level: "info",
          title: `Untouched for ${idle} days: ${where}`,
          detail: "Rolling admission, so nothing forces the pace. Worth a look.",
          leadId: lead.id,
        });
      }
    }

    if (active && dated && !lead.deadline && lead.status !== "researching") {
      alerts.push({
        id: `${lead.id}:no-deadline`,
        kind: "no-deadline",
        level: "info",
        title: `Deadline unknown: ${where}`,
        detail: "Find the date on the department page and add it, otherwise this one cannot be scheduled against the others.",
        leadId: lead.id,
      });
    }

    // The portal opening is news rather than pressure, so it is info-level and
    // fires in a narrow window before the date, not after it.
    const opensIn = daysUntil(lead.opensOn, today);
    if (opensIn !== null && opensIn >= 0 && opensIn <= 14 && active && !filed) {
      alerts.push({
        id: `${lead.id}:portal-opens`,
        kind: "portal-opens",
        level: "info",
        title: `Portal opens ${opensIn === 0 ? "today" : opensIn === 1 ? "tomorrow" : `in ${opensIn} days`}: ${where}`,
        detail: "Create the account early. Portals are slowest in the week before a deadline.",
        leadId: lead.id,
        days: opensIn,
      });
    }

    // An explicit letters-due date from the programme, which is firmer than the
    // date derived from the referee lead-time setting.
    const lorIn = daysUntil(lead.lorDeadline, today);
    if (lorIn !== null && active && !filed) {
      if (lorIn < 0) {
        alerts.push({
          id: `${lead.id}:lor-passed`,
          kind: "lor-deadline",
          level: "critical",
          title: `Letters were due ${Math.abs(lorIn)} day${Math.abs(lorIn) === 1 ? "" : "s"} ago: ${where}`,
          detail: "Check the portal to see which letters actually arrived.",
          leadId: lead.id,
          days: lorIn,
        });
      } else if (lorIn <= 14) {
        alerts.push({
          id: `${lead.id}:lor-deadline`,
          kind: "lor-deadline",
          level: lorIn <= 7 ? "critical" : "warning",
          title: `Letters due in ${lorIn} day${lorIn === 1 ? "" : "s"}: ${where}`,
          detail: `${lead.recommenderIds.length} referee${lead.recommenderIds.length === 1 ? "" : "s"} assigned. Confirm each has submitted.`,
          leadId: lead.id,
          days: lorIn,
        });
      }
    }

    // Past the date you expected to hear back, with no decision recorded.
    const decisionIn = daysUntil(lead.expectedDecision, today);
    if (decisionIn !== null && decisionIn < -7 && !lead.decisionOn && filed && active) {
      alerts.push({
        id: `${lead.id}:decision-overdue`,
        kind: "decision-overdue",
        level: "info",
        title: `No decision ${Math.abs(decisionIn)} days past expected: ${where}`,
        detail: "A short, polite status enquiry is reasonable at this point.",
        leadId: lead.id,
      });
    }

    // Outreach on the timeline that never got an answer.
    const openOutreach = (lead.timeline ?? []).filter(
      (entry) => TIMELINE_KIND_META[entry.kind].outreach && entry.replied !== true,
    );
    const staleOutreach = openOutreach
      .map((entry) => ({ entry, waited: daysSince(entry.date, today) }))
      .filter((row): row is { entry: TimelineEntry; waited: number } => row.waited !== null)
      .filter((row) => row.waited >= settings.followUpDays)
      .sort((a, b) => b.waited - a.waited)[0];
    if (staleOutreach && active) {
      alerts.push({
        id: `${lead.id}:outreach-silent`,
        kind: "outreach-silent",
        level: "info",
        title: `No answer in ${staleOutreach.waited} days: ${where}`,
        detail: `"${staleOutreach.entry.note.slice(0, 90)}" logged ${staleOutreach.waited} days ago with no reply marked.`,
        leadId: lead.id,
      });
    }

    // A statement that has not been started inside the draft window is the
    // single most common way an application quietly fails to happen.
    if (active && !filed && dated && days !== null && days >= 0 && days <= settings.draftLeadDays) {
      const stalledIds = Object.entries(lead.docs ?? {})
        .filter(([, doc]) => doc.status === "not-started")
        .map(([defId]) => defId);
      if (stalledIds.length > 0) {
        const names = stalledIds.map((defId) => docNameById.get(defId) ?? "a document");
        alerts.push({
          id: `${lead.id}:doc-not-started`,
          kind: "doc-not-started",
          level: days <= 14 ? "critical" : "warning",
          title: `${stalledIds.length} document${stalledIds.length === 1 ? "" : "s"} not started: ${where}`,
          detail: `${names.join(", ")} still at not started, with ${days} days left.`,
          leadId: lead.id,
          days,
        });
      }
    }

    for (const interview of lead.interviews) {
      const until = daysUntil(interview.date, today);
      if (until === null) continue;
      if (!interview.done && until >= 0 && until <= 3) {
        alerts.push({
          id: `${lead.id}:interview-soon:${interview.id}`,
          kind: "interview-soon",
          level: "critical",
          title: `Interview ${until === 0 ? "today" : until === 1 ? "tomorrow" : `in ${until} days`}: ${where}`,
          detail: [interview.time, interview.timezone, interview.withWhom].filter(Boolean).join(" · ") || "No time recorded yet.",
          leadId: lead.id,
          days: until,
        });
      }
      if (!interview.done && until < 0) {
        alerts.push({
          id: `${lead.id}:interview-unlogged:${interview.id}`,
          kind: "interview-unlogged",
          level: "info",
          title: `Log how the interview went: ${where}`,
          detail: `It was ${Math.abs(until)} day${Math.abs(until) === 1 ? "" : "s"} ago and there is no outcome recorded.`,
          leadId: lead.id,
        });
      }
    }

    // An offer you forget to answer is an offer you lose.
    const respondIn = daysUntil(lead.offer?.respondBy, today);
    if (respondIn !== null && (lead.status === "offer" || lead.status === "waitlisted")) {
      if (respondIn < 0) {
        alerts.push({
          id: `${lead.id}:offer-lapsed`,
          kind: "offer-respond-by",
          level: "critical",
          title: `Offer reply date has passed: ${where}`,
          detail: `The response was due ${Math.abs(respondIn)} days ago.`,
          leadId: lead.id,
          days: respondIn,
        });
      } else if (respondIn <= 21) {
        alerts.push({
          id: `${lead.id}:offer-respond-by`,
          kind: "offer-respond-by",
          level: respondIn <= 7 ? "critical" : "warning",
          title: `Offer needs an answer in ${respondIn} day${respondIn === 1 ? "" : "s"}: ${where}`,
          detail: "Compare it against your other offers on the Decide tab before replying.",
          leadId: lead.id,
          days: respondIn,
        });
      }
    }

    for (const advisor of lead.advisors) {
      if (!advisor.emailedOn || advisor.repliedOn) continue;
      if (advisor.outcome === "negative" || advisor.outcome === "no-reply") continue;
      const waited = daysSince(advisor.emailedOn, today);
      if (waited !== null && waited >= settings.followUpDays) {
        alerts.push({
          id: `${lead.id}:follow-up:${advisor.id}`,
          kind: "follow-up",
          level: "info",
          title: `Follow up with ${advisor.name}`,
          detail: `Emailed ${waited} days ago about ${where} with no reply logged. One short, polite nudge is normal at this point.`,
          leadId: lead.id,
        });
      }
    }

    for (const id of lead.recommenderIds) {
      const person = recommenderById.get(id);
      if (!person || person.agreed || !person.askedOn) continue;
      const waited = daysSince(person.askedOn, today);
      if (waited !== null && waited >= 10 && days !== null && days <= settings.lorLeadDays) {
        alerts.push({
          id: `${lead.id}:rec-silent:${id}`,
          kind: "recommender-silent",
          level: "warning",
          title: `${person.name} has not confirmed yet`,
          detail: `Asked ${waited} days ago and assigned to ${where}, which closes in ${days} days.`,
          leadId: lead.id,
          days,
        });
      }
    }
  }

  for (const test of state.tests) {
    const expiry = daysUntil(test.validUntil, today);
    if (expiry === null) continue;
    if (expiry < 0) {
      alerts.push({
        id: `test:${test.id}:expired`,
        kind: "test-expiring",
        level: "warning",
        title: `${test.name} score has expired`,
        detail: `Validity ran out ${Math.abs(expiry)} days ago. Programmes will not accept it.`,
      });
    } else if (expiry <= 120) {
      alerts.push({
        id: `test:${test.id}:expiring`,
        kind: "test-expiring",
        level: "info",
        title: `${test.name} score expires in ${expiry} days`,
        detail: "Check that it still covers every deadline you are applying to.",
      });
    }
  }

  if (settings.backupReminderDays > 0 && state.leads.length > 0) {
    const since = state.lastBackupAt ? daysSince(state.lastBackupAt.slice(0, 10), today) : null;
    if (since === null) {
      alerts.push({
        id: "backup:never",
        kind: "backup-stale",
        level: "info",
        title: "No backup taken yet",
        detail: "This data lives only in this browser. Use the Backup button so a cleared cache cannot erase it.",
      });
    } else if (since >= settings.backupReminderDays) {
      alerts.push({
        id: "backup:stale",
        kind: "backup-stale",
        level: "info",
        title: `Last backup was ${since} days ago`,
        detail: "Export a fresh copy so the file matches what is on screen.",
      });
    }
  }

  return alerts.sort((a, b) => {
    const level = LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level];
    if (level !== 0) return level;
    const aDays = a.days ?? Number.MAX_SAFE_INTEGER;
    const bDays = b.days ?? Number.MAX_SAFE_INTEGER;
    return aDays - bDays;
  });
}

export interface TrackerStats {
  total: number;
  active: number;
  submitted: number;
  interviews: number;
  offers: number;
  rejected: number;
  /** Leads that still need work and have a live deadline. */
  openWithDeadline: number;
  nextDeadline: { lead: Lead; days: number } | null;
  feesCommitted: number;
  feesWaived: number;
  averageReadiness: number;
}

export function buildStats(leads: Lead[], today: Date = startOfToday()): TrackerStats {
  const upcoming: { lead: Lead; days: number }[] = [];
  let feesCommitted = 0;
  let feesWaived = 0;
  let readinessSum = 0;
  let readinessCount = 0;

  for (const lead of leads) {
    const days = daysUntil(lead.deadline, today);
    if (days !== null && days >= 0 && isActive(lead.status) && !isFiled(lead.status) && lead.deadlineKind !== "rolling") {
      upcoming.push({ lead, days });
    }
    if (lead.feeUsd) {
      if (lead.feeWaiver) feesWaived += lead.feeUsd;
      else if (isFiled(lead.status)) feesCommitted += lead.feeUsd;
    }
    if (isActive(lead.status) && !isFiled(lead.status)) {
      readinessSum += readinessOf(lead).percent;
      readinessCount += 1;
    }
  }

  upcoming.sort((a, b) => a.days - b.days);

  return {
    total: leads.length,
    active: leads.filter((lead) => isActive(lead.status)).length,
    submitted: leads.filter((lead) => isFiled(lead.status) && lead.status !== "rejected" && lead.status !== "declined" && lead.status !== "withdrawn").length,
    interviews: leads.filter((lead) => lead.status === "interview").length,
    offers: leads.filter((lead) => lead.status === "offer").length,
    rejected: leads.filter((lead) => lead.status === "rejected").length,
    openWithDeadline: upcoming.length,
    nextDeadline: upcoming[0] ?? null,
    feesCommitted,
    feesWaived,
    averageReadiness: readinessCount === 0 ? 0 : Math.round(readinessSum / readinessCount),
  };
}

/** Leads with a live deadline, soonest first. Powers the "next up" panel. */
export function upcomingLeads(leads: Lead[], today: Date = startOfToday()): { lead: Lead; days: number }[] {
  return leads
    .filter((lead) => isActive(lead.status) && !isFiled(lead.status) && lead.deadlineKind !== "rolling" && lead.deadline)
    .map((lead) => ({ lead, days: daysUntil(lead.deadline, today) ?? 0 }))
    .sort((a, b) => a.days - b.days);
}

/** Deadline first, then priority, then name, so the list view has a stable useful order. */
export function sortLeads(leads: Lead[], today: Date = startOfToday()): Lead[] {
  return [...leads].sort((a, b) => {
    const aDays = a.deadlineKind === "rolling" ? null : daysUntil(a.deadline, today);
    const bDays = b.deadlineKind === "rolling" ? null : daysUntil(b.deadline, today);
    if (aDays !== null && bDays !== null && aDays !== bDays) return aDays - bDays;
    if (aDays !== null && bDays === null) return -1;
    if (aDays === null && bDays !== null) return 1;
    const priority = PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order;
    if (priority !== 0) return priority;
    return a.university.localeCompare(b.university);
  });
}

/** How many programmes each referee is on the hook for, and by when. */
export function recommenderLoad(person: Recommender, leads: Lead[], today: Date = startOfToday()) {
  const assigned = leads.filter((lead) => lead.recommenderIds.includes(person.id));
  const pending = assigned.filter((lead) => isActive(lead.status) && !isFiled(lead.status));
  const nextDays = pending
    .map((lead) => daysUntil(lead.deadline, today))
    .filter((days): days is number => days !== null)
    .sort((a, b) => a - b)[0];
  return { assigned, pending, nextDays: nextDays ?? null };
}

export function testStatus(test: TestRecord, today: Date = startOfToday()): "valid" | "expiring" | "expired" | "unknown" {
  const days = daysUntil(test.validUntil, today);
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days <= 120) return "expiring";
  return "valid";
}

/** Internal milestone dates worked back from a deadline, for the calendar export and detail panel. */
export function milestonesFor(lead: Lead, settings: TrackerSettings) {
  if (!lead.deadline || lead.deadlineKind === "rolling") return [];
  return [
    { label: "Ask referees by", offset: -settings.lorLeadDays },
    { label: "First draft done by", offset: -settings.draftLeadDays },
    { label: "Submit by", offset: 0 },
  ];
}

export interface DocumentProgress {
  total: number;
  final: number;
  /** 0 to 100, weighted so drafting and review count as partial progress. */
  percent: number;
}

/** Progress over the documents this application actually requires. */
export function documentProgress(lead: Lead): DocumentProgress {
  const entries = Object.values(lead.docs ?? {});
  const total = entries.length;
  if (total === 0) return { total: 0, final: 0, percent: 0 };
  const maxWeight = DOCUMENT_STATUS_META.final.weight * total;
  const weight = entries.reduce((sum, doc) => sum + DOCUMENT_STATUS_META[doc.status].weight, 0);
  return {
    total,
    final: entries.filter((doc) => doc.status === "final").length,
    percent: Math.round((weight / maxWeight) * 100),
  };
}

/** Registry documents required by this lead, in registry order. */
export function requiredDocuments(lead: Lead, registry: DocumentDef[]): DocumentDef[] {
  return [...registry]
    .sort((a, b) => a.order - b.order)
    .filter((def) => Object.prototype.hasOwnProperty.call(lead.docs ?? {}, def.id));
}

export interface InterviewEntry {
  lead: Lead;
  interview: InterviewRecord;
  days: number | null;
}

/** Interviews across every lead, soonest first, undated last. */
export function allInterviews(leads: Lead[], today: Date = startOfToday()): InterviewEntry[] {
  const entries: InterviewEntry[] = [];
  for (const lead of leads) {
    for (const interview of lead.interviews) {
      entries.push({ lead, interview, days: daysUntil(interview.date, today) });
    }
  }
  return entries.sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    if (a.days !== b.days) return a.days - b.days;
    return (a.interview.time ?? "").localeCompare(b.interview.time ?? "");
  });
}

export interface OfferRow {
  lead: Lead;
  currency: string;
  /** Stipend normalised to a month. Null when no amount has been entered. */
  monthlyStipend: number | null;
  /** Stipend minus your own living-cost estimate. Null when either is missing. */
  monthlySurplus: number | null;
  guaranteedYears: number | null;
  tuitionWaived: boolean;
  healthCovered: boolean;
  respondByDays: number | null;
}

export interface OfferComparison {
  rows: OfferRow[];
  currencies: string[];
  /** True when rows span more than one currency, so totals must not be ranked together. */
  mixedCurrency: boolean;
}

/**
 * Side-by-side view of live offers. Amounts are never converted between
 * currencies: an invented exchange rate would produce a confident ranking with
 * no basis, so mixed currencies are flagged and left to the reader instead.
 */
export function buildOfferComparison(leads: Lead[], today: Date = startOfToday()): OfferComparison {
  const rows: OfferRow[] = leads
    .filter((lead) => lead.status === "offer" || lead.status === "waitlisted")
    .map((lead) => {
      const offer = lead.offer ?? {};
      // Period defaults to a year because that is how PhD stipends are quoted,
      // and the editor always writes the field explicitly.
      const monthly =
        offer.stipendAmount === undefined
          ? null
          : offer.stipendPeriod === "month"
            ? offer.stipendAmount
            : Math.round(offer.stipendAmount / 12);
      return {
        lead,
        currency: offer.currency?.trim().toUpperCase() || "unset",
        monthlyStipend: monthly,
        monthlySurplus:
          monthly === null || offer.monthlyLivingCost === undefined ? null : monthly - offer.monthlyLivingCost,
        guaranteedYears: offer.guaranteedYears ?? null,
        tuitionWaived: offer.tuitionWaived === true,
        healthCovered: offer.healthCovered === true,
        respondByDays: daysUntil(offer.respondBy, today),
      };
    })
    .sort((a, b) => {
      if (a.monthlySurplus !== null && b.monthlySurplus !== null) return b.monthlySurplus - a.monthlySurplus;
      if (a.monthlySurplus !== null) return -1;
      if (b.monthlySurplus !== null) return 1;
      return a.lead.university.localeCompare(b.lead.university);
    });

  const currencies = Array.from(new Set(rows.map((row) => row.currency).filter((code) => code !== "unset")));
  return { rows, currencies, mixedCurrency: currencies.length > 1 };
}

export interface DatedItem {
  lead: Lead;
  kind: DateKind;
  label: string;
  date: string;
  days: number;
  /** Info-toned dates (portal opening, expected decision) never read as pressure. */
  tone: "pressure" | "info";
  /** Set on interview rows so the feed can show the clock time. */
  interview?: InterviewRecord;
}

/**
 * Every date the tracker knows about, from every lead, in one ordered feed.
 *
 * Application deadlines alone under-describe a season: a portal that opens, a
 * letters-due date, an interview slot and an offer reply date all compete for
 * the same week, and seeing them interleaved is the only way to plan against
 * them. Closed-out leads are skipped, since their dates no longer bind.
 */
export function allDates(leads: Lead[], today: Date = startOfToday()): DatedItem[] {
  const items: DatedItem[] = [];

  const push = (lead: Lead, kind: DateKind, date: string | undefined, interview?: InterviewRecord) => {
    const days = daysUntil(date, today);
    if (date === undefined || days === null) return;
    items.push({
      lead,
      kind,
      label: DATE_KIND_META[kind].label,
      date,
      days,
      tone: DATE_KIND_META[kind].tone,
      interview,
    });
  };

  for (const lead of leads) {
    // Gate per date kind rather than on isActive: an offer is a terminal status
    // for the purpose of chasing its deadline, but its reply-by date is the most
    // consequential date in the season and has to stay in the feed. Only a lead
    // that is genuinely closed out contributes nothing.
    if (lead.status === "rejected" || lead.status === "declined" || lead.status === "withdrawn") continue;

    if (!isFiled(lead.status)) push(lead, "opens", lead.opensOn);
    if (lead.deadlineKind !== "rolling" && !isFiled(lead.status)) push(lead, "deadline", lead.deadline);
    if (!isFiled(lead.status)) push(lead, "lor", lead.lorDeadline);
    for (const interview of lead.interviews ?? []) {
      if (!interview.done) push(lead, "interview", interview.date, interview);
    }
    if (!lead.decisionOn) push(lead, "decision", lead.expectedDecision);
    if (lead.status === "offer" || lead.status === "waitlisted") push(lead, "offer", lead.offer?.respondBy);
  }

  return items.sort((a, b) => (a.days !== b.days ? a.days - b.days : a.lead.university.localeCompare(b.lead.university)));
}

export interface FunnelMetrics {
  leads: number;
  applied: number;
  responded: number;
  interviews: number;
  offers: number;
  rejections: number;
  /** Share of filed applications that produced an interview or an offer. */
  responseRate: number;
  /** Share of interviews that turned into an offer. */
  interviewConversion: number;
  /** Share of logged outreach emails that got a reply. */
  outreachReplyRate: number;
  outreachSent: number;
  outreachReplied: number;
}

/**
 * Season-level conversion rates. Every rate is guarded against a zero
 * denominator and reported as 0 rather than NaN, because a blank tracker
 * should read as "nothing yet", not as a broken number.
 */
export function buildFunnel(leads: Lead[]): FunnelMetrics {
  const filed = leads.filter((lead) => isFiled(lead.status));
  const interviews = leads.filter((lead) => lead.interviews?.length > 0 || lead.status === "interview");
  const offers = leads.filter((lead) => lead.status === "offer");
  const responded = leads.filter(
    (lead) => lead.status === "interview" || lead.status === "offer" || lead.status === "waitlisted",
  );

  let outreachSent = 0;
  let outreachReplied = 0;
  for (const lead of leads) {
    for (const entry of lead.timeline ?? []) {
      if (!TIMELINE_KIND_META[entry.kind].outreach) continue;
      outreachSent += 1;
      if (entry.replied) outreachReplied += 1;
    }
    for (const advisor of lead.advisors ?? []) {
      if (!advisor.emailedOn) continue;
      outreachSent += 1;
      if (advisor.repliedOn) outreachReplied += 1;
    }
  }

  const rate = (numerator: number, denominator: number) =>
    denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

  return {
    leads: leads.length,
    applied: filed.length,
    responded: responded.length,
    interviews: interviews.length,
    offers: offers.length,
    rejections: leads.filter((lead) => lead.status === "rejected").length,
    responseRate: rate(responded.length, filed.length),
    interviewConversion: rate(offers.length, interviews.length),
    outreachReplyRate: rate(outreachReplied, outreachSent),
    outreachSent,
    outreachReplied,
  };
}

export interface CountBucket {
  key: string;
  label: string;
  value: number;
}

/** Counts by status, in pipeline order, dropping empty buckets. */
export function statusBreakdown(leads: Lead[]): CountBucket[] {
  const counts = new Map<LeadStatus, number>();
  for (const lead of leads) counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => STATUS_META[a[0]].order - STATUS_META[b[0]].order)
    .map(([status, value]) => ({ key: status, label: STATUS_META[status].label, value }));
}

/** Counts by a free-text field, largest first, with blanks grouped together. */
export function groupCount(leads: Lead[], pick: (lead: Lead) => string | undefined, blankLabel: string): CountBucket[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const raw = pick(lead)?.trim();
    const key = raw && raw !== "" ? raw : blankLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.label.localeCompare(b.label)));
}

/**
 * Leads added per month, oldest first, with empty months filled in so the
 * series reads as a timeline rather than a list of whichever months happened
 * to have activity.
 */
export function monthlyVolume(leads: Lead[]): CountBucket[] {
  const stamps = leads
    .map((lead) => lead.createdAt.slice(0, 7))
    .filter((month) => /^\d{4}-\d{2}$/.test(month))
    .sort();
  if (stamps.length === 0) return [];

  const counts = new Map<string, number>();
  for (const month of stamps) counts.set(month, (counts.get(month) ?? 0) + 1);

  const buckets: CountBucket[] = [];
  const [firstYear, firstMonth] = stamps[0].split("-").map(Number);
  const [lastYear, lastMonth] = stamps[stamps.length - 1].split("-").map(Number);
  const cursor = new Date(firstYear, firstMonth - 1, 1);
  const end = new Date(lastYear, lastMonth - 1, 1);

  // Hard stop at 36 buckets so a stray far-future createdAt cannot spin here.
  while (cursor <= end && buckets.length < 36) {
    const key = `${cursor.getFullYear()}-${`${cursor.getMonth() + 1}`.padStart(2, "0")}`;
    buckets.push({ key, label: key, value: counts.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

/** How often each registry document is required, and how often it is finished. */
export function documentCoverage(leads: Lead[], registry: DocumentDef[]) {
  const open = leads.filter((lead) => isActive(lead.status));
  return [...registry]
    .sort((a, b) => a.order - b.order)
    .map((def) => {
      const required = open.filter((lead) => Object.prototype.hasOwnProperty.call(lead.docs ?? {}, def.id));
      const done = required.filter((lead) => lead.docs[def.id]?.status === "final");
      return {
        def,
        required: required.length,
        done: done.length,
        percent: required.length === 0 ? 0 : Math.round((done.length / required.length) * 100),
      };
    });
}
