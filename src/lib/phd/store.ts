import { CHECKLIST_PRESETS, DEFAULT_DOCUMENTS, STATUS_META } from "./presets";
import { clearState, loadState, normalizeState, saveState, uid } from "./storage";
import { emptyState } from "./types";
import type {
  AdvisorContact,
  DocumentDef,
  InterviewRecord,
  Lead,
  LeadDocument,
  OfferDetails,
  Recommender,
  TestRecord,
  TimelineEntry,
  TimelineKind,
  TrackerSettings,
  TrackerState,
} from "./types";

export interface NewLeadInput {
  university: string;
  program: string;
  country?: string;
  degree: Lead["degree"];
  priority: Lead["priority"];
  deadline?: string;
  deadlineKind: Lead["deadlineKind"];
  intake?: string;
  presetId: string;
  programUrl?: string;
}

export interface BulkLeadRow {
  university: string;
  program?: string;
  country?: string;
  deadline?: string;
}

export interface TrackerSnapshot {
  state: TrackerState;
  /** False until localStorage has been read, which only happens after mount. */
  hydrated: boolean;
  /** True when the last write was refused, e.g. in a private window. */
  storageBlocked: boolean;
}

/**
 * The tracker document lives in a module-level store rather than component
 * state, read through useSyncExternalStore.
 *
 * The page is statically pre-rendered, so the server-rendered markup cannot
 * know what is in the visitor's localStorage. Loading it on first subscribe and
 * letting React reconcile afterwards keeps hydration honest without a setState
 * cascade inside an effect.
 */
let current: TrackerState = emptyState();
let hydrated = false;
let storageBlocked = false;
let snapshot: TrackerSnapshot = { state: current, hydrated, storageBlocked };

/** Frozen and never reassigned, so hydration always renders from the same value. */
const SERVER_SNAPSHOT: TrackerSnapshot = Object.freeze({
  state: emptyState(),
  hydrated: false,
  storageBlocked: false,
});

const listeners = new Set<() => void>();

function publish() {
  snapshot = { state: current, hydrated, storageBlocked };
  for (const listener of listeners) listener();
}

export function getSnapshot(): TrackerSnapshot {
  return snapshot;
}

export function getServerSnapshot(): TrackerSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  // The first subscriber triggers the read. React runs this after mount, which
  // is the earliest point localStorage is available.
  if (!hydrated) {
    const stored = loadState();
    if (stored) current = stored;
    hydrated = true;
    snapshot = { state: current, hydrated, storageBlocked };
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Applies a change, persists it, and notifies subscribers. */
function update(updater: (previous: TrackerState) => TrackerState): void {
  current = { ...updater(current), updatedAt: new Date().toISOString() };
  storageBlocked = !saveState(current);
  publish();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function seedDocuments(): DocumentDef[] {
  return DEFAULT_DOCUMENTS.map((name, index) => ({ id: uid(), name, order: index }));
}

function touch(lead: Lead): Lead {
  return { ...lead, updatedAt: new Date().toISOString() };
}

function mapLead(id: string, transform: (lead: Lead) => Lead) {
  update((previous) => ({
    ...previous,
    leads: previous.leads.map((lead) => (lead.id === id ? touch(transform(lead)) : lead)),
  }));
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
}

export const trackerActions = {
  addLead(input: NewLeadInput): string {
    const preset = CHECKLIST_PRESETS.find((entry) => entry.id === input.presetId);
    const now = new Date().toISOString();
    const lead: Lead = {
      id: uid(),
      university: input.university.trim(),
      program: input.program.trim(),
      country: input.country?.trim() || undefined,
      degree: input.degree,
      status: "researching",
      priority: input.priority,
      deadline: input.deadline || undefined,
      deadlineKind: input.deadlineKind,
      intake: input.intake?.trim() || undefined,
      programUrl: input.programUrl?.trim() || undefined,
      requirements: (preset?.items ?? []).map((label) => ({ id: uid(), label, done: false })),
      docs: {},
      interviews: [],
      advisors: [],
      timeline: [],
      recommenderIds: [],
      createdAt: now,
      updatedAt: now,
    };
    update((previous) => ({
      ...previous,
      leads: [...previous.leads, lead],
      // Seeded on the first lead rather than at hydration: a device that opens
      // the tracker and immediately signs in must still look empty, or the sync
      // reconcile mistakes the starter list for real content.
      documents: previous.documents.length === 0 ? seedDocuments() : previous.documents,
    }));
    return lead.id;
  },

  /**
   * Creates several leads at once from a parsed paste. Used to get a shortlist
   * in quickly, since typing twenty universities one dialog at a time is the
   * fastest way to abandon a tracker.
   */
  addLeadsBulk(rows: BulkLeadRow[], presetId: string): number {
    const preset = CHECKLIST_PRESETS.find((entry) => entry.id === presetId);
    const now = new Date().toISOString();
    const created: Lead[] = rows
      .filter((row) => row.university.trim() !== "")
      .map((row) => ({
        id: uid(),
        university: row.university.trim(),
        program: (row.program ?? "").trim(),
        country: row.country?.trim() || undefined,
        degree: "phd" as const,
        status: "researching" as const,
        priority: "solid" as const,
        deadline: row.deadline || undefined,
        deadlineKind: row.deadline ? ("hard" as const) : ("unknown" as const),
        intake: current.settings.targetIntake,
        requirements: (preset?.items ?? []).map((label) => ({ id: uid(), label, done: false })),
        docs: {},
        interviews: [],
        advisors: [],
        timeline: [],
        recommenderIds: [],
        createdAt: now,
        updatedAt: now,
      }));
    if (created.length === 0) return 0;
    update((previous) => ({
      ...previous,
      leads: [...previous.leads, ...created],
      documents: previous.documents.length === 0 ? seedDocuments() : previous.documents,
    }));
    return created.length;
  },

  patchLead(id: string, patch: Partial<Lead>): void {
    mapLead(id, (lead) => ({ ...lead, ...patch }));
  },

  /**
   * Moves status, stamps the matching date the first time it is reached, and
   * writes an automatic timeline entry so the history is self-explaining.
   */
  setStatus(id: string, status: Lead["status"]): void {
    mapLead(id, (lead) => {
      if (lead.status === status) return lead;
      const entry: TimelineEntry = {
        id: uid(),
        date: today(),
        kind: status === "submitted" ? "submitted" : "status",
        note: `${STATUS_META[lead.status].label} to ${STATUS_META[status].label}`,
        auto: true,
        createdAt: new Date().toISOString(),
      };
      return {
        ...lead,
        status,
        submittedOn: status === "submitted" && !lead.submittedOn ? today() : lead.submittedOn,
        decisionOn:
          (status === "offer" || status === "rejected" || status === "waitlisted") && !lead.decisionOn
            ? today()
            : lead.decisionOn,
        timeline: [entry, ...(lead.timeline ?? [])],
      };
    });
  },

  removeLead(id: string): void {
    update((previous) => ({ ...previous, leads: previous.leads.filter((lead) => lead.id !== id) }));
  },

  duplicateLead(id: string): string | null {
    const source = current.leads.find((lead) => lead.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const copy: Lead = {
      ...source,
      id: uid(),
      university: `${source.university} (copy)`,
      status: "researching",
      submittedOn: undefined,
      decisionOn: undefined,
      // A duplicate has not been interviewed and holds no offer.
      interviews: [],
      offer: undefined,
      requirements: source.requirements.map((item) => ({ ...item, id: uid(), done: false })),
      // Keep which documents are required, reset how far along each one is.
      docs: Object.fromEntries(
        Object.entries(source.docs ?? {}).map(([defId, doc]) => [
          defId,
          { ...doc, status: "not-started" as const, updatedOn: undefined },
        ]),
      ),
      timeline: [],
      advisors: source.advisors.map((advisor) => ({
        ...advisor,
        id: uid(),
        emailedOn: undefined,
        repliedOn: undefined,
        outcome: "awaiting",
      })),
      createdAt: now,
      updatedAt: now,
    };
    update((previous) => ({ ...previous, leads: [...previous.leads, copy] }));
    return copy.id;
  },

  toggleRequirement(leadId: string, itemId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      requirements: lead.requirements.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    }));
  },

  addRequirement(leadId: string, label: string): void {
    const trimmed = label.trim();
    if (!trimmed) return;
    mapLead(leadId, (lead) => ({
      ...lead,
      requirements: [...lead.requirements, { id: uid(), label: trimmed, done: false }],
    }));
  },

  removeRequirement(leadId: string, itemId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      requirements: lead.requirements.filter((item) => item.id !== itemId),
    }));
  },

  /** Adds a preset's items, skipping labels the lead already has. */
  applyPreset(leadId: string, presetId: string): void {
    const preset = CHECKLIST_PRESETS.find((entry) => entry.id === presetId);
    if (!preset) return;
    mapLead(leadId, (lead) => {
      const existing = new Set(lead.requirements.map((item) => item.label.toLowerCase()));
      const additions = preset.items
        .filter((label) => !existing.has(label.toLowerCase()))
        .map((label) => ({ id: uid(), label, done: false }));
      return { ...lead, requirements: [...lead.requirements, ...additions] };
    });
  },

  addAdvisor(leadId: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    mapLead(leadId, (lead) => ({
      ...lead,
      advisors: [...lead.advisors, { id: uid(), name: trimmed, outcome: "awaiting" }],
    }));
  },

  patchAdvisor(leadId: string, advisorId: string, patch: Partial<AdvisorContact>): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      advisors: lead.advisors.map((advisor) => (advisor.id === advisorId ? { ...advisor, ...patch } : advisor)),
    }));
  },

  removeAdvisor(leadId: string, advisorId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      advisors: lead.advisors.filter((advisor) => advisor.id !== advisorId),
    }));
  },

  addRecommender(name: string): string {
    const person: Recommender = { id: uid(), name: name.trim() || "Unnamed" };
    update((previous) => ({ ...previous, recommenders: [...previous.recommenders, person] }));
    return person.id;
  },

  patchRecommender(id: string, patch: Partial<Recommender>): void {
    update((previous) => ({
      ...previous,
      recommenders: previous.recommenders.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    }));
  },

  removeRecommender(id: string): void {
    update((previous) => ({
      ...previous,
      recommenders: previous.recommenders.filter((person) => person.id !== id),
      // Drop the assignment everywhere, otherwise leads keep a dangling id.
      leads: previous.leads.map((lead) => ({
        ...lead,
        recommenderIds: lead.recommenderIds.filter((value) => value !== id),
      })),
    }));
  },

  toggleLeadRecommender(leadId: string, recommenderId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      recommenderIds: lead.recommenderIds.includes(recommenderId)
        ? lead.recommenderIds.filter((value) => value !== recommenderId)
        : [...lead.recommenderIds, recommenderId],
    }));
  },

  addTest(name: string): void {
    const test: TestRecord = { id: uid(), name: name.trim() || "Test" };
    update((previous) => ({ ...previous, tests: [...previous.tests, test] }));
  },

  patchTest(id: string, patch: Partial<TestRecord>): void {
    update((previous) => ({
      ...previous,
      tests: previous.tests.map((test) => (test.id === id ? { ...test, ...patch } : test)),
    }));
  },

  removeTest(id: string): void {
    update((previous) => ({ ...previous, tests: previous.tests.filter((test) => test.id !== id) }));
  },

  /** Adds a document to the global registry and returns its id. */
  addDocumentDef(name: string): string {
    const trimmed = name.trim();
    if (trimmed === "") return "";
    const def: DocumentDef = { id: uid(), name: trimmed, order: current.documents.length };
    update((previous) => ({ ...previous, documents: [...previous.documents, def] }));
    return def.id;
  },

  renameDocumentDef(defId: string, name: string): void {
    const trimmed = name.trim();
    if (trimmed === "") return;
    update((previous) => ({
      ...previous,
      documents: previous.documents.map((def) => (def.id === defId ? { ...def, name: trimmed } : def)),
    }));
  },

  /** Removes a registry document and unrequires it from every lead. */
  removeDocumentDef(defId: string): void {
    update((previous) => ({
      ...previous,
      documents: previous.documents
        .filter((def) => def.id !== defId)
        .map((def, index) => ({ ...def, order: index })),
      leads: previous.leads.map((lead) => {
        if (!Object.prototype.hasOwnProperty.call(lead.docs ?? {}, defId)) return lead;
        const next = { ...lead.docs };
        delete next[defId];
        return { ...lead, docs: next };
      }),
    }));
  },

  moveDocumentDef(defId: string, direction: -1 | 1): void {
    update((previous) => {
      const ordered = [...previous.documents].sort((a, b) => a.order - b.order);
      const index = ordered.findIndex((def) => def.id === defId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= ordered.length) return previous;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      return { ...previous, documents: ordered.map((def, position) => ({ ...def, order: position })) };
    });
  },

  /** Restores the starter list. Used by the button shown on an empty registry. */
  seedDocumentRegistry(): void {
    if (current.documents.length > 0) return;
    update((previous) => ({ ...previous, documents: seedDocuments() }));
  },

  /** Marks a registry document required or not required for one application. */
  toggleLeadDocument(leadId: string, defId: string): void {
    mapLead(leadId, (lead) => {
      const docs = { ...(lead.docs ?? {}) };
      if (Object.prototype.hasOwnProperty.call(docs, defId)) delete docs[defId];
      else docs[defId] = { status: "not-started" };
      return { ...lead, docs };
    });
  },

  patchLeadDocument(leadId: string, defId: string, patch: Partial<LeadDocument>): void {
    mapLead(leadId, (lead) => {
      const existing = lead.docs?.[defId];
      if (!existing) return lead;
      return {
        ...lead,
        docs: { ...lead.docs, [defId]: { ...existing, ...patch, updatedOn: today() } },
      };
    });
  },

  /** Requires every registry document on one application, for the common case. */
  requireAllDocuments(leadId: string): void {
    mapLead(leadId, (lead) => {
      const docs = { ...(lead.docs ?? {}) };
      for (const def of current.documents) {
        if (!Object.prototype.hasOwnProperty.call(docs, def.id)) docs[def.id] = { status: "not-started" };
      }
      return { ...lead, docs };
    });
  },

  addTimelineEntry(leadId: string, entry: { date?: string; kind: TimelineKind; note: string }): void {
    const note = entry.note.trim();
    if (note === "") return;
    const record: TimelineEntry = {
      id: uid(),
      date: entry.date || today(),
      kind: entry.kind,
      note,
      createdAt: new Date().toISOString(),
    };
    mapLead(leadId, (lead) => ({
      ...lead,
      timeline: [record, ...(lead.timeline ?? [])].sort((a, b) =>
        a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
      ),
    }));
  },

  patchTimelineEntry(leadId: string, entryId: string, patch: Partial<TimelineEntry>): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      timeline: (lead.timeline ?? []).map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    }));
  },

  removeTimelineEntry(leadId: string, entryId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      timeline: (lead.timeline ?? []).filter((entry) => entry.id !== entryId),
    }));
  },

  addInterview(leadId: string): string {
    const entry: InterviewRecord = { id: uid(), mode: "video" };
    mapLead(leadId, (lead) => ({ ...lead, interviews: [...lead.interviews, entry] }));
    return entry.id;
  },

  patchInterview(leadId: string, interviewId: string, patch: Partial<InterviewRecord>): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      interviews: lead.interviews.map((entry) => (entry.id === interviewId ? { ...entry, ...patch } : entry)),
    }));
  },

  removeInterview(leadId: string, interviewId: string): void {
    mapLead(leadId, (lead) => ({
      ...lead,
      interviews: lead.interviews.filter((entry) => entry.id !== interviewId),
    }));
  },

  patchOffer(leadId: string, patch: Partial<OfferDetails>): void {
    mapLead(leadId, (lead) => ({ ...lead, offer: { ...(lead.offer ?? {}), ...patch } }));
  },

  /** Replaces the whole document, used by a cloud pull and by import. */
  replaceState(next: TrackerState): void {
    update(() => next);
  },

  markSynced(at: string): void {
    update((previous) => ({ ...previous, lastSyncAt: at }));
  },

  /** Stamped by the export button so the stale-backup reminder can reset. */
  markBackedUp(): void {
    update((previous) => ({ ...previous, lastBackupAt: new Date().toISOString() }));
  },

  patchSettings(patch: Partial<TrackerSettings>): void {
    update((previous) => ({ ...previous, settings: { ...previous.settings, ...patch } }));
  },

  /** Replaces everything with an imported backup. Returns false if the file was not usable. */
  importState(raw: string): boolean {
    let parsed: Record<string, unknown> | unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return false;
    }
    // Shape check, not a fullness check. A backup holding only a customised
    // document registry and settings is legitimate, while an unrelated JSON
    // file that happens to contain a "leads" count is not.
    if (!isRecord(parsed)) return false;
    const looksLikeTracker =
      typeof parsed.version === "number" &&
      ["leads", "documents", "recommenders", "tests"].some((key) => Array.isArray(parsed[key]));
    if (!looksLikeTracker) return false;

    update(() => normalizeState(parsed));
    return true;
  },

  resetAll(): void {
    clearState();
    current = emptyState();
    storageBlocked = false;
    publish();
  },
};

export type TrackerActions = typeof trackerActions;
