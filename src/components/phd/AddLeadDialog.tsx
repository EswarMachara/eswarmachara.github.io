"use client";

import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { CHECKLIST_PRESETS, DEADLINE_KIND_LABELS, DEGREE_LABELS, PRIORITY_META, PRIORITY_ORDER } from "@/lib/phd/presets";
import type { DeadlineKind, DegreeKind, Priority } from "@/lib/phd/types";
import type { NewLeadInput } from "@/lib/phd/useTracker";
import { Field, GhostButton, SolidButton, TextInput } from "./ui";
import { useOverlay } from "./useOverlay";

/**
 * Deliberately short. Only the university name is required, because a lead is
 * usually created the moment it is spotted, long before the details are known.
 */
export default function AddLeadDialog({
  defaultIntake,
  onCancel,
  onCreate,
}: {
  defaultIntake: string;
  onCancel: () => void;
  onCreate: (input: NewLeadInput) => void;
}) {
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [country, setCountry] = useState("");
  const [degree, setDegree] = useState<DegreeKind>("phd");
  const [priority, setPriority] = useState<Priority>("solid");
  const [deadline, setDeadline] = useState("");
  const [deadlineKind, setDeadlineKind] = useState<DeadlineKind>("hard");
  const [intake, setIntake] = useState(defaultIntake);
  const [presetId, setPresetId] = useState("us-phd");
  const [programUrl, setProgramUrl] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  // Focus trap, focus restore and Escape all come from the shared hook.
  const panelRef = useOverlay<HTMLFormElement>(onCancel, false);

  const preset = CHECKLIST_PRESETS.find((entry) => entry.id === presetId);
  const canSubmit = university.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div aria-hidden="true" onClick={onCancel} className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <form
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add a programme"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          onCreate({
            university,
            program,
            country: country || undefined,
            degree,
            priority,
            deadline: deadline || undefined,
            deadlineKind,
            intake: intake || undefined,
            presetId,
            programUrl: programUrl || undefined,
          });
        }}
        className="relative my-8 w-full max-w-lg rounded-xl border border-stone-200 bg-paper p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">Add a programme</h2>
            <p className="mt-1 text-xs text-ink-soft">Only the university is required. Fill in the rest as you find it.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-ink-soft transition-colors hover:bg-stone-100 hover:text-ink"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <Field label="University" htmlFor="new-university">
            <input
              ref={firstFieldRef}
              id="new-university"
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              placeholder="e.g. Johns Hopkins University"
              className="track-field"
              required
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Programme or department" htmlFor="new-program">
              <TextInput id="new-program" value={program} onChange={setProgram} placeholder="e.g. Biomedical Engineering" />
            </Field>
            <Field label="Country" htmlFor="new-country">
              <TextInput id="new-country" value={country} onChange={setCountry} placeholder="e.g. United States" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Degree" htmlFor="new-degree">
              <select id="new-degree" value={degree} onChange={(event) => setDegree(event.target.value as DegreeKind)} className="track-field">
                {Object.entries(DEGREE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority" htmlFor="new-priority">
              <select id="new-priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="track-field">
                {PRIORITY_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_META[value].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Deadline" htmlFor="new-deadline">
              <TextInput id="new-deadline" type="date" value={deadline} onChange={setDeadline} />
            </Field>
            <Field label="Kind" htmlFor="new-kind">
              <select id="new-kind" value={deadlineKind} onChange={(event) => setDeadlineKind(event.target.value as DeadlineKind)} className="track-field">
                {Object.entries(DEADLINE_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Intake" htmlFor="new-intake">
              <TextInput id="new-intake" value={intake} onChange={setIntake} />
            </Field>
          </div>

          <Field label="Programme page" htmlFor="new-url">
            <TextInput id="new-url" type="url" value={programUrl} onChange={setProgramUrl} placeholder="https://" />
          </Field>

          <Field label="Requirement checklist" htmlFor="new-preset" hint={preset?.hint}>
            <select id="new-preset" value={presetId} onChange={(event) => setPresetId(event.target.value)} className="track-field">
              {CHECKLIST_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.items.length > 0 ? ` (${entry.items.length} items)` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <SolidButton type="submit" className={canSubmit ? "" : "pointer-events-none opacity-40"}>
            Add to bench
          </SolidButton>
        </div>
      </form>
    </div>
  );
}
