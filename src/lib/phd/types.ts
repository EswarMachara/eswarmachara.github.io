/**
 * Data model for the PhD Bench tracker.
 *
 * Everything here is persisted to localStorage as one JSON document, so the
 * shapes are deliberately plain: no class instances, no Date objects. All
 * calendar dates are stored as "YYYY-MM-DD" strings and interpreted in the
 * reader's local timezone; timestamps are full ISO strings.
 */

/** Where an application currently sits in the funnel. Terminal states are listed last. */
export type LeadStatus =
  | "researching"
  | "shortlisted"
  | "preparing"
  | "submitted"
  | "interview"
  | "offer"
  | "waitlisted"
  | "rejected"
  | "declined"
  | "withdrawn";

/** How much this one matters, which drives sorting when two deadlines collide. */
export type Priority = "dream" | "strong" | "solid" | "backup";

/** Hard deadlines are dated and final; rolling ones stay open, so they never raise urgency alerts. */
export type DeadlineKind = "hard" | "priority" | "rolling" | "unknown";

export type DegreeKind = "phd" | "ms-phd" | "ms" | "fellowship" | "other";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

/** How a cold email to a prospective advisor turned out. */
export type OutreachOutcome = "awaiting" | "positive" | "neutral" | "negative" | "no-reply";

export interface AdvisorContact {
  id: string;
  name: string;
  profileUrl?: string;
  area?: string;
  /** Date the first email went out. Drives the follow-up reminder. */
  emailedOn?: string;
  repliedOn?: string;
  outcome?: OutreachOutcome;
  notes?: string;
}

export type DocumentStatus = "not-started" | "drafting" | "review" | "final";

/**
 * One entry in the global document registry: the set of artefacts you reuse
 * across applications, named once.
 *
 * Defining documents centrally rather than per-application means a checklist
 * item is never retyped, and it makes the cross-application matrix fall out for
 * free. Which of them a given application actually wants is recorded per lead.
 */
export interface DocumentDef {
  id: string;
  name: string;
  order: number;
}

/**
 * Per-application state for one registry document. The presence of a key in
 * `Lead.docs` is what marks that document as required for that application, so
 * "required" and "how far along" live in one place instead of two parallel maps.
 */
export interface LeadDocument {
  status: DocumentStatus;
  /** Link to the draft, wherever it lives. Nothing is uploaded here. */
  url?: string;
  wordLimit?: number;
  updatedOn?: string;
  notes?: string;
}

/**
 * What a timeline entry records. Outreach and admin both land in one stream,
 * because the useful question is always "what happened here, in order", not
 * "what happened in the follow-up log specifically".
 */
export type TimelineKind =
  | "email-sent"
  | "reply"
  | "follow-up"
  | "call"
  | "meeting"
  | "submitted"
  | "status"
  | "note";

export interface TimelineEntry {
  id: string;
  date: string;
  kind: TimelineKind;
  note: string;
  /** Set on outreach entries once an answer arrives, so silence is visible. */
  replied?: boolean;
  /** True when the tracker wrote this itself, e.g. on a status change. */
  auto?: boolean;
  createdAt: string;
}

export type InterviewMode = "video" | "phone" | "in-person";

export interface InterviewRecord {
  id: string;
  date?: string;
  /** Local clock time as "HH:MM", kept separate from the date. */
  time?: string;
  /** Free text, because an interview slot is usually quoted in the host's zone. */
  timezone?: string;
  mode: InterviewMode;
  withWhom?: string;
  prepNotes?: string;
  questionsToAsk?: string;
  done?: boolean;
  outcome?: string;
}

/**
 * Only filled in once an offer arrives. Amounts are compared within a single
 * currency and never converted, since a made-up exchange rate would be worse
 * than no comparison at all.
 */
export interface OfferDetails {
  stipendAmount?: number;
  currency?: string;
  stipendPeriod?: "year" | "month";
  /** Years of funding actually guaranteed in writing. */
  guaranteedYears?: number;
  tuitionWaived?: boolean;
  healthCovered?: boolean;
  /** Your own estimate of monthly living cost in the same currency. */
  monthlyLivingCost?: number;
  /** The date by which the offer has to be accepted or declined. */
  respondBy?: string;
  advisorConfirmed?: string;
  notes?: string;
}

/** Where a lead came from, so the productive channels are visible later. */
export type LeadSource =
  | "unknown"
  | "linkedin"
  | "twitter"
  | "lab-site"
  | "mailing-list"
  | "conference"
  | "referral"
  | "cold-search"
  | "other";

export interface Lead {
  id: string;
  university: string;
  program: string;
  /** Department, when it differs usefully from the programme name. */
  department?: string;
  /** Lab or group, which is often what you are really applying to. */
  lab?: string;
  labUrl?: string;
  /** Free text against a suggested list, used to group the research-area chart. */
  researchArea?: string;
  source?: LeadSource;
  /** The post, tweet or page the lead came from. */
  sourceUrl?: string;
  country?: string;
  city?: string;
  degree: DegreeKind;
  status: LeadStatus;
  priority: Priority;
  /** Self-assessed research fit, 1 to 5. Kept separate from priority on purpose. */
  fit?: number;
  deadline?: string;
  deadlineKind: DeadlineKind;
  /** Date the portal opens. Tracked separately because it is news, not pressure. */
  opensOn?: string;
  /**
   * Explicit date letters are due, when the programme states one. Overrides the
   * date otherwise derived from `settings.lorLeadDays`.
   */
  lorDeadline?: string;
  /** When you expect to hear back, so silence past it becomes actionable. */
  expectedDecision?: string;
  intake?: string;
  funding?: string;
  /** Funding notes from the posting: fully funded, stipend quoted, unclear. */
  fundingNote?: string;
  feeUsd?: number;
  feeWaiver?: boolean;
  programUrl?: string;
  portalUrl?: string;
  /** How many letters this program wants, used to check the linked recommenders are enough. */
  lorCount?: number;
  /** Where the drafts for this application live. */
  folderUrl?: string;
  /**
   * Two prompts rather than one notes box. Articulating fit and the angle before
   * drafting is most of the work of a good statement, and a blank one here is a
   * more honest signal than a full generic notes field.
   */
  whyThisLab?: string;
  sopAngle?: string;
  requirements: ChecklistItem[];
  /** Registry document id to its state for this application. Key present = required. */
  docs: Record<string, LeadDocument>;
  interviews: InterviewRecord[];
  advisors: AdvisorContact[];
  timeline: TimelineEntry[];
  offer?: OfferDetails;
  /** Ids into TrackerState.recommenders. */
  recommenderIds: string[];
  submittedOn?: string;
  decisionOn?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recommender {
  id: string;
  name: string;
  role?: string;
  affiliation?: string;
  email?: string;
  profileUrl?: string;
  /** Date you asked them. A request still unanswered after a while gets flagged. */
  askedOn?: string;
  agreed?: boolean;
  notes?: string;
}

export interface TestRecord {
  id: string;
  name: string;
  takenOn?: string;
  score?: string;
  /** Test scores expire. Two years for TOEFL and IELTS, five for the GRE. */
  validUntil?: string;
  notes?: string;
}

export interface TrackerSettings {
  /** Free text, e.g. "Fall 2027". Shown on new leads by default. */
  targetIntake: string;
  /** Days before a deadline by which letters should already be requested. */
  lorLeadDays: number;
  /** Days before a deadline by which a first statement draft should exist. */
  draftLeadDays: number;
  /** Days of silence after a cold email before a follow-up is suggested. */
  followUpDays: number;
  /** Days without a JSON export before the backup reminder appears. 0 disables it. */
  backupReminderDays: number;
}

export interface TrackerState {
  version: number;
  leads: Lead[];
  /** Global document registry, referenced by `Lead.docs` keys. */
  documents: DocumentDef[];
  recommenders: Recommender[];
  tests: TestRecord[];
  settings: TrackerSettings;
  updatedAt: string;
  /** Set by the export button. Drives the stale-backup reminder. */
  lastBackupAt?: string;
  /** Last successful cloud sync, when cloud sync is configured and signed in. */
  lastSyncAt?: string;
}

export const TRACKER_VERSION = 1;

export const DEFAULT_SETTINGS: TrackerSettings = {
  targetIntake: "Fall 2027",
  lorLeadDays: 45,
  draftLeadDays: 21,
  followUpDays: 12,
  backupReminderDays: 14,
};

export function emptyState(): TrackerState {
  return {
    version: TRACKER_VERSION,
    leads: [],
    documents: [],
    recommenders: [],
    tests: [],
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: new Date().toISOString(),
  };
}
