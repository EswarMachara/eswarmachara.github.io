"use client";

/**
 * Chart primitives for the Insights tab.
 *
 * Every chart here plots one measure, so every chart uses one hue and the
 * category name is the label beside the mark. That is deliberate: the app's
 * status colours are close-toned warm neutrals chosen to sit inside the
 * editorial palette, and as a categorical set they fail a colour-blindness
 * separation check badly (the two golds land at a normal-vision Delta E of 5.6,
 * under the floor of 15). Text carries identity here; colour only carries
 * magnitude. Status colours stay where they belong, on chips that always ship
 * their own label.
 *
 * Marks are built from semantic lists rather than SVG, so the numbers are read
 * by a screen reader without needing a separate table view.
 */

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Optional right-hand annotation, e.g. a share or a drop-off. */
  note?: string;
}

export function BarList({
  data,
  max,
  unit = "",
  emphasiseFirst = false,
}: {
  data: BarDatum[];
  /** Shared scale ceiling. Defaults to the largest value present. */
  max?: number;
  unit?: string;
  /** Funnel mode: the first row is the reference the rest are read against. */
  emphasiseFirst?: boolean;
}) {
  const ceiling = Math.max(1, max ?? Math.max(...data.map((row) => row.value), 0));

  return (
    <ul className="space-y-2.5">
      {data.map((row, index) => {
        const share = Math.round((row.value / ceiling) * 100);
        return (
          <li key={row.key} className="grid grid-cols-[minmax(6.5rem,9.5rem)_1fr_auto] items-center gap-3">
            <span
              className={`truncate text-xs ${emphasiseFirst && index === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}
              title={row.label}
            >
              {row.label}
            </span>
            <span
              className="relative block h-2 overflow-hidden rounded-full bg-stone-200/70"
              title={`${row.label}: ${row.value}${unit}`}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-r-[4px] bg-gold transition-[width] duration-500"
                style={{ width: `${share}%` }}
              />
            </span>
            <span className="shrink-0 text-right text-xs tabular-nums text-ink">
              {row.value}
              {unit}
              {row.note && <span className="ml-1.5 text-ink-soft/70">{row.note}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Columns over time. Bars are anchored to a shared baseline with a rounded top
 * edge, and every column keeps its slot even at zero so a quiet month reads as
 * a gap rather than disappearing from the sequence.
 */
export function ColumnChart({ data, unit = "" }: { data: BarDatum[]; unit?: string }) {
  const ceiling = Math.max(1, ...data.map((row) => row.value));
  // Past roughly a year of buckets, thin the labels so they stop colliding.
  const labelEvery = data.length > 12 ? 3 : data.length > 7 ? 2 : 1;

  return (
    <div>
      <ul className="flex h-36 items-end gap-[2px]" role="list">
        {data.map((row) => {
          const height = Math.round((row.value / ceiling) * 100);
          return (
            <li
              key={row.key}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${row.label}: ${row.value}${unit}`}
            >
              {row.value > 0 && (
                <span className="mb-1 text-center text-[0.65rem] tabular-nums text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
                  {row.value}
                </span>
              )}
              <span
                className="w-full rounded-t-[4px] bg-gold transition-[height] duration-500"
                style={{ height: `${Math.max(height, row.value > 0 ? 3 : 0)}%` }}
              />
              <span className="sr-only">
                {row.label}: {row.value}
                {unit}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex gap-[2px] border-t border-stone-200 pt-1.5">
        {data.map((row, index) => (
          <span key={row.key} className="flex-1 text-center text-[0.6rem] text-ink-soft/70">
            {index % labelEvery === 0 ? row.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * A rate with its denominator shown, plus an explicit caveat when the
 * denominator is too small to mean anything. A response rate off three
 * applications is noise, and presenting it as a clean percentage would invite a
 * decision the data cannot support.
 */
export function RateTile({
  label,
  numerator,
  denominator,
  minimum = 5,
}: {
  label: string;
  numerator: number;
  denominator: number;
  minimum?: number;
}) {
  const percent = denominator === 0 ? null : Math.round((numerator / denominator) * 100);
  const thin = denominator > 0 && denominator < minimum;

  return (
    <div className="rounded-lg border border-stone-200 bg-paper-raised/50 px-4 py-3.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-1.5 font-heading text-2xl font-medium tabular-nums text-ink">
        {percent === null ? "n/a" : `${percent}%`}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-ink-soft">
        {denominator === 0
          ? "nothing to measure yet"
          : `${numerator} of ${denominator}${thin ? ", too few to read as a rate" : ""}`}
      </p>
    </div>
  );
}
