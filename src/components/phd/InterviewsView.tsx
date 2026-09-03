"use client";

import { FaCircleCheck, FaClock, FaTrash } from "react-icons/fa6";
import { formatCountdown, formatDate } from "@/lib/phd/dates";
import { allInterviews } from "@/lib/phd/derive";
import { INTERVIEW_MODE_LABELS, INTERVIEW_PREP_PROMPTS, INTERVIEW_QUESTIONS_TO_ASK } from "@/lib/phd/presets";
import type { InterviewMode, TrackerState } from "@/lib/phd/types";
import type { TrackerActions } from "@/lib/phd/useTracker";
import { EmptyNote, Field, GhostButton, SectionLabel, TextInput } from "./ui";

export default function InterviewsView({
  state,
  actions,
  onOpenLead,
}: {
  state: TrackerState;
  actions: TrackerActions;
  onOpenLead: (id: string) => void;
}) {
  const entries = allInterviews(state.leads);
  const pending = entries.filter((entry) => !entry.interview.done);
  const past = entries.filter((entry) => entry.interview.done);
  const invited = state.leads.filter((lead) => lead.status === "interview");

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-stone-200 bg-paper-raised/40 px-5 py-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Interviews get scheduled with little notice, so they live here rather than buried in a lead. Add one from
          any application&apos;s detail panel, or from the buttons below once a programme is marked as
          interviewing.
        </p>
      </div>

      {invited.length > 0 && (
        <section>
          <SectionLabel>Programmes at interview stage</SectionLabel>
          <ul className="flex flex-wrap gap-2">
            {invited.map((lead) => (
              <li key={lead.id} className="flex items-center gap-2 rounded-full border border-stone-200 bg-paper px-3 py-1.5">
                <button type="button" onClick={() => onOpenLead(lead.id)} className="text-sm text-ink hover:text-wine">
                  {lead.university}
                </button>
                <GhostButton onClick={() => actions.addInterview(lead.id)}>+ slot</GhostButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionLabel action={<span className="text-xs text-ink-soft">{pending.length} scheduled</span>}>
          Upcoming
        </SectionLabel>
        {pending.length === 0 ? (
          <EmptyNote>No interviews scheduled. They will appear here as soon as you add one.</EmptyNote>
        ) : (
          <ul className="space-y-3">
            {pending.map(({ lead, interview, days }) => {
              const soon = days !== null && days >= 0 && days <= 3;
              return (
                <li
                  key={interview.id}
                  className={`rounded-lg border p-4 ${soon ? "border-track-rejected/40 bg-track-rejected/5" : "border-stone-200 bg-paper"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button type="button" onClick={() => onOpenLead(lead.id)} className="text-left">
                        <p className="font-heading text-base font-medium text-ink hover:text-wine">{lead.university}</p>
                      </button>
                      <p className="text-xs text-ink-soft">{lead.program || "Programme not set"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${soon ? "border-track-rejected/30 text-track-rejected" : "border-stone-200 text-ink-soft"}`}>
                        <FaClock size={10} /> {days === null ? "No date set" : formatCountdown(days)}
                      </span>
                      <GhostButton onClick={() => actions.patchInterview(lead.id, interview.id, { done: true })}>
                        <FaCircleCheck size={10} /> Mark done
                      </GhostButton>
                      <button
                        type="button"
                        onClick={() => actions.removeInterview(lead.id, interview.id)}
                        aria-label="Remove interview"
                        className="rounded p-1.5 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
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
                    <Field label="Timezone">
                      <TextInput
                        value={interview.timezone ?? ""}
                        onChange={(value) => actions.patchInterview(lead.id, interview.id, { timezone: value || undefined })}
                        placeholder="e.g. EST, or IST"
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

                  <div className="mt-3 grid gap-3">
                    <Field label="Who you are meeting">
                      <TextInput
                        value={interview.withWhom ?? ""}
                        onChange={(value) => actions.patchInterview(lead.id, interview.id, { withWhom: value || undefined })}
                        placeholder="Names and roles, so you can read their work first"
                      />
                    </Field>
                    <Field label="Prep notes">
                      <textarea
                        value={interview.prepNotes ?? ""}
                        onChange={(event) => actions.patchInterview(lead.id, interview.id, { prepNotes: event.target.value || undefined })}
                        rows={3}
                        placeholder="Their recent papers, how your work connects, the results you want to be able to quote"
                        className="track-field resize-y leading-relaxed"
                      />
                    </Field>
                    <Field label="Questions to ask them">
                      <textarea
                        value={interview.questionsToAsk ?? ""}
                        onChange={(event) => actions.patchInterview(lead.id, interview.id, { questionsToAsk: event.target.value || undefined })}
                        rows={3}
                        placeholder="An interview that only runs one way tells you nothing about the group"
                        className="track-field resize-y leading-relaxed"
                      />
                    </Field>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <SectionLabel>Done</SectionLabel>
          <ul className="space-y-2">
            {past.map(({ lead, interview }) => (
              <li key={interview.id} className="rounded-lg border border-stone-200 bg-paper-raised/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <button type="button" onClick={() => onOpenLead(lead.id)} className="text-sm font-medium text-ink hover:text-wine">
                      {lead.university}
                    </button>
                    <p className="text-xs text-ink-soft">
                      {formatDate(interview.date)} · {INTERVIEW_MODE_LABELS[interview.mode]}
                      {interview.withWhom && ` · ${interview.withWhom}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GhostButton onClick={() => actions.patchInterview(lead.id, interview.id, { done: false })}>
                      Reopen
                    </GhostButton>
                    <button
                      type="button"
                      onClick={() => actions.removeInterview(lead.id, interview.id)}
                      aria-label="Remove interview"
                      className="rounded p-1.5 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Field label="How it went">
                    <textarea
                      value={interview.outcome ?? ""}
                      onChange={(event) => actions.patchInterview(lead.id, interview.id, { outcome: event.target.value || undefined })}
                      rows={2}
                      placeholder="What they asked, what you would answer differently, what they said about next steps"
                      className="track-field resize-y leading-relaxed"
                    />
                  </Field>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-paper-raised/40 p-5">
          <h3 className="font-heading text-base font-medium text-ink">Have these ready</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {INTERVIEW_PREP_PROMPTS.map((prompt) => (
              <li key={prompt} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {prompt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-stone-200 bg-paper-raised/40 p-5">
          <h3 className="font-heading text-base font-medium text-ink">Worth asking back</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {INTERVIEW_QUESTIONS_TO_ASK.map((question) => (
              <li key={question} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-wine" aria-hidden="true" />
                {question}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
