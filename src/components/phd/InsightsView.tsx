"use client";

import { buildFunnel, groupCount, monthlyVolume, statusBreakdown } from "@/lib/phd/derive";
import { LEAD_SOURCE_LABELS } from "@/lib/phd/presets";
import type { LeadSource, TrackerState } from "@/lib/phd/types";
import { BarList, ColumnChart, RateTile } from "./charts";
import type { BarDatum } from "./charts";
import { EmptyNote, SectionLabel } from "./ui";

export default function InsightsView({ state }: { state: TrackerState }) {
  const { leads } = state;

  if (leads.length === 0) {
    return <EmptyNote>Nothing to chart yet. Insights fill in as you add applications and log outreach.</EmptyNote>;
  }

  const funnel = buildFunnel(leads);
  const statuses = statusBreakdown(leads);
  // "2026-09" is not a chart label. Show the month, with the year only where it
  // turns over, so a season spanning a new year still reads unambiguously.
  const months = monthlyVolume(leads).map((bucket, index) => {
    const [year, month] = bucket.key.split("-").map(Number);
    const name = new Date(year, month - 1, 1).toLocaleString("en", { month: "short" });
    return { ...bucket, label: index === 0 || month === 1 ? `${name} ${year}`.replace(" 20", " '") : name };
  });
  const areas = groupCount(leads, (lead) => lead.researchArea, "Not set");
  const countries = groupCount(leads, (lead) => lead.country, "Not set");
  const sources = groupCount(
    leads,
    (lead) => (lead.source && lead.source !== "unknown" ? LEAD_SOURCE_LABELS[lead.source as LeadSource] : undefined),
    "Not recorded",
  );

  // One shared scale across the funnel so each stage is read against the top.
  const funnelRows: BarDatum[] = [
    { key: "leads", label: "On the bench", value: funnel.leads },
    { key: "applied", label: "Filed", value: funnel.applied },
    { key: "responded", label: "Any response", value: funnel.responded },
    { key: "interviews", label: "Interviewed", value: funnel.interviews },
    { key: "offers", label: "Offers", value: funnel.offers },
  ].map((row, index, all) => {
    if (index === 0 || all[index - 1].value === 0 || row.value === 0) return row;
    const carried = Math.round((row.value / all[index - 1].value) * 100);
    return { ...row, note: `${carried}% of prev` };
  });

  return (
    <div className="space-y-12">
      <section>
        <SectionLabel>Conversion</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RateTile label="Response rate" numerator={funnel.responded} denominator={funnel.applied} />
          <RateTile label="Interview to offer" numerator={funnel.offers} denominator={funnel.interviews} minimum={3} />
          <RateTile label="Outreach replies" numerator={funnel.outreachReplied} denominator={funnel.outreachSent} />
          <RateTile label="Rejection rate" numerator={funnel.rejections} denominator={funnel.applied} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Every rate carries its denominator, and one built on fewer than a handful of applications is labelled as
          too thin to read. A 100% response rate off two applications is not a signal.
        </p>
      </section>

      <section>
        <SectionLabel action={<span className="text-xs text-ink-soft">shared scale</span>}>
          Funnel
        </SectionLabel>
        <BarList data={funnelRows} max={funnel.leads} emphasiseFirst />
      </section>

      <section>
        <SectionLabel>Where everything sits</SectionLabel>
        <BarList data={statuses} />
      </section>

      {months.length > 1 && (
        <section>
          <SectionLabel action={<span className="text-xs text-ink-soft">leads added per month</span>}>
            Pace
          </SectionLabel>
          <ColumnChart data={months} />
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Research areas</SectionLabel>
          <BarList data={areas.slice(0, 10)} />
        </section>
        <section>
          <SectionLabel>Countries</SectionLabel>
          <BarList data={countries.slice(0, 10)} />
        </section>
      </div>

      <section>
        <SectionLabel action={<span className="text-xs text-ink-soft">which channels actually produce leads</span>}>
          Where leads came from
        </SectionLabel>
        <BarList data={sources} />
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Worth checking against the funnel above once the season is underway. A channel that produces plenty of
          leads and no responses is costing you time.
        </p>
      </section>
    </div>
  );
}
