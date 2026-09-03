import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TrackerApp from "@/components/phd/TrackerApp";

/**
 * Kept out of the sitemap and the primary nav, and explicitly noindex: this is a
 * working tool rather than part of the public portfolio, and an application list
 * with statuses on it is not something to hand to a search engine.
 */
export const metadata: Metadata = {
  title: "PhD Bench",
  description: "Private application tracker. Data stays in the browser.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/phd-tracker" },
};

export default function PhdTrackerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <PageHeader kicker="Private Workspace" title="PhD Bench">
        Every programme I am considering for {" "}
        <em>Fall 2027</em>, what each one needs, and what is due next. Deadlines drive the warnings, so a lead with
        a date on it will start asking for attention well before it becomes a problem.
      </PageHeader>
      <TrackerApp />
    </div>
  );
}
