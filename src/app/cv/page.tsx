import type { Metadata } from "next";
import { FaDownload } from "react-icons/fa6";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import CvViewerLoader from "@/components/CvViewerLoader";
import { site } from "@/data/profile";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae of ${site.name}.`,
  alternates: { canonical: "/cv" },
  openGraph: {
    title: `CV | ${site.name}`,
    description: `Curriculum vitae of ${site.name}.`,
    url: "/cv",
  },
};

export default function CvPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader kicker="Curriculum Vitae" title="CV" />
        <Reveal delay={0.05}>
          <a
            href={site.cv}
            download
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
          >
            <FaDownload size={13} /> Download PDF
          </a>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-10">
        <CvViewerLoader src={site.cv} />
      </Reveal>
    </div>
  );
}
