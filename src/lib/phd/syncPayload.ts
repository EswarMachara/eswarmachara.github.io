import { DEFAULT_DOCUMENTS } from "./presets";
import type { TrackerState } from "./types";

/**
 * Canonical serialisation used for "has this changed" comparisons.
 *
 * Keys are emitted in sorted order at every depth. Object key order in
 * JavaScript follows insertion order, and a lead built by `addLead` does not
 * have the same key order as the same lead rebuilt by `normalizeLead` after a
 * reload. Comparing raw JSON.stringify output therefore reported a change on
 * every reload, which made the sync layer think the local copy had been edited
 * when nothing had.
 *
 * Bookkeeping fields are excluded by listing the synced fields explicitly, so
 * recording a sync cannot look like a fresh edit and start a push loop.
 */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      if (source[key] === undefined) continue;
      out[key] = canonical(source[key]);
    }
    return out;
  }
  return value;
}

export function syncPayload(state: TrackerState): string {
  return JSON.stringify(
    canonical({
      version: state.version,
      leads: state.leads,
      documents: state.documents,
      recommenders: state.recommenders,
      tests: state.tests,
      settings: state.settings,
    }),
  );
}

/**
 * True when this copy holds nothing the user typed.
 *
 * The document registry is deliberately ignored when it is still the untouched
 * starter list. A brand-new device would otherwise count those seeded entries
 * as content, fail the emptiness test, and be pushed into the conflict prompt
 * on its very first sign-in instead of simply pulling the existing bench.
 */
export function isEmptyState(state: TrackerState): boolean {
  if (state.leads.length > 0 || state.recommenders.length > 0 || state.tests.length > 0) return false;
  if (state.documents.length === 0) return true;
  if (state.documents.length !== DEFAULT_DOCUMENTS.length) return false;
  const names = [...state.documents].sort((a, b) => a.order - b.order).map((def) => def.name);
  return names.every((name, index) => name === DEFAULT_DOCUMENTS[index]);
}

/** Human-readable summary of what a copy holds, for the conflict prompt. */
export function describeState(state: TrackerState): string {
  const parts = [
    `${state.leads.length} lead${state.leads.length === 1 ? "" : "s"}`,
    `${state.recommenders.length} referee${state.recommenders.length === 1 ? "" : "s"}`,
    `${state.tests.length} test record${state.tests.length === 1 ? "" : "s"}`,
  ];
  return isEmptyState(state) ? "nothing entered yet" : parts.join(", ");
}
