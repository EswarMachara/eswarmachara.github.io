"use client";

import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { formatCountdown } from "@/lib/phd/dates";
import { URGENCY_CLASSES, urgencyOf } from "@/lib/phd/derive";
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from "@/lib/phd/presets";
import type { Lead, LeadStatus, Priority } from "@/lib/phd/types";

export function StatusChip({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[0.66rem] font-semibold uppercase tracking-wider ${meta.chip}`}>
      {meta.label}
    </span>
  );
}

export function PriorityDot({ priority, withLabel = false }: { priority: Priority; withLabel?: boolean }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
      {withLabel ? meta.label : <span className="sr-only">{meta.label}</span>}
    </span>
  );
}

/** Countdown pill. Colour comes from days remaining, not from status. */
export function CountdownChip({ days, kind }: { days: number | null; kind: Lead["deadlineKind"] }) {
  if (kind === "rolling") {
    return (
      <span className="inline-block rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
        Rolling
      </span>
    );
  }
  const urgency = urgencyOf(days, kind);
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${URGENCY_CLASSES[urgency]}`}>
      {formatCountdown(days)}
    </span>
  );
}

export function ReadinessBar({ percent, done, total }: { percent: number; done: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-stone-200" role="presentation">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${percent >= 100 ? "bg-track-offer" : "bg-gold"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 text-[0.7rem] tabular-nums text-ink-soft">
        {total === 0 ? "no list" : `${done}/${total}`}
      </span>
    </div>
  );
}

export function StatusSelect({
  value,
  onChange,
  id,
  className = "",
}: {
  value: LeadStatus;
  onChange: (next: LeadStatus) => void;
  id?: string;
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as LeadStatus)}
      className={`track-field ${className}`}
      aria-label="Application status"
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_META[status].label}
        </option>
      ))}
    </select>
  );
}

/**
 * A labelled form row.
 *
 * The label is associated automatically: when the caller does not pass
 * `htmlFor` and the child is a single element without its own id, a generated
 * id is cloned onto the child and the label points at it. Most call sites
 * omitted `htmlFor`, which left the label as a decorative sibling and the input
 * with no accessible name.
 *
 * A `hint` is wired through `aria-describedby` so it is read as part of the
 * field rather than being invisible to assistive technology.
 */
export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  const generatedId = useId();
  const hintId = `${generatedId}-hint`;

  const only = Children.count(children) === 1 ? Children.only(children) : null;
  const single = only !== null && isValidElement(only) ? (only as ReactElement<Record<string, unknown>>) : null;
  const childId = single && typeof single.props.id === "string" ? single.props.id : undefined;
  const targetId = htmlFor ?? childId ?? (single ? generatedId : undefined);

  const described = [single && typeof single.props["aria-describedby"] === "string" ? single.props["aria-describedby"] : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  const child =
    single && targetId
      ? cloneElement(single, {
          id: targetId,
          ...(described ? { "aria-describedby": described } : {}),
        })
      : children;

  return (
    <div>
      <label
        htmlFor={targetId}
        className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft"
      >
        {label}
      </label>
      {child}
      {hint && (
        <p id={hintId} className="mt-1 text-xs leading-relaxed text-ink-soft/80">
          {hint}
        </p>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "urgent" | "good";
}) {
  const valueTone =
    tone === "urgent" ? "text-track-rejected" : tone === "good" ? "text-track-offer" : "text-ink";
  return (
    <div className="rounded-lg border border-stone-200 bg-paper-raised/50 px-4 py-3.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-1.5 font-heading text-2xl font-medium tabular-nums ${valueTone}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs leading-snug text-ink-soft">{sub}</p>}
    </div>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h3 className="font-heading text-lg font-medium text-ink">{children}</h3>
      {action}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-stone-300 bg-paper-raised/40 px-4 py-6 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  danger = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        danger
          ? "border-track-rejected/40 text-track-rejected hover:bg-track-rejected hover:text-paper"
          : "border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function SolidButton({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/85 ${className}`}
    >
      {children}
    </button>
  );
}

/** Small inline text input that writes on every keystroke. Used across the detail panel. */
export function TextInput({
  value,
  onChange,
  placeholder,
  id,
  type = "text",
  className = "",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  id?: string;
  type?: "text" | "date" | "url" | "email" | "number";
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onChange={(event) => onChange(event.target.value)}
      className={`track-field ${className}`}
    />
  );
}
