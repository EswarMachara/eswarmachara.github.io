import type {
  DeadlineKind,
  DegreeKind,
  DocumentStatus,
  InterviewMode,
  LeadSource,
  LeadStatus,
  Priority,
  TimelineKind,
} from "./types";

interface StatusMeta {
  label: string;
  /** Utility class for the chip background. Tokens live in globals.css. */
  chip: string;
  /** Column order on the pipeline board. */
  order: number;
  /** Terminal statuses stop raising deadline alerts and leave the active pipeline. */
  terminal: boolean;
  /** Counts as "the application is in", so readiness nagging stops. */
  filed: boolean;
}

export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  researching: { label: "Researching", chip: "bg-track-researching text-white", order: 0, terminal: false, filed: false },
  shortlisted: { label: "Shortlisted", chip: "bg-track-shortlisted text-white", order: 1, terminal: false, filed: false },
  preparing: { label: "Preparing", chip: "bg-track-preparing text-white", order: 2, terminal: false, filed: false },
  submitted: { label: "Submitted", chip: "bg-track-submitted text-white", order: 3, terminal: false, filed: true },
  interview: { label: "Interview", chip: "bg-track-interview text-white", order: 4, terminal: false, filed: true },
  offer: { label: "Offer", chip: "bg-track-offer text-white", order: 5, terminal: true, filed: true },
  waitlisted: { label: "Waitlisted", chip: "bg-track-waitlisted text-white", order: 6, terminal: false, filed: true },
  rejected: { label: "Rejected", chip: "bg-track-rejected text-white", order: 7, terminal: true, filed: true },
  declined: { label: "Declined by me", chip: "bg-track-closed text-white", order: 8, terminal: true, filed: true },
  withdrawn: { label: "Withdrawn", chip: "bg-track-closed text-white", order: 9, terminal: true, filed: true },
};

export const STATUS_ORDER: LeadStatus[] = (Object.keys(STATUS_META) as LeadStatus[]).sort(
  (a, b) => STATUS_META[a].order - STATUS_META[b].order,
);

/** Columns shown on the pipeline board. Closed-out statuses are reachable from the list view instead. */
export const BOARD_STATUSES: LeadStatus[] = [
  "researching",
  "shortlisted",
  "preparing",
  "submitted",
  "interview",
  "offer",
];

export const PRIORITY_META: Record<Priority, { label: string; order: number; dot: string }> = {
  dream: { label: "Dream", order: 0, dot: "bg-wine" },
  strong: { label: "Strong fit", order: 1, dot: "bg-gold" },
  solid: { label: "Solid", order: 2, dot: "bg-stone-400" },
  backup: { label: "Backup", order: 3, dot: "bg-stone-300" },
};

export const PRIORITY_ORDER: Priority[] = ["dream", "strong", "solid", "backup"];

export const DEGREE_LABELS: Record<DegreeKind, string> = {
  phd: "PhD (direct)",
  "ms-phd": "MS leading to PhD",
  ms: "Master's",
  fellowship: "Fellowship / programme",
  other: "Other",
};

export const DEADLINE_KIND_LABELS: Record<DeadlineKind, string> = {
  hard: "Hard deadline",
  priority: "Priority / early round",
  rolling: "Rolling admission",
  unknown: "Not confirmed yet",
};

/**
 * Requirement checklists by application type. Picking a preset when a lead is
 * created saves retyping the same ten items, and the list stays editable after.
 */
export const CHECKLIST_PRESETS: { id: string; label: string; hint: string; items: string[] }[] = [
  {
    id: "us-phd",
    label: "US / Canada PhD",
    hint: "Portal-based, letters uploaded by referees, fee per application",
    items: [
      "Confirm deadline and requirements on the department page",
      "Create portal account",
      "Statement of purpose, tailored to this department",
      "CV updated for this application",
      "Transcripts uploaded",
      "Recommenders entered in the portal",
      "English test score sent (TOEFL / IELTS / DET)",
      "GRE score sent, or confirmed not required",
      "Personal history / diversity statement, if asked",
      "List of faculty named in the statement",
      "Application fee paid or waiver approved",
      "Final read-through, then submit",
    ],
  },
  {
    id: "eu-phd",
    label: "Europe, project-based",
    hint: "Advisor contact usually comes before the formal application",
    items: [
      "Read the funded project description end to end",
      "Email the PI with a short, specific pitch",
      "Motivation letter for this project",
      "CV in the format the group asked for",
      "Research proposal or statement of interest",
      "Transcripts, with grading scale explained",
      "Referee contact details confirmed",
      "Language certificate, if required",
      "Submit through the university portal",
    ],
  },
  {
    id: "ellis-mpi",
    label: "ELLIS / Max Planck style",
    hint: "One central application, several institutes ranked",
    items: [
      "Shortlist and rank the institutes or advisors",
      "Research statement",
      "CV and transcripts",
      "Referees registered in the central portal",
      "Advisor preferences submitted",
      "Confirm submission receipt",
    ],
  },
  {
    id: "india-phd",
    label: "India, direct PhD",
    hint: "IISc, IITs, TIFR, IIITs: written test or national score, then interview",
    items: [
      "Check eligibility and category requirements",
      "Application form filled",
      "Transcripts and degree certificates",
      "GATE / JRF / NET score, if applicable",
      "Research statement or area preference",
      "Referee details entered",
      "Fee paid",
      "Written test and interview dates noted",
    ],
  },
  {
    id: "fellowship",
    label: "Fellowship or scholarship",
    hint: "Separate from the programme application, often an earlier deadline",
    items: [
      "Confirm eligibility, including nationality and stage",
      "Personal statement",
      "Research proposal",
      "Budget or funding plan, if required",
      "Referees briefed on this specific award",
      "Institutional endorsement, if required",
      "Submit",
    ],
  },
  {
    id: "blank",
    label: "Start empty",
    hint: "Add your own items in the detail panel",
    items: [],
  },
];

export const OUTREACH_OUTCOME_LABELS = {
  awaiting: "Waiting on reply",
  positive: "Positive",
  neutral: "Neutral",
  negative: "Not taking students",
  "no-reply": "No reply",
} as const;


export const DOCUMENT_STATUS_META: Record<DocumentStatus, { label: string; chip: string; weight: number }> = {
  "not-started": { label: "Not started", chip: "bg-stone-200 text-ink-soft", weight: 0 },
  drafting: { label: "Drafting", chip: "bg-track-preparing text-white", weight: 1 },
  review: { label: "In review", chip: "bg-track-submitted text-white", weight: 2 },
  final: { label: "Final", chip: "bg-track-offer text-white", weight: 3 },
};

export const DOCUMENT_STATUS_ORDER: DocumentStatus[] = ["not-started", "drafting", "review", "final"];

/**
 * Seeded into the document registry the first time the tracker is opened. These
 * are the artefacts a PhD application in this field almost always wants; the
 * list is fully editable afterwards.
 */
export const DEFAULT_DOCUMENTS: string[] = [
  "Statement of purpose",
  "Research statement",
  "Academic CV",
  "Transcripts",
  "Personal / diversity statement",
  "Writing sample",
  "English test score report",
  "Publication list",
];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  unknown: "Not recorded",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  "lab-site": "Lab website",
  "mailing-list": "Mailing list",
  conference: "Conference",
  referral: "Referral",
  "cold-search": "Cold search",
  other: "Other",
};

export const LEAD_SOURCE_ORDER: LeadSource[] = [
  "linkedin",
  "twitter",
  "lab-site",
  "mailing-list",
  "conference",
  "referral",
  "cold-search",
  "other",
  "unknown",
];

/** Suggestions only. The field is free text so an unusual area is not forced into "Other". */
export const RESEARCH_AREA_SUGGESTIONS = [
  "Medical Imaging",
  "Computational Pathology",
  "Computational Biology",
  "Computer Vision",
  "Multimodal AI / VLMs",
  "Machine Learning",
  "Biomedical Engineering",
  "Robotics",
];

export const TIMELINE_KIND_META: Record<TimelineKind, { label: string; dot: string; outreach: boolean }> = {
  "email-sent": { label: "Email sent", dot: "bg-track-submitted", outreach: true },
  reply: { label: "Reply received", dot: "bg-track-offer", outreach: false },
  "follow-up": { label: "Follow-up", dot: "bg-gold", outreach: true },
  call: { label: "Call", dot: "bg-track-interview", outreach: true },
  meeting: { label: "Meeting", dot: "bg-track-interview", outreach: true },
  submitted: { label: "Submitted", dot: "bg-track-submitted", outreach: false },
  status: { label: "Status change", dot: "bg-stone-400", outreach: false },
  note: { label: "Note", dot: "bg-stone-300", outreach: false },
};

export const TIMELINE_KIND_ORDER: TimelineKind[] = [
  "email-sent",
  "reply",
  "follow-up",
  "call",
  "meeting",
  "submitted",
  "note",
];

/** The date kinds surfaced in the unified deadline feed, with how each should read. */
export const DATE_KIND_META = {
  opens: { label: "Portal opens", tone: "info" as const },
  deadline: { label: "Application deadline", tone: "pressure" as const },
  lor: { label: "Letters due", tone: "pressure" as const },
  interview: { label: "Interview", tone: "pressure" as const },
  decision: { label: "Decision expected", tone: "info" as const },
  offer: { label: "Offer reply due", tone: "pressure" as const },
};

export type DateKind = keyof typeof DATE_KIND_META;

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  video: "Video call",
  phone: "Phone",
  "in-person": "In person",
};

/**
 * Prompts rather than answers. These are the questions worth having ready for a
 * PhD interview, and the ones worth asking back, since an interview that only
 * runs one way tells you nothing about the group you might join.
 */
export const INTERVIEW_PREP_PROMPTS = [
  "Two-minute version of your strongest project, method and result",
  "Why this group specifically, naming their papers",
  "A result of yours that did not work, and what you changed",
  "Where you want your research to go over five years",
  "Which of their papers you would build on first",
];

export const INTERVIEW_QUESTIONS_TO_ASK = [
  "How do you usually work with first-year students?",
  "How many students are in the group, and who graduated recently?",
  "Is funding guaranteed for the full programme, or renewed yearly?",
  "What would I likely work on in year one?",
  "How are authorship and project ownership handled?",
];
