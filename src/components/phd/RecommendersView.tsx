"use client";

import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { daysSince, formatDate } from "@/lib/phd/dates";
import { recommenderLoad } from "@/lib/phd/derive";
import type { TrackerState } from "@/lib/phd/types";
import type { TrackerActions } from "@/lib/phd/useTracker";
import { EmptyNote, Field, GhostButton, SectionLabel, TextInput } from "./ui";

export default function RecommendersView({
  state,
  actions,
  onOpenLead,
}: {
  state: TrackerState;
  actions: TrackerActions;
  onOpenLead: (id: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-stone-200 bg-paper-raised/40 px-5 py-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Letters are the part of an application you do not control, so they are worth tracking separately. Keep an
          eye on how many programmes each referee has agreed to cover and when the earliest of those closes.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          actions.addRecommender(name);
          setName("");
        }}
        className="flex gap-2"
      >
        <TextInput value={name} onChange={setName} placeholder="Add a referee, e.g. Prof. Yalavarthy" />
        <GhostButton type="submit">
          <FaPlus size={10} /> Add
        </GhostButton>
      </form>

      {state.recommenders.length === 0 ? (
        <EmptyNote>
          No referees yet. Add the people you plan to ask, then assign them to programmes from each lead&apos;s
          detail panel.
        </EmptyNote>
      ) : (
        <ul className="space-y-4">
          {state.recommenders.map((person) => {
            const load = recommenderLoad(person, state.leads);
            const waited = person.askedOn && person.agreed === undefined ? daysSince(person.askedOn) : null;
            return (
              <li key={person.id} className="rounded-lg border border-stone-200 bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name">
                        <TextInput value={person.name} onChange={(value) => actions.patchRecommender(person.id, { name: value })} />
                      </Field>
                      <Field label="Role">
                        <TextInput
                          value={person.role ?? ""}
                          onChange={(value) => actions.patchRecommender(person.id, { role: value || undefined })}
                          placeholder="e.g. Research advisor, IISc"
                        />
                      </Field>
                      <Field label="Affiliation">
                        <TextInput
                          value={person.affiliation ?? ""}
                          onChange={(value) => actions.patchRecommender(person.id, { affiliation: value || undefined })}
                        />
                      </Field>
                      <Field label="Email">
                        <TextInput
                          type="email"
                          value={person.email ?? ""}
                          onChange={(value) => actions.patchRecommender(person.id, { email: value || undefined })}
                        />
                      </Field>
                      <Field label="Asked on">
                        <TextInput
                          type="date"
                          value={person.askedOn ?? ""}
                          onChange={(value) => actions.patchRecommender(person.id, { askedOn: value || undefined })}
                        />
                      </Field>
                      <Field label="Confirmed">
                        <select
                          value={person.agreed === undefined ? "pending" : person.agreed ? "yes" : "no"}
                          onChange={(event) =>
                            actions.patchRecommender(person.id, {
                              agreed: event.target.value === "pending" ? undefined : event.target.value === "yes",
                            })
                          }
                          className="track-field"
                        >
                          <option value="pending">Not answered yet</option>
                          <option value="yes">Agreed</option>
                          <option value="no">Declined</option>
                        </select>
                      </Field>
                    </div>

                    <TextInput
                      value={person.notes ?? ""}
                      onChange={(value) => actions.patchRecommender(person.id, { notes: value || undefined })}
                      placeholder="What you sent them, deadlines shared, reminders due"
                    />

                    {waited !== null && waited >= 10 && (
                      <p className="text-xs font-medium text-gold-deep">
                        Asked {waited} days ago with no answer recorded. Worth a gentle check-in.
                      </p>
                    )}

                    <div className="border-t border-stone-100 pt-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft">
                        Writing for {load.assigned.length} programme{load.assigned.length === 1 ? "" : "s"}
                        {load.nextDays !== null && (
                          <span className={load.nextDays <= 21 ? " text-track-rejected" : ""}>
                            {" "}
                            · next in {load.nextDays} days
                          </span>
                        )}
                      </p>
                      {load.assigned.length === 0 ? (
                        <p className="mt-1.5 text-xs text-ink-soft/70">Not assigned to anything yet.</p>
                      ) : (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {load.assigned.map((lead) => (
                            <li key={lead.id}>
                              <button
                                type="button"
                                onClick={() => onOpenLead(lead.id)}
                                className="rounded-full border border-stone-200 bg-paper-raised/60 px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
                              >
                                {lead.university}
                                {lead.deadline && <span className="text-ink-soft/60"> · {formatDate(lead.deadline)}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => actions.removeRecommender(person.id)}
                    aria-label={`Remove ${person.name}`}
                    className="shrink-0 rounded p-2 text-ink-soft/60 transition-colors hover:bg-track-rejected/10 hover:text-track-rejected"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {state.recommenders.length > 0 && (
        <section>
          <SectionLabel>Load per referee</SectionLabel>
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-paper-raised">
                <tr>
                  <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Referee</th>
                  <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Confirmed</th>
                  <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Assigned</th>
                  <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Still open</th>
                  <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Next due</th>
                </tr>
              </thead>
              <tbody>
                {state.recommenders.map((person) => {
                  const load = recommenderLoad(person, state.leads);
                  return (
                    <tr key={person.id} className="odd:bg-paper even:bg-paper-raised/40">
                      <td className="border-b border-stone-100 px-4 py-2.5 font-medium text-ink">{person.name}</td>
                      <td className="border-b border-stone-100 px-4 py-2.5 text-ink-soft">
                        {person.agreed === true ? "Yes" : person.agreed === false ? "Declined" : "Pending"}
                      </td>
                      <td className="border-b border-stone-100 px-4 py-2.5 text-right tabular-nums text-ink-soft">{load.assigned.length}</td>
                      <td className="border-b border-stone-100 px-4 py-2.5 text-right tabular-nums text-ink-soft">{load.pending.length}</td>
                      <td className={`border-b border-stone-100 px-4 py-2.5 text-right tabular-nums ${load.nextDays !== null && load.nextDays <= 21 ? "font-semibold text-track-rejected" : "text-ink-soft"}`}>
                        {load.nextDays === null ? "not set" : `${load.nextDays}d`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
