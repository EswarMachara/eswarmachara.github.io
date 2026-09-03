"use client";

import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa6";
import { daysUntil, formatDate } from "@/lib/phd/dates";
import { documentCoverage, documentProgress, isActive, testStatus } from "@/lib/phd/derive";
import { DEFAULT_DOCUMENTS, DOCUMENT_STATUS_META } from "@/lib/phd/presets";
import type { TrackerState } from "@/lib/phd/types";
import type { TrackerActions } from "@/lib/phd/useTracker";
import { EmptyNote, Field, GhostButton, SectionLabel, TextInput } from "./ui";

const STATUS_COPY = {
  valid: { label: "Valid", className: "text-track-offer" },
  expiring: { label: "Expiring soon", className: "text-gold-deep" },
  expired: { label: "Expired", className: "text-track-rejected" },
  unknown: { label: "No expiry set", className: "text-ink-soft" },
} as const;

export default function MaterialsView({
  state,
  actions,
}: {
  state: TrackerState;
  actions: TrackerActions;
}) {
  const [testName, setTestName] = useState("");
  const [docName, setDocName] = useState("");

  // Only open applications, since a closed-out one's documents no longer matter.
  const docRows = state.leads
    .filter((lead) => isActive(lead.status) && Object.keys(lead.docs ?? {}).length > 0)
    .map((lead) => ({ lead, progress: documentProgress(lead) }));
  const registry = [...state.documents].sort((a, b) => a.order - b.order);
  // Only show a column once some open application actually requires it.
  const usedDefs = registry.filter((def) =>
    docRows.some(({ lead }) => Object.prototype.hasOwnProperty.call(lead.docs ?? {}, def.id)),
  );
  const coverage = documentCoverage(state.leads, registry);

  return (
    <div className="space-y-12">
      <section>
        <SectionLabel>Test scores</SectionLabel>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Scores expire, and an expiry that falls before a deadline is a quiet way to lose an application. Add the
          validity date and the tracker will warn you when one is running out.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!testName.trim()) return;
            actions.addTest(testName);
            setTestName("");
          }}
          className="mb-4 flex flex-wrap gap-2"
        >
          <div className="min-w-48 flex-1">
            <TextInput value={testName} onChange={setTestName} placeholder="e.g. TOEFL iBT, IELTS, GRE General" />
          </div>
          <GhostButton type="submit">
            <FaPlus size={10} /> Add
          </GhostButton>
          {["TOEFL iBT", "IELTS Academic", "Duolingo English Test", "GRE General"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => actions.addTest(suggestion)}
              className="rounded-full border border-stone-200 px-2.5 py-1 text-[0.7rem] text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              + {suggestion}
            </button>
          ))}
        </form>

        {state.tests.length === 0 ? (
          <EmptyNote>No test records yet.</EmptyNote>
        ) : (
          <ul className="space-y-3">
            {state.tests.map((test) => {
              const status = testStatus(test);
              const copy = STATUS_COPY[status];
              const remaining = daysUntil(test.validUntil);
              return (
                <li key={test.id} className="rounded-lg border border-stone-200 bg-paper p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 grid gap-3 sm:grid-cols-4">
                      <Field label="Test">
                        <TextInput value={test.name} onChange={(value) => actions.patchTest(test.id, { name: value })} />
                      </Field>
                      <Field label="Taken on">
                        <TextInput type="date" value={test.takenOn ?? ""} onChange={(value) => actions.patchTest(test.id, { takenOn: value || undefined })} />
                      </Field>
                      <Field label="Score">
                        <TextInput value={test.score ?? ""} onChange={(value) => actions.patchTest(test.id, { score: value || undefined })} placeholder="e.g. 108 / 120" />
                      </Field>
                      <Field label="Valid until">
                        <TextInput type="date" value={test.validUntil ?? ""} onChange={(value) => actions.patchTest(test.id, { validUntil: value || undefined })} />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => actions.removeTest(test.id)}
                      aria-label={`Remove ${test.name}`}
                      className="shrink-0 rounded p-2 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  <p className={`mt-2.5 text-xs font-medium ${copy.className}`}>
                    {copy.label}
                    {test.validUntil && status !== "unknown" && (
                      <span className="font-normal text-ink-soft">
                        {" "}
                        · {formatDate(test.validUntil)}
                        {remaining !== null && remaining >= 0 && ` (${remaining} days left)`}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionLabel>Documents across applications</SectionLabel>
        {docRows.length === 0 ? (
          <EmptyNote>
            No documents added to any application yet. Add them from a lead&apos;s detail panel and this grid fills
            in, showing at a glance which statement is still unwritten.
          </EmptyNote>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-paper-raised">
                  <tr>
                    <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Application</th>
                    {usedDefs.map((def) => (
                      <th key={def.id} scope="col" className="border-b border-stone-200 px-3 py-2.5 text-center text-xs font-semibold text-ink">
                        {def.name}
                      </th>
                    ))}
                    <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {docRows.map(({ lead, progress }) => (
                    <tr key={lead.id} className="odd:bg-paper even:bg-paper-raised/40">
                      <td className="border-b border-stone-100 px-4 py-2.5">
                        <p className="font-medium text-ink">{lead.university}</p>
                        <p className="text-xs text-ink-soft">{lead.program}</p>
                      </td>
                      {usedDefs.map((def) => {
                        const doc = lead.docs?.[def.id];
                        return (
                          <td key={def.id} className="border-b border-stone-100 px-3 py-2.5 text-center">
                            {doc ? (
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${DOCUMENT_STATUS_META[doc.status].chip}`}>
                                {DOCUMENT_STATUS_META[doc.status].label}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-soft/40">not required</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-stone-100 px-4 py-2.5 text-right tabular-nums text-ink-soft">
                        {progress.final}/{progress.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink-soft">Open applications only. Columns appear once a document of that type exists somewhere.</p>
          </>
        )}
      </section>

      <section>
        <SectionLabel
          action={
            state.documents.length === 0 ? (
              <GhostButton onClick={() => actions.seedDocumentRegistry()}>Load a starter set</GhostButton>
            ) : (
              <span className="text-xs text-ink-soft">{state.documents.length} defined</span>
            )
          }
        >
          Your documents
        </SectionLabel>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Name each document once here. Every application then ticks off the same named list, which is what makes
          the grid above possible and stops the same checklist being retyped per programme.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            actions.addDocumentDef(docName);
            setDocName("");
          }}
          className="mb-4 flex gap-2"
        >
          <TextInput value={docName} onChange={setDocName} placeholder="Add a document, e.g. Research statement" />
          <GhostButton type="submit">
            <FaPlus size={10} /> Add
          </GhostButton>
        </form>

        {state.documents.length === 0 ? (
          <EmptyNote>
            No documents defined yet. Load the starter set above, or add your own. The defaults are{" "}
            {DEFAULT_DOCUMENTS.slice(0, 3).join(", ")} and {DEFAULT_DOCUMENTS.length - 3} more.
          </EmptyNote>
        ) : (
          <ul className="space-y-2">
            {coverage.map(({ def, required, done, percent }, index) => (
              <li key={def.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-paper p-3">
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => actions.moveDocumentDef(def.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${def.name} up`}
                    className="rounded p-0.5 text-ink-soft/50 transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <FaArrowUp size={9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.moveDocumentDef(def.id, 1)}
                    disabled={index === coverage.length - 1}
                    aria-label={`Move ${def.name} down`}
                    className="rounded p-0.5 text-ink-soft/50 transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <FaArrowDown size={9} />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={def.name}
                    onChange={(event) => actions.renameDocumentDef(def.id, event.target.value)}
                    aria-label="Document name"
                    className="w-full border-none bg-transparent p-0 text-sm font-medium text-ink focus:outline-none"
                  />
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {required === 0
                      ? "Not required by any open application yet"
                      : `Required by ${required} open application${required === 1 ? "" : "s"}, ${done} final`}
                  </p>
                </div>
                {required > 0 && (
                  <div className="hidden w-28 shrink-0 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={`h-full rounded-full ${percent >= 100 ? "bg-track-offer" : "bg-gold"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-[0.7rem] tabular-nums text-ink-soft">{percent}%</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => actions.removeDocumentDef(def.id)}
                  aria-label={`Remove ${def.name}`}
                  className="shrink-0 rounded p-2 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                >
                  <FaTrash size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-ink-soft">
          Removing a document here also unrequires it from every application. Nothing else is deleted.
        </p>
      </section>

      <section>
        <SectionLabel>Timing rules</SectionLabel>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          These numbers drive the milestone dates and the warnings on the dashboard. Change them and every
          application recalculates.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Target intake" htmlFor="set-intake" hint="Used as the default on new leads.">
            <TextInput
              id="set-intake"
              value={state.settings.targetIntake}
              onChange={(value) => actions.patchSettings({ targetIntake: value })}
            />
          </Field>
          <Field label="Referee notice (days)" htmlFor="set-lor" hint="Ask for letters at least this far ahead.">
            <TextInput
              id="set-lor"
              type="number"
              value={String(state.settings.lorLeadDays)}
              onChange={(value) => actions.patchSettings({ lorLeadDays: Math.max(0, Number(value) || 0) })}
            />
          </Field>
          <Field label="Draft lead time (days)" htmlFor="set-draft" hint="A first statement draft should exist by then.">
            <TextInput
              id="set-draft"
              type="number"
              value={String(state.settings.draftLeadDays)}
              onChange={(value) => actions.patchSettings({ draftLeadDays: Math.max(0, Number(value) || 0) })}
            />
          </Field>
          <Field label="Follow-up after (days)" htmlFor="set-followup" hint="Silence after a cold email before a nudge.">
            <TextInput
              id="set-followup"
              type="number"
              value={String(state.settings.followUpDays)}
              onChange={(value) => actions.patchSettings({ followUpDays: Math.max(1, Number(value) || 1) })}
            />
          </Field>
          <Field label="Backup reminder (days)" htmlFor="set-backup" hint="Days between export nudges. Set 0 to switch it off.">
            <TextInput
              id="set-backup"
              type="number"
              value={String(state.settings.backupReminderDays)}
              onChange={(value) => actions.patchSettings({ backupReminderDays: Math.max(0, Number(value) || 0) })}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
