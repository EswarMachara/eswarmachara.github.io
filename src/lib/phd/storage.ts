import { DEFAULT_SETTINGS, TRACKER_VERSION, emptyState } from "./types";
import type {
  DocumentDef,
  DocumentStatus,
  InterviewMode,
  Lead,
  LeadDocument,
  LeadSource,
  OfferDetails,
  TimelineKind,
  TrackerState,
} from "./types";

export const STORAGE_KEY = "phd-bench:v1";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Rebuilds a state object from untrusted JSON, whether it came from
 * localStorage or an imported backup file. Anything unrecognised is dropped and
 * anything missing falls back to a default, so a partial or older document
 * still loads instead of throwing the whole tracker away.
 */
export function normalizeState(input: unknown): TrackerState {
  if (!isRecord(input)) return emptyState();

  const leads = Array.isArray(input.leads) ? input.leads.filter(isRecord).map(normalizeLead) : [];
  const recommenders = Array.isArray(input.recommenders)
    ? input.recommenders.filter(isRecord).map((person) => ({
        id: typeof person.id === "string" ? person.id : uid(),
        name: typeof person.name === "string" ? person.name : "Unnamed",
        role: asOptionalString(person.role),
        affiliation: asOptionalString(person.affiliation),
        email: asOptionalString(person.email),
        profileUrl: asOptionalString(person.profileUrl),
        askedOn: asOptionalString(person.askedOn),
        agreed: typeof person.agreed === "boolean" ? person.agreed : undefined,
        notes: asOptionalString(person.notes),
      }))
    : [];
  const tests = Array.isArray(input.tests)
    ? input.tests.filter(isRecord).map((test) => ({
        id: typeof test.id === "string" ? test.id : uid(),
        name: typeof test.name === "string" ? test.name : "Test",
        takenOn: asOptionalString(test.takenOn),
        score: asOptionalString(test.score),
        validUntil: asOptionalString(test.validUntil),
        notes: asOptionalString(test.notes),
      }))
    : [];

  const settingsInput = isRecord(input.settings) ? input.settings : {};

  // The document registry. Older saved documents kept a per-lead array instead,
  // so any name found only on a lead is hoisted into the registry below.
  const registry: DocumentDef[] = Array.isArray(input.documents)
    ? input.documents.filter(isRecord).map((def, index) => ({
        id: typeof def.id === "string" ? def.id : uid(),
        name: typeof def.name === "string" && def.name.trim() !== "" ? def.name : "Untitled document",
        order: typeof def.order === "number" && Number.isFinite(def.order) ? def.order : index,
      }))
    : [];
  migrateLegacyLeadDocuments(leads, registry);

  return {
    version: TRACKER_VERSION,
    leads,
    documents: registry.sort((a, b) => a.order - b.order).map((def, index) => ({ ...def, order: index })),
    recommenders,
    tests,
    settings: {
      targetIntake:
        typeof settingsInput.targetIntake === "string" ? settingsInput.targetIntake : DEFAULT_SETTINGS.targetIntake,
      lorLeadDays: asPositiveInt(settingsInput.lorLeadDays, DEFAULT_SETTINGS.lorLeadDays),
      draftLeadDays: asPositiveInt(settingsInput.draftLeadDays, DEFAULT_SETTINGS.draftLeadDays),
      followUpDays: asPositiveInt(settingsInput.followUpDays, DEFAULT_SETTINGS.followUpDays),
      backupReminderDays: asPositiveInt(settingsInput.backupReminderDays, DEFAULT_SETTINGS.backupReminderDays),
    },
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
    lastBackupAt: asOptionalString(input.lastBackupAt),
    lastSyncAt: asOptionalString(input.lastSyncAt),
  };
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function asPositiveInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback;
}

function normalizeLead(input: Record<string, unknown>): Lead {
  const now = new Date().toISOString();
  return {
    id: typeof input.id === "string" ? input.id : uid(),
    university: typeof input.university === "string" ? input.university : "Untitled",
    program: typeof input.program === "string" ? input.program : "",
    department: asOptionalString(input.department),
    lab: asOptionalString(input.lab),
    labUrl: asOptionalString(input.labUrl),
    researchArea: asOptionalString(input.researchArea),
    source: asLeadSource(input.source),
    sourceUrl: asOptionalString(input.sourceUrl),
    country: asOptionalString(input.country),
    city: asOptionalString(input.city),
    degree:
      input.degree === "phd" ||
      input.degree === "ms-phd" ||
      input.degree === "ms" ||
      input.degree === "fellowship" ||
      input.degree === "other"
        ? input.degree
        : "phd",
    status: isLeadStatus(input.status) ? input.status : "researching",
    priority:
      input.priority === "dream" || input.priority === "strong" || input.priority === "solid" || input.priority === "backup"
        ? input.priority
        : "solid",
    fit: typeof input.fit === "number" && input.fit >= 1 && input.fit <= 5 ? Math.round(input.fit) : undefined,
    deadline: asOptionalString(input.deadline),
    deadlineKind:
      input.deadlineKind === "hard" ||
      input.deadlineKind === "priority" ||
      input.deadlineKind === "rolling" ||
      input.deadlineKind === "unknown"
        ? input.deadlineKind
        : "unknown",
    opensOn: asOptionalString(input.opensOn),
    lorDeadline: asOptionalString(input.lorDeadline),
    expectedDecision: asOptionalString(input.expectedDecision),
    intake: asOptionalString(input.intake),
    funding: asOptionalString(input.funding),
    fundingNote: asOptionalString(input.fundingNote),
    folderUrl: asOptionalString(input.folderUrl),
    whyThisLab: asOptionalString(input.whyThisLab),
    sopAngle: asOptionalString(input.sopAngle),
    feeUsd: typeof input.feeUsd === "number" && Number.isFinite(input.feeUsd) ? input.feeUsd : undefined,
    feeWaiver: typeof input.feeWaiver === "boolean" ? input.feeWaiver : undefined,
    programUrl: asOptionalString(input.programUrl),
    portalUrl: asOptionalString(input.portalUrl),
    lorCount: typeof input.lorCount === "number" && input.lorCount > 0 ? Math.round(input.lorCount) : undefined,
    requirements: Array.isArray(input.requirements)
      ? input.requirements.filter(isRecord).map((item) => ({
          id: typeof item.id === "string" ? item.id : uid(),
          label: typeof item.label === "string" ? item.label : "Item",
          done: item.done === true,
        }))
      : [],
    docs: isRecord(input.docs) ? normalizeLeadDocs(input.docs) : {},
    // Carried only until migrateLegacyLeadDocuments folds it into the registry.
    ...(Array.isArray(input.documents) && input.documents.length > 0
      ? { __legacyDocuments: input.documents }
      : {}),
    timeline: Array.isArray(input.timeline)
      ? input.timeline
          .filter(isRecord)
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : uid(),
            date: asOptionalString(entry.date) ?? new Date().toISOString().slice(0, 10),
            kind: asTimelineKind(entry.kind),
            note: typeof entry.note === "string" ? entry.note : "",
            replied: typeof entry.replied === "boolean" ? entry.replied : undefined,
            auto: entry.auto === true ? true : undefined,
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : now,
          }))
          // Newest first, so the drawer never has to re-sort on render.
          .sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)))
      : [],
    interviews: Array.isArray(input.interviews)
      ? input.interviews.filter(isRecord).map((entry) => ({
          id: typeof entry.id === "string" ? entry.id : uid(),
          date: asOptionalString(entry.date),
          time: asOptionalString(entry.time),
          timezone: asOptionalString(entry.timezone),
          mode: asInterviewMode(entry.mode),
          withWhom: asOptionalString(entry.withWhom),
          prepNotes: asOptionalString(entry.prepNotes),
          questionsToAsk: asOptionalString(entry.questionsToAsk),
          done: entry.done === true,
          outcome: asOptionalString(entry.outcome),
        }))
      : [],
    offer: isRecord(input.offer) ? normalizeOffer(input.offer) : undefined,
    advisors: Array.isArray(input.advisors)
      ? input.advisors.filter(isRecord).map((advisor) => ({
          id: typeof advisor.id === "string" ? advisor.id : uid(),
          name: typeof advisor.name === "string" ? advisor.name : "Unnamed",
          profileUrl: asOptionalString(advisor.profileUrl),
          area: asOptionalString(advisor.area),
          emailedOn: asOptionalString(advisor.emailedOn),
          repliedOn: asOptionalString(advisor.repliedOn),
          outcome:
            advisor.outcome === "awaiting" ||
            advisor.outcome === "positive" ||
            advisor.outcome === "neutral" ||
            advisor.outcome === "negative" ||
            advisor.outcome === "no-reply"
              ? advisor.outcome
              : undefined,
          notes: asOptionalString(advisor.notes),
        }))
      : [],
    recommenderIds: Array.isArray(input.recommenderIds)
      ? input.recommenderIds.filter((id): id is string => typeof id === "string")
      : [],
    submittedOn: asOptionalString(input.submittedOn),
    decisionOn: asOptionalString(input.decisionOn),
    notes: asOptionalString(input.notes),
    createdAt: typeof input.createdAt === "string" ? input.createdAt : now,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : now,
  };
}

function asLeadSource(value: unknown): LeadSource | undefined {
  const allowed: LeadSource[] = [
    "unknown",
    "linkedin",
    "twitter",
    "lab-site",
    "mailing-list",
    "conference",
    "referral",
    "cold-search",
    "other",
  ];
  return allowed.includes(value as LeadSource) ? (value as LeadSource) : undefined;
}

function asTimelineKind(value: unknown): TimelineKind {
  const allowed: TimelineKind[] = [
    "email-sent",
    "reply",
    "follow-up",
    "call",
    "meeting",
    "submitted",
    "status",
    "note",
  ];
  return allowed.includes(value as TimelineKind) ? (value as TimelineKind) : "note";
}

function normalizeLeadDocs(input: Record<string, unknown>): Record<string, LeadDocument> {
  const out: Record<string, LeadDocument> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!isRecord(value)) continue;
    out[key] = {
      status: asDocumentStatus(value.status),
      url: asOptionalString(value.url),
      wordLimit: typeof value.wordLimit === "number" && value.wordLimit > 0 ? Math.round(value.wordLimit) : undefined,
      updatedOn: asOptionalString(value.updatedOn),
      notes: asOptionalString(value.notes),
    };
  }
  return out;
}

/** Names used by the pre-registry per-lead document model, for migration only. */
const LEGACY_DOCUMENT_NAMES: Record<string, string> = {
  sop: "Statement of purpose",
  "research-statement": "Research statement",
  cv: "Academic CV",
  "personal-statement": "Personal / diversity statement",
  "writing-sample": "Writing sample",
  "research-proposal": "Research proposal",
  other: "Other document",
};

/**
 * Moves documents from the old per-lead array shape into the global registry,
 * in place. Called once per load; leads saved under the current shape carry an
 * empty legacy array and are left untouched.
 *
 * Matching is by display name so two leads that both listed "Statement of
 * purpose" converge on one registry entry instead of creating duplicates.
 */
function migrateLegacyLeadDocuments(leads: Lead[], registry: DocumentDef[]): void {
  const byName = new Map(registry.map((def) => [def.name.toLowerCase(), def]));

  for (const lead of leads) {
    const legacy = (lead as unknown as { __legacyDocuments?: unknown }).__legacyDocuments;
    if (!Array.isArray(legacy) || legacy.length === 0) continue;

    for (const raw of legacy) {
      if (!isRecord(raw)) continue;
      const label =
        asOptionalString(raw.label) ??
        (typeof raw.kind === "string" ? LEGACY_DOCUMENT_NAMES[raw.kind] : undefined) ??
        "Other document";
      let def = byName.get(label.toLowerCase());
      if (!def) {
        def = { id: uid(), name: label, order: registry.length };
        registry.push(def);
        byName.set(label.toLowerCase(), def);
      }
      lead.docs[def.id] = {
        status: asDocumentStatus(raw.status),
        url: asOptionalString(raw.url),
        wordLimit: typeof raw.wordLimit === "number" && raw.wordLimit > 0 ? Math.round(raw.wordLimit) : undefined,
        updatedOn: asOptionalString(raw.updatedOn),
        notes: asOptionalString(raw.notes),
      };
    }
    delete (lead as unknown as { __legacyDocuments?: unknown }).__legacyDocuments;
  }
}

function asDocumentStatus(value: unknown): DocumentStatus {
  const allowed: DocumentStatus[] = ["not-started", "drafting", "review", "final"];
  return allowed.includes(value as DocumentStatus) ? (value as DocumentStatus) : "not-started";
}

function asInterviewMode(value: unknown): InterviewMode {
  const allowed: InterviewMode[] = ["video", "phone", "in-person"];
  return allowed.includes(value as InterviewMode) ? (value as InterviewMode) : "video";
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function normalizeOffer(input: Record<string, unknown>): OfferDetails {
  return {
    stipendAmount: asNumber(input.stipendAmount),
    currency: asOptionalString(input.currency),
    stipendPeriod: input.stipendPeriod === "month" || input.stipendPeriod === "year" ? input.stipendPeriod : undefined,
    guaranteedYears: asNumber(input.guaranteedYears),
    tuitionWaived: typeof input.tuitionWaived === "boolean" ? input.tuitionWaived : undefined,
    healthCovered: typeof input.healthCovered === "boolean" ? input.healthCovered : undefined,
    monthlyLivingCost: asNumber(input.monthlyLivingCost),
    respondBy: asOptionalString(input.respondBy),
    advisorConfirmed: asOptionalString(input.advisorConfirmed),
    notes: asOptionalString(input.notes),
  };
}

function isLeadStatus(value: unknown): value is Lead["status"] {
  return (
    value === "researching" ||
    value === "shortlisted" ||
    value === "preparing" ||
    value === "submitted" ||
    value === "interview" ||
    value === "offer" ||
    value === "waitlisted" ||
    value === "rejected" ||
    value === "declined" ||
    value === "withdrawn"
  );
}

/** Reads saved state. Returns null when there is nothing stored or storage is unavailable. */
export function loadState(): TrackerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch {
    // Private browsing, blocked site data, or a corrupted document. Start clean
    // rather than leaving the page broken.
    return null;
  }
}

export function saveState(state: TrackerState): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do if storage refuses the write.
  }
}

/** Hands the browser a file. Used for both the JSON backup and the calendar export. */
export function downloadFile(filename: string, contents: string, mime: string): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the download has already started.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportFilename(prefix: string, extension: string): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
  return `${prefix}-${stamp}.${extension}`;
}
