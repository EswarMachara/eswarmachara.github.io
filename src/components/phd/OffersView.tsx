"use client";

import { FaTriangleExclamation } from "react-icons/fa6";
import { formatDate } from "@/lib/phd/dates";
import { buildOfferComparison } from "@/lib/phd/derive";
import type { OfferDetails, TrackerState } from "@/lib/phd/types";
import type { TrackerActions } from "@/lib/phd/useTracker";
import { CountdownChip, EmptyNote, Field, SectionLabel, StatusChip, TextInput } from "./ui";

function money(value: number | null, currency: string): string {
  if (value === null) return "not set";
  const prefix = currency === "unset" ? "" : `${currency} `;
  return `${prefix}${value.toLocaleString()}`;
}

export default function OffersView({
  state,
  actions,
  onOpenLead,
}: {
  state: TrackerState;
  actions: TrackerActions;
  onOpenLead: (id: string) => void;
}) {
  const comparison = buildOfferComparison(state.leads);

  if (comparison.rows.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyNote>
          Nothing to compare yet. Once a programme is marked as an offer or a waitlist, it appears here with a
          funding breakdown next to the others.
        </EmptyNote>
        <div className="rounded-lg border border-stone-200 bg-paper-raised/40 px-5 py-4">
          <h3 className="font-heading text-base font-medium text-ink">What to write down when an offer lands</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {[
              "The stipend, and whether it is quoted per year or per month",
              "How many years of funding are guaranteed in writing, not implied",
              "Whether tuition is waived or merely covered in year one",
              "Whether health insurance is included, and for dependents if that matters",
              "Your own estimate of monthly living cost in that city",
              "The date by which you have to reply",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {comparison.mixedCurrency && (
        <p className="flex items-start gap-2.5 rounded-lg border border-gold/40 bg-gold/8 px-4 py-3 text-sm text-ink">
          <FaTriangleExclamation size={14} className="mt-0.5 shrink-0 text-gold-deep" />
          <span>
            These offers are quoted in more than one currency ({comparison.currencies.join(", ")}). Nothing here is
            converted, because a made-up exchange rate would give you a confident ranking with no basis. Compare
            within a currency, and treat the surplus column as a guide only.
          </span>
        </p>
      )}

      <section>
        <SectionLabel action={<span className="text-xs text-ink-soft">ranked by monthly surplus</span>}>
          Side by side
        </SectionLabel>
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-paper-raised">
              <tr>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Programme</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Stipend / month</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Living cost</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Surplus</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 text-right font-semibold text-ink">Funded</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Covers</th>
                <th scope="col" className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">Reply by</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr
                  key={row.lead.id}
                  onClick={() => onOpenLead(row.lead.id)}
                  className="cursor-pointer odd:bg-paper even:bg-paper-raised/40 hover:bg-gold/8"
                >
                  <td className="border-b border-stone-100 px-4 py-3">
                    <p className="font-medium text-ink">{row.lead.university}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                      <StatusChip status={row.lead.status} />
                      {row.lead.country}
                    </p>
                  </td>
                  <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3 text-right tabular-nums text-ink">
                    {money(row.monthlyStipend, row.currency)}
                  </td>
                  <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3 text-right tabular-nums text-ink-soft">
                    {money(row.lead.offer?.monthlyLivingCost ?? null, row.currency)}
                  </td>
                  <td
                    className={`whitespace-nowrap border-b border-stone-100 px-4 py-3 text-right font-semibold tabular-nums ${
                      row.monthlySurplus === null
                        ? "text-ink-soft"
                        : row.monthlySurplus < 0
                          ? "text-track-rejected"
                          : "text-track-offer"
                    }`}
                  >
                    {money(row.monthlySurplus, row.currency)}
                  </td>
                  <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3 text-right tabular-nums text-ink-soft">
                    {row.guaranteedYears === null ? "not set" : `${row.guaranteedYears} yr`}
                  </td>
                  <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3 text-xs text-ink-soft">
                    {[row.tuitionWaived ? "tuition" : null, row.healthCovered ? "health" : null]
                      .filter(Boolean)
                      .join(", ") || "nothing recorded"}
                  </td>
                  <td className="whitespace-nowrap border-b border-stone-100 px-4 py-3">
                    {row.lead.offer?.respondBy ? (
                      <>
                        <CountdownChip days={row.respondByDays} kind="hard" />
                        <p className="mt-1 text-[0.7rem] text-ink-soft">{formatDate(row.lead.offer.respondBy)}</p>
                      </>
                    ) : (
                      <span className="text-xs text-ink-soft">not set</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          Surplus is stipend minus your own living-cost estimate. It is the closest thing to a like-for-like
          number, and it is only as good as the estimate you put in.
        </p>
      </section>

      <section>
        <SectionLabel>Fill in the details</SectionLabel>
        <ul className="space-y-4">
          {comparison.rows.map((row) => {
            const offer: OfferDetails = row.lead.offer ?? {};
            const patch = (values: Partial<OfferDetails>) => actions.patchOffer(row.lead.id, values);
            return (
              <li key={row.lead.id} className="rounded-lg border border-stone-200 bg-paper p-5">
                <h4 className="font-heading text-base font-medium text-ink">{row.lead.university}</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <Field label="Stipend amount">
                    <TextInput
                      type="number"
                      value={offer.stipendAmount === undefined ? "" : String(offer.stipendAmount)}
                      onChange={(value) =>
                        patch({
                          stipendAmount: value === "" ? undefined : Number(value),
                          // Write the period explicitly the first time an amount is entered,
                          // so nothing downstream has to guess how it was quoted.
                          stipendPeriod: offer.stipendPeriod ?? "year",
                        })
                      }
                      placeholder="e.g. 38000"
                    />
                  </Field>
                  <Field label="Quoted per">
                    <select
                      value={offer.stipendPeriod ?? "year"}
                      onChange={(event) => patch({ stipendPeriod: event.target.value as "year" | "month" })}
                      className="track-field"
                    >
                      <option value="year">Year</option>
                      <option value="month">Month</option>
                    </select>
                  </Field>
                  <Field label="Currency">
                    <TextInput
                      value={offer.currency ?? ""}
                      onChange={(value) => patch({ currency: value || undefined })}
                      placeholder="USD"
                    />
                  </Field>
                  <Field label="Guaranteed years">
                    <TextInput
                      type="number"
                      value={offer.guaranteedYears === undefined ? "" : String(offer.guaranteedYears)}
                      onChange={(value) => patch({ guaranteedYears: value === "" ? undefined : Number(value) })}
                      placeholder="5"
                    />
                  </Field>
                  <Field label="Monthly living cost" hint="Your own estimate, same currency.">
                    <TextInput
                      type="number"
                      value={offer.monthlyLivingCost === undefined ? "" : String(offer.monthlyLivingCost)}
                      onChange={(value) => patch({ monthlyLivingCost: value === "" ? undefined : Number(value) })}
                      placeholder="e.g. 1800"
                    />
                  </Field>
                  <Field label="Reply by">
                    <TextInput
                      type="date"
                      value={offer.respondBy ?? ""}
                      onChange={(value) => patch({ respondBy: value || undefined })}
                    />
                  </Field>
                  <Field label="Advisor confirmed">
                    <TextInput
                      value={offer.advisorConfirmed ?? ""}
                      onChange={(value) => patch({ advisorConfirmed: value || undefined })}
                      placeholder="Name, or blank if unassigned"
                    />
                  </Field>
                  <div className="flex items-end gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={offer.tuitionWaived === true}
                        onChange={(event) => patch({ tuitionWaived: event.target.checked || undefined })}
                        className="accent-wine"
                      />
                      Tuition waived
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={offer.healthCovered === true}
                        onChange={(event) => patch({ healthCovered: event.target.checked || undefined })}
                        className="accent-wine"
                      />
                      Health
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <Field label="Notes">
                    <textarea
                      value={offer.notes ?? ""}
                      onChange={(event) => patch({ notes: event.target.value || undefined })}
                      rows={2}
                      placeholder="Teaching load, cohort size, what the current students said"
                      className="track-field resize-y leading-relaxed"
                    />
                  </Field>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
