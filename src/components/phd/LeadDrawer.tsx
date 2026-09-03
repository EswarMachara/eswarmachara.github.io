"use client";

import { useEffect, useRef, useState } from "react";
import { FaCopy, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { addDays, daysSince, daysUntil, formatDate } from "@/lib/phd/dates";
import { documentProgress, milestonesFor, readinessOf } from "@/lib/phd/derive";
import {
  CHECKLIST_PRESETS,
  DEADLINE_KIND_LABELS,
  DEGREE_LABELS,
  DOCUMENT_STATUS_META,
  DOCUMENT_STATUS_ORDER,
  INTERVIEW_MODE_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_SOURCE_ORDER,
  OUTREACH_OUTCOME_LABELS,
  PRIORITY_META,
  PRIORITY_ORDER,
  RESEARCH_AREA_SUGGESTIONS,
  TIMELINE_KIND_META,
  TIMELINE_KIND_ORDER,
} from "@/lib/phd/presets";
import type {
  DeadlineKind,
  DegreeKind,
  DocumentStatus,
  InterviewMode,
  Lead,
  LeadSource,
  OutreachOutcome,
  Priority,
  TimelineKind,
  TrackerState,
} from "@/lib/phd/types";
import type { TrackerActions } from "@/lib/phd/useTracker";
import { CountdownChip, Field, GhostButton, ReadinessBar, StatusSelect, TextInput } from "./ui";
import { useOverlay } from "./useOverlay";
import { safeExternalUrl } from "@/lib/phd/urls";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h3 className="shrink-0 font-heading text-base font-medium text-ink">{label}</h3>
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  );
}

function AdvisorRow({
  lead,
  advisorId,
  actions,
  followUpDays,
}: {
  lead: Lead;
  advisorId: string;
  actions: TrackerActions;
  followUpDays: number;
}) {
  const advisor = lead.advisors.find((entry) => entry.id === advisorId);
  if (!advisor) return null;

  const waited = advisor.emailedOn && !advisor.repliedOn ? daysSince(advisor.emailedOn) : null;
  const overdue = waited !== null && waited >= followUpDays;

  return (
    <li className="rounded-lg border border-stone-200 bg-paper p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <TextInput
            value={advisor.name}
            onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { name: value })}
            placeholder="Professor name"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <TextInput
              value={advisor.area ?? ""}
              onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { area: value || undefined })}
              placeholder="Research area"
            />
            <TextInput
              type="url"
              value={advisor.profileUrl ?? ""}
              onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { profileUrl: value || undefined })}
              placeholder="Profile or lab page"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Emailed">
              <TextInput
                type="date"
                value={advisor.emailedOn ?? ""}
                onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { emailedOn: value || undefined })}
              />
            </Field>
            <Field label="Replied">
              <TextInput
                type="date"
                value={advisor.repliedOn ?? ""}
                onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { repliedOn: value || undefined })}
              />
            </Field>
            <Field label="Outcome">
              <select
                value={advisor.outcome ?? "awaiting"}
                onChange={(event) =>
                  actions.patchAdvisor(lead.id, advisor.id, { outcome: event.target.value as OutreachOutcome })
                }
                className="track-field"
              >
                {Object.entries(OUTREACH_OUTCOME_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {overdue && (
            <p className="text-xs font-medium text-track-rejected">
              No reply logged after {waited} days. A single short follow-up is normal here.
            </p>
          )}
          <TextInput
            value={advisor.notes ?? ""}
            onChange={(value) => actions.patchAdvisor(lead.id, advisor.id, { notes: value || undefined })}
            placeholder="What they said, papers to read, next step"
          />
        </div>
        <button
          type="button"
          onClick={() => actions.removeAdvisor(lead.id, advisor.id)}
          aria-label={`Remove ${advisor.name}`}
          className="shrink-0 rounded p-1.5 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </li>
  );
}

export default function LeadDrawer({
  lead,
  state,
  actions,
  onClose,
  onOpenLead,
}: {
  lead: Lead;
  state: TrackerState;
  actions: TrackerActions;
  onClose: () => void;
  onOpenLead: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [newAdvisor, setNewAdvisor] = useState("");
  const [entryNote, setEntryNote] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryKind, setEntryKind] = useState<TimelineKind>("email-sent");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const panelRef = useOverlay(onClose);
  const closeRef = useRef<HTMLButtonElement>(null);

  const ready = readinessOf(lead);
  const docs = documentProgress(lead);
  const days = daysUntil(lead.deadline);
  const milestones = milestonesFor(lead, state.settings);
  // Only http(s) links are offered. A javascript: or data: value typed into one
  // of these fields would otherwise render as a clickable anchor.
  const links: { label: string; href: string }[] = [
    { label: "Open programme page", href: safeExternalUrl(lead.programUrl) },
    { label: "Open portal", href: safeExternalUrl(lead.portalUrl) },
    { label: "Lab site", href: safeExternalUrl(lead.labUrl) },
    { label: "Drafts folder", href: safeExternalUrl(lead.folderUrl) },
    { label: "Original post", href: safeExternalUrl(lead.sourceUrl) },
  ].flatMap((link) => (link.href ? [{ label: link.label, href: link.href }] : []));

  useEffect(() => {
    closeRef.current?.focus();
  }, [lead.id]);

  const patch = (values: Partial<Lead>) => actions.patchLead(lead.id, values);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${lead.university} details`}
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-stone-200 bg-paper shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-stone-200 bg-paper/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <input
              value={lead.university}
              onChange={(event) => patch({ university: event.target.value })}
              aria-label="University"
              className="w-full border-none bg-transparent p-0 font-heading text-xl font-medium text-ink focus:outline-none"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <CountdownChip days={days} kind={lead.deadlineKind} />
              <span className="text-xs text-ink-soft">{formatDate(lead.deadline)}</span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-ink-soft transition-colors hover:bg-stone-100 hover:text-ink"
          >
            <FaXmark size={16} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Programme or department" htmlFor="lead-program">
              <TextInput
                id="lead-program"
                value={lead.program}
                onChange={(value) => patch({ program: value })}
                placeholder="e.g. Biomedical Engineering"
              />
            </Field>
            <Field label="Status" htmlFor="lead-status">
              {/* setStatus also stamps the submitted or decision date the first time it is reached. */}
              <StatusSelect id="lead-status" value={lead.status} onChange={(status) => actions.setStatus(lead.id, status)} />
            </Field>
            <Field label="Country" htmlFor="lead-country">
              <TextInput id="lead-country" value={lead.country ?? ""} onChange={(value) => patch({ country: value || undefined })} placeholder="e.g. United States" />
            </Field>
            <Field label="City" htmlFor="lead-city">
              <TextInput id="lead-city" value={lead.city ?? ""} onChange={(value) => patch({ city: value || undefined })} />
            </Field>
            <Field label="Degree" htmlFor="lead-degree">
              <select
                id="lead-degree"
                value={lead.degree}
                onChange={(event) => patch({ degree: event.target.value as DegreeKind })}
                className="track-field"
              >
                {Object.entries(DEGREE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority" htmlFor="lead-priority">
              <select
                id="lead-priority"
                value={lead.priority}
                onChange={(event) => patch({ priority: event.target.value as Priority })}
                className="track-field"
              >
                {PRIORITY_ORDER.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Divider label="Lab" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Department" htmlFor="lead-department">
              <TextInput
                id="lead-department"
                value={lead.department ?? ""}
                onChange={(value) => patch({ department: value || undefined })}
                placeholder="e.g. EECS, BME"
              />
            </Field>
            <Field label="Lab or group" htmlFor="lead-lab">
              <TextInput
                id="lead-lab"
                value={lead.lab ?? ""}
                onChange={(value) => patch({ lab: value || undefined })}
                placeholder="Often what you are really applying to"
              />
            </Field>
            <Field label="Lab website" htmlFor="lead-laburl">
              <TextInput
                id="lead-laburl"
                type="url"
                value={lead.labUrl ?? ""}
                onChange={(value) => patch({ labUrl: value || undefined })}
                placeholder="https://"
              />
            </Field>
            <Field label="Research area" htmlFor="lead-area" hint="Groups the research-area chart on Insights.">
              <input
                id="lead-area"
                list="phd-research-areas"
                value={lead.researchArea ?? ""}
                onChange={(event) => patch({ researchArea: event.target.value || undefined })}
                placeholder="e.g. Medical Imaging"
                className="track-field"
              />
              <datalist id="phd-research-areas">
                {RESEARCH_AREA_SUGGESTIONS.map((area) => (
                  <option key={area} value={area} />
                ))}
              </datalist>
            </Field>
            <Field label="Where you found it" htmlFor="lead-source">
              <select
                id="lead-source"
                value={lead.source ?? "unknown"}
                onChange={(event) => patch({ source: event.target.value as LeadSource })}
                className="track-field"
              >
                {LEAD_SOURCE_ORDER.map((source) => (
                  <option key={source} value={source}>
                    {LEAD_SOURCE_LABELS[source]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Source link" htmlFor="lead-sourceurl">
              <TextInput
                id="lead-sourceurl"
                type="url"
                value={lead.sourceUrl ?? ""}
                onChange={(value) => patch({ sourceUrl: value || undefined })}
                placeholder="The post or page it came from"
              />
            </Field>
          </div>

          <Divider label="Deadline" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Date" htmlFor="lead-deadline">
              <TextInput id="lead-deadline" type="date" value={lead.deadline ?? ""} onChange={(value) => patch({ deadline: value || undefined })} />
            </Field>
            <Field label="Kind" htmlFor="lead-deadline-kind">
              <select
                id="lead-deadline-kind"
                value={lead.deadlineKind}
                onChange={(event) => patch({ deadlineKind: event.target.value as DeadlineKind })}
                className="track-field"
              >
                {Object.entries(DEADLINE_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Intake" htmlFor="lead-intake">
              <TextInput id="lead-intake" value={lead.intake ?? ""} onChange={(value) => patch({ intake: value || undefined })} placeholder={state.settings.targetIntake} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Portal opens" htmlFor="lead-opens" hint="Create the account early.">
              <TextInput
                id="lead-opens"
                type="date"
                value={lead.opensOn ?? ""}
                onChange={(value) => patch({ opensOn: value || undefined })}
              />
            </Field>
            <Field label="Letters due" htmlFor="lead-lordate" hint="Overrides the derived referee date.">
              <TextInput
                id="lead-lordate"
                type="date"
                value={lead.lorDeadline ?? ""}
                onChange={(value) => patch({ lorDeadline: value || undefined })}
              />
            </Field>
            <Field label="Decision expected" htmlFor="lead-expected" hint="Silence past this becomes actionable.">
              <TextInput
                id="lead-expected"
                type="date"
                value={lead.expectedDecision ?? ""}
                onChange={(value) => patch({ expectedDecision: value || undefined })}
              />
            </Field>
          </div>

          {milestones.length > 0 && lead.deadline && (
            <ul className="space-y-1.5 rounded-lg border border-stone-200 bg-paper-raised/40 px-4 py-3">
              {milestones.map((milestone) => {
                const date = milestone.offset === 0 ? lead.deadline : addDays(lead.deadline as string, milestone.offset);
                const remaining = daysUntil(date ?? undefined);
                return (
                  <li key={milestone.label} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-ink-soft">{milestone.label}</span>
                    <span className={`tabular-nums ${remaining !== null && remaining < 0 ? "text-track-rejected" : "text-ink"}`}>
                      {formatDate(date ?? undefined)}
                      {remaining !== null && ` (${remaining < 0 ? `${Math.abs(remaining)}d ago` : `${remaining}d`})`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <Divider label="Requirements" />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ReadinessBar percent={ready.percent} done={ready.done} total={ready.total} />
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-ink">{ready.percent}%</span>
          </div>

          {lead.requirements.length > 0 && (
            <ul className="space-y-1">
              {lead.requirements.map((item) => (
                <li key={item.id} className="group flex items-start gap-2.5 rounded px-1 py-1 hover:bg-paper-raised/60">
                  <input
                    type="checkbox"
                    id={`req-${item.id}`}
                    checked={item.done}
                    onChange={() => actions.toggleRequirement(lead.id, item.id)}
                    className="mt-0.5 shrink-0 accent-wine"
                  />
                  <label
                    htmlFor={`req-${item.id}`}
                    className={`flex-1 cursor-pointer text-sm leading-snug ${item.done ? "text-ink-soft/60 line-through" : "text-ink-soft"}`}
                  >
                    {item.label}
                  </label>
                  <button
                    type="button"
                    onClick={() => actions.removeRequirement(lead.id, item.id)}
                    aria-label={`Remove ${item.label}`}
                    className="shrink-0 rounded p-1 text-ink-soft/70 transition-colors hover:text-track-rejected sm:text-ink-soft/0 sm:group-hover:text-ink-soft/60 sm:group-focus-within:text-ink-soft/60"
                  >
                    <FaTrash size={10} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              actions.addRequirement(lead.id, newItem);
              setNewItem("");
            }}
            className="flex gap-2"
          >
            <TextInput value={newItem} onChange={setNewItem} placeholder="Add a requirement" />
            <GhostButton type="submit">
              <FaPlus size={10} /> Add
            </GhostButton>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-soft">Merge in a preset:</span>
            {CHECKLIST_PRESETS.filter((preset) => preset.items.length > 0).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => actions.applyPreset(lead.id, preset.id)}
                title={preset.hint}
                className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[0.7rem] text-ink-soft transition-colors hover:border-gold hover:text-ink"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <Divider label="Documents" />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ReadinessBar percent={docs.percent} done={docs.final} total={docs.total} />
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-ink">{docs.percent}%</span>
          </div>
          {state.documents.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Your document list is empty. Set it up once on the Materials tab and every application can then tick
              off the same named documents.
            </p>
          ) : (
            <>
              <p className="text-xs text-ink-soft">
                Tick the documents this programme actually asks for, then track each one&apos;s state.
              </p>
              <ul className="space-y-1.5">
                {[...state.documents]
                  .sort((a, b) => a.order - b.order)
                  .map((def) => {
                    const entry = lead.docs?.[def.id];
                    const required = Boolean(entry);
                    return (
                      <li
                        key={def.id}
                        className={`rounded-lg border px-3 py-2 transition-colors ${
                          required ? "border-stone-200 bg-paper" : "border-transparent bg-paper-raised/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            id={`doc-${lead.id}-${def.id}`}
                            checked={required}
                            onChange={() => actions.toggleLeadDocument(lead.id, def.id)}
                            className="shrink-0 accent-wine"
                          />
                          <label
                            htmlFor={`doc-${lead.id}-${def.id}`}
                            className={`flex-1 cursor-pointer text-sm ${required ? "text-ink" : "text-ink-soft/70"}`}
                          >
                            {def.name}
                          </label>
                          {required && entry && (
                            <select
                              value={entry.status}
                              onChange={(event) =>
                                actions.patchLeadDocument(lead.id, def.id, {
                                  status: event.target.value as DocumentStatus,
                                })
                              }
                              aria-label={`${def.name} status`}
                              className="shrink-0 rounded border border-stone-200 bg-paper-raised/60 px-2 py-1 text-[0.7rem] font-medium text-ink-soft"
                            >
                              {DOCUMENT_STATUS_ORDER.map((status) => (
                                <option key={status} value={status}>
                                  {DOCUMENT_STATUS_META[status].label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        {required && entry && (
                          <div className="mt-2 grid gap-2 pl-7 sm:grid-cols-[1fr_5.5rem]">
                            <TextInput
                              type="url"
                              value={entry.url ?? ""}
                              onChange={(value) =>
                                actions.patchLeadDocument(lead.id, def.id, { url: value || undefined })
                              }
                              placeholder="Link to this application's draft"
                            />
                            <TextInput
                              type="number"
                              value={entry.wordLimit ? String(entry.wordLimit) : ""}
                              onChange={(value) =>
                                actions.patchLeadDocument(lead.id, def.id, {
                                  wordLimit: value ? Number(value) : undefined,
                                })
                              }
                              placeholder="words"
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <GhostButton onClick={() => actions.requireAllDocuments(lead.id)}>Require all</GhostButton>
                <span className="text-xs text-ink-soft">
                  {docs.total} of {state.documents.length} required here
                </span>
              </div>
            </>
          )}

          <Divider label="Timeline" />
          <p className="text-xs leading-relaxed text-ink-soft">
            Every email, call and status change in one dated stream. Outreach entries stay flagged until you mark a
            reply, which is what the silence warnings read.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              actions.addTimelineEntry(lead.id, { date: entryDate, kind: entryKind, note: entryNote });
              setEntryNote("");
              setEntryDate("");
            }}
            className="space-y-2 rounded-lg border border-stone-200 bg-paper-raised/40 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-[8.5rem_1fr]">
              <TextInput type="date" value={entryDate} onChange={setEntryDate} />
              <select
                value={entryKind}
                onChange={(event) => setEntryKind(event.target.value as TimelineKind)}
                aria-label="Entry kind"
                className="track-field"
              >
                {TIMELINE_KIND_ORDER.map((kind) => (
                  <option key={kind} value={kind}>
                    {TIMELINE_KIND_META[kind].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <TextInput value={entryNote} onChange={setEntryNote} placeholder="What happened" />
              <GhostButton type="submit">
                <FaPlus size={10} /> Log
              </GhostButton>
            </div>
            <p className="text-[0.7rem] text-ink-soft/70">Leave the date blank to use today.</p>
          </form>
          {(lead.timeline ?? []).length > 0 && (
            <ol className="relative ml-1 space-y-3 border-l border-stone-200 pl-5">
              {(lead.timeline ?? []).map((entry) => {
                const meta = TIMELINE_KIND_META[entry.kind];
                const waited = meta.outreach && !entry.replied ? daysSince(entry.date) : null;
                return (
                  <li key={entry.id} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper ${meta.dot}`}
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft">
                          {meta.label}
                          <span className="ml-2 font-normal normal-case tracking-normal text-ink-soft/70">
                            {formatDate(entry.date)}
                          </span>
                          {entry.auto && (
                            <span className="ml-2 font-normal normal-case tracking-normal text-ink-soft/50">
                              logged automatically
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm leading-snug text-ink">{entry.note}</p>
                        {meta.outreach && (
                          <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-[0.7rem] text-ink-soft">
                            <input
                              type="checkbox"
                              checked={entry.replied === true}
                              onChange={(event) =>
                                actions.patchTimelineEntry(lead.id, entry.id, {
                                  replied: event.target.checked || undefined,
                                })
                              }
                              className="accent-wine"
                            />
                            {entry.replied ? "Replied" : waited !== null && waited >= 1 ? `No reply after ${waited} days` : "No reply yet"}
                          </label>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => actions.removeTimelineEntry(lead.id, entry.id)}
                        aria-label="Remove entry"
                        className="shrink-0 rounded p-1 text-ink-soft/50 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <Divider label="Interviews" />
          {lead.interviews.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nothing scheduled. Add a slot the moment an invitation arrives, then use the Interviews tab to prepare.
            </p>
          ) : (
            <ul className="space-y-2">
              {lead.interviews.map((interview) => (
                <li key={interview.id} className="rounded-lg border border-stone-200 bg-paper p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-3">
                      <Field label="Date">
                        <TextInput
                          type="date"
                          value={interview.date ?? ""}
                          onChange={(value) => actions.patchInterview(lead.id, interview.id, { date: value || undefined })}
                        />
                      </Field>
                      <Field label="Time">
                        <input
                          type="time"
                          value={interview.time ?? ""}
                          onChange={(event) => actions.patchInterview(lead.id, interview.id, { time: event.target.value || undefined })}
                          className="track-field"
                        />
                      </Field>
                      <Field label="Format">
                        <select
                          value={interview.mode}
                          onChange={(event) => actions.patchInterview(lead.id, interview.id, { mode: event.target.value as InterviewMode })}
                          className="track-field"
                        >
                          {Object.entries(INTERVIEW_MODE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => actions.removeInterview(lead.id, interview.id)}
                      aria-label="Remove interview"
                      className="shrink-0 rounded p-1.5 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  {interview.done && <p className="mt-1.5 text-[0.7rem] font-semibold text-track-offer">Marked done</p>}
                </li>
              ))}
            </ul>
          )}
          <GhostButton onClick={() => actions.addInterview(lead.id)}>
            <FaPlus size={10} /> Add interview slot
          </GhostButton>

          <Divider label="Letter writers" />
          {state.recommenders.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No referees added yet. Add them on the Letters tab, then assign them here.
            </p>
          ) : (
            <ul className="space-y-1">
              {state.recommenders.map((person) => {
                const assigned = lead.recommenderIds.includes(person.id);
                return (
                  <li key={person.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1.5 text-sm hover:bg-paper-raised/60">
                      <input
                        type="checkbox"
                        checked={assigned}
                        onChange={() => actions.toggleLeadRecommender(lead.id, person.id)}
                        className="shrink-0 accent-wine"
                      />
                      <span className="text-ink-soft">
                        {person.name}
                        {person.affiliation && <span className="text-ink-soft/60"> · {person.affiliation}</span>}
                        {person.agreed === true && <span className="ml-1.5 text-[0.7rem] font-semibold text-track-offer">agreed</span>}
                        {person.agreed === false && <span className="ml-1.5 text-[0.7rem] font-semibold text-track-rejected">declined</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <Field label="Letters this programme requires" htmlFor="lead-lorcount">
            <TextInput
              id="lead-lorcount"
              type="number"
              value={lead.lorCount ? String(lead.lorCount) : ""}
              onChange={(value) => patch({ lorCount: value ? Number(value) : undefined })}
              placeholder="3"
              className="max-w-24"
            />
          </Field>

          <Divider label="Advisor outreach" />
          {lead.advisors.length > 0 && (
            <ul className="space-y-2.5">
              {lead.advisors.map((advisor) => (
                <AdvisorRow
                  key={advisor.id}
                  lead={lead}
                  advisorId={advisor.id}
                  actions={actions}
                  followUpDays={state.settings.followUpDays}
                />
              ))}
            </ul>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              actions.addAdvisor(lead.id, newAdvisor);
              setNewAdvisor("");
            }}
            className="flex gap-2"
          >
            <TextInput value={newAdvisor} onChange={setNewAdvisor} placeholder="Add a professor to contact" />
            <GhostButton type="submit">
              <FaPlus size={10} /> Add
            </GhostButton>
          </form>

          <Divider label="Logistics" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Programme page" htmlFor="lead-url">
              <TextInput id="lead-url" type="url" value={lead.programUrl ?? ""} onChange={(value) => patch({ programUrl: value || undefined })} placeholder="https://" />
            </Field>
            <Field label="Application portal" htmlFor="lead-portal">
              <TextInput id="lead-portal" type="url" value={lead.portalUrl ?? ""} onChange={(value) => patch({ portalUrl: value || undefined })} placeholder="https://" />
            </Field>
            <Field label="Funding" htmlFor="lead-funding">
              <TextInput id="lead-funding" value={lead.funding ?? ""} onChange={(value) => patch({ funding: value || undefined })} placeholder="e.g. fully funded, 5 years" />
            </Field>
            <Field label="Drafts folder" htmlFor="lead-folder">
              <TextInput id="lead-folder" type="url" value={lead.folderUrl ?? ""} onChange={(value) => patch({ folderUrl: value || undefined })} placeholder="Where this application's files live" />
            </Field>
            <Field label="Funding note" htmlFor="lead-fundingnote">
              <TextInput id="lead-fundingnote" value={lead.fundingNote ?? ""} onChange={(value) => patch({ fundingNote: value || undefined })} placeholder="What the posting actually said" />
            </Field>
            <Field label="Application fee (USD)" htmlFor="lead-fee">
              <div className="flex items-center gap-3">
                <TextInput
                  id="lead-fee"
                  type="number"
                  value={lead.feeUsd ? String(lead.feeUsd) : ""}
                  onChange={(value) => patch({ feeUsd: value ? Number(value) : undefined })}
                  placeholder="0"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={lead.feeWaiver === true}
                    onChange={(event) => patch({ feeWaiver: event.target.checked || undefined })}
                    className="accent-wine"
                  />
                  waived
                </label>
              </div>
            </Field>
            <Field label="Submitted on" htmlFor="lead-submitted">
              <TextInput id="lead-submitted" type="date" value={lead.submittedOn ?? ""} onChange={(value) => patch({ submittedOn: value || undefined })} />
            </Field>
            <Field label="Decision on" htmlFor="lead-decision">
              <TextInput id="lead-decision" type="date" value={lead.decisionOn ?? ""} onChange={(value) => patch({ decisionOn: value || undefined })} />
            </Field>
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink/25 px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <Divider label="Fit" />
          <p className="text-xs leading-relaxed text-ink-soft">
            Two prompts instead of one notes box. Answering these before drafting is most of the work of a good
            statement, and leaving one blank is a more honest signal than a full generic note.
          </p>
          <Field label="Why this lab" htmlFor="lead-why">
            <textarea
              id="lead-why"
              value={lead.whyThisLab ?? ""}
              onChange={(event) => patch({ whyThisLab: event.target.value || undefined })}
              rows={3}
              placeholder="Which of their papers, and what specifically you would build on"
              className="track-field resize-y leading-relaxed"
            />
          </Field>
          <Field label="Statement angle" htmlFor="lead-angle">
            <textarea
              id="lead-angle"
              value={lead.sopAngle ?? ""}
              onChange={(event) => patch({ sopAngle: event.target.value || undefined })}
              rows={3}
              placeholder="The one-line thesis this application's statement argues"
              className="track-field resize-y leading-relaxed"
            />
          </Field>

          <Divider label="Notes" />
          <textarea
            value={lead.notes ?? ""}
            onChange={(event) => patch({ notes: event.target.value || undefined })}
            rows={5}
            placeholder="Why this group, who to name in the statement, anything a future you would want to remember."
            className="track-field resize-y leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
            <GhostButton
              onClick={() => {
                const id = actions.duplicateLead(lead.id);
                if (id) onOpenLead(id);
              }}
            >
              <FaCopy size={10} /> Duplicate
            </GhostButton>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">Delete for good?</span>
                <GhostButton
                  danger
                  onClick={() => {
                    actions.removeLead(lead.id);
                    onClose();
                  }}
                >
                  Yes, delete
                </GhostButton>
                <GhostButton onClick={() => setConfirmDelete(false)}>Keep</GhostButton>
              </div>
            ) : (
              <GhostButton danger onClick={() => setConfirmDelete(true)}>
                <FaTrash size={10} /> Delete
              </GhostButton>
            )}
          </div>

          <p className="pb-2 text-[0.7rem] text-ink-soft/70">
            Added {formatDate(lead.createdAt.slice(0, 10))}, last changed {formatDate(lead.updatedAt.slice(0, 10))}.
          </p>
        </div>
      </div>
    </div>
  );
}
