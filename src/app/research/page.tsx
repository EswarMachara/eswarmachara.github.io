import type { Metadata } from "next";
import RichText from "@/components/RichText";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PageHeader from "@/components/PageHeader";
import PublicationCard from "@/components/PublicationCard";
import { competitions, ongoingResearch, publications } from "@/data/research";

export const metadata: Metadata = {
  title: "Research",
  description: "Research publications by Sai Manikanta Eswar Machara in computer vision, medical imaging, and deep learning.",
  keywords: ["Eswar Machara", "research", "publications", "ICCV 2025", "DebrisVision", "computer vision"],
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | Sai Manikanta Eswar Machara",
    description: "Research publications by Sai Manikanta Eswar Machara",
    url: "/research",
  },
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <PageHeader kicker="Publications & Ongoing Work" title="Research">
        My research interests span <em>Medical Image Analysis</em>, <em>Computational Biology</em>,{" "}
        <em>Computational Pathology</em>, and <em>Computer Vision</em>. I am particularly interested in problems that
        are grounded in Clinical Reality, where the work has to hold up not just technically but in a setting where
        it actually affects people. Below are my Publications and Ongoing Projects.
      </PageHeader>

      <div className="mt-16">
        <Reveal>
          <SectionHeading index="01">Publications</SectionHeading>
        </Reveal>
        <ul className="space-y-5">
          {publications.map((publication, index) => (
            <Reveal as="li" key={publication.slug} delay={index * 0.06}>
              <PublicationCard publication={publication} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-3 text-xs italic text-ink-soft">† Equal contribution</p>
      </div>

      <div className="mt-16">
        <Reveal>
          <SectionHeading index="02">Ongoing Research Projects</SectionHeading>
          <ul className="space-y-4">
            {ongoingResearch.map((item) => (
              <li key={item.title} className="border-l-2 border-gold/50 pl-4 text-[0.98rem] leading-relaxed text-ink-soft">
                <strong className="font-semibold text-ink">{item.title}</strong> - {item.description}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-16">
        <Reveal>
          <SectionHeading index="03">Research Competitions</SectionHeading>
          <ul className="space-y-4">
            {competitions.map((competition, index) => (
              <li key={index} className="text-[0.98rem] leading-relaxed text-ink-soft">
                {competition.rankHref ? (
                  <a href={competition.rankHref} target="_blank" rel="noopener noreferrer" className="link-hover font-semibold">
                    {competition.rank}
                  </a>
                ) : (
                  <span className="font-semibold text-ink">{competition.rank}</span>
                )}{" "}
                - <RichText segments={competition.name} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
