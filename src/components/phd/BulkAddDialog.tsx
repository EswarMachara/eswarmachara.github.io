"use client";

import { useEffect, useMemo, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { parseBulk } from "@/lib/phd/parseBulk";
import { CHECKLIST_PRESETS } from "@/lib/phd/presets";
import type { BulkLeadRow } from "@/lib/phd/store";
import { Field, GhostButton, SolidButton } from "./ui";

const EXAMPLE = `Johns Hopkins University; Biomedical Engineering; United States; 2026-12-15
ETH Zurich; Biomedical Imaging; Switzerland
Max Planck Institute for Intelligent Systems; ELLIS; Germany`;

/**
 * Bulk entry from a pasted list. This exists instead of shipped seed data:
 * inventing deadline dates for real universities would put unverified
 * information into a tool used for real decisions.
 */
export default function BulkAddDialog({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (rows: BulkLeadRow[], presetId: string) => void;
}) {
  const [text, setText] = useState("");
  const [presetId, setPresetId] = useState("us-phd");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const parsed = useMemo(() => parseBulk(text), [text]);

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button type="button" aria-label="Cancel" onClick={onCancel} className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add several programmes"
        className="relative my-8 w-full max-w-2xl rounded-xl border border-stone-200 bg-paper p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">Paste a shortlist</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              One programme per line. Columns are university, programme, country, deadline, separated by a
              semicolon, tab, pipe or comma. Only the university is required.
            </p>
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

        <div className="mt-5 space-y-4">
          <Field label="Your list" htmlFor="bulk-text">
            <textarea
              id="bulk-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={9}
              placeholder={EXAMPLE}
              className="track-field resize-y font-mono text-xs leading-relaxed"
            />
          </Field>

          <Field label="Requirement checklist for all of them" htmlFor="bulk-preset" hint="You can change it per lead afterwards.">
            <select id="bulk-preset" value={presetId} onChange={(event) => setPresetId(event.target.value)} className="track-field">
              {CHECKLIST_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.items.length > 0 ? ` (${entry.items.length} items)` : ""}
                </option>
              ))}
            </select>
          </Field>

          {text.trim() !== "" && (
            <div className="rounded-lg border border-stone-200 bg-paper-raised/40 p-4">
              <p className="text-sm font-medium text-ink">
                {parsed.rows.length} programme{parsed.rows.length === 1 ? "" : "s"} ready to add
              </p>
              {parsed.rows.length > 0 && (
                <ul className="mt-2.5 max-h-40 space-y-1 overflow-y-auto text-xs text-ink-soft">
                  {parsed.rows.map((row, index) => (
                    <li key={index}>
                      <span className="font-medium text-ink">{row.university}</span>
                      {row.program && ` · ${row.program}`}
                      {row.country && ` · ${row.country}`}
                      {row.deadline && ` · due ${row.deadline}`}
                    </li>
                  ))}
                </ul>
              )}
              {parsed.skipped.length > 0 && (
                <div className="mt-3 border-t border-stone-200 pt-3">
                  <p className="text-xs font-semibold text-gold-deep">{parsed.skipped.length} thing(s) needed attention</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-ink-soft">
                    {parsed.skipped.map((entry, index) => (
                      <li key={index}>
                        Line {entry.line}: {entry.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <SolidButton
            onClick={() => parsed.rows.length > 0 && onCreate(parsed.rows, presetId)}
            className={parsed.rows.length > 0 ? "" : "pointer-events-none opacity-40"}
          >
            Add {parsed.rows.length > 0 ? parsed.rows.length : ""} to bench
          </SolidButton>
        </div>
      </div>
    </div>
  );
}
