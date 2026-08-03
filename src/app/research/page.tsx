import type { Metadata } from "next";
import RichText from "@/components/RichText";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PublicationCard from "@/components/PublicationCard";
import { competitions, ongoingResearch, publications } from "@/data/research";

export const metadata: Metadata = {
  title: "Research",
  description: "Research publications by Sai Manikanta Eswar Machara in computer vision, medical imaging, and deep learning.",
  keywords: ["Eswar Machara", "research", "publications", "ICCV 2025", "CIPS-Net", "computer vision"],
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | Sai Manikanta Eswar Machara",
    description: "Research publications by Sai Manikanta Eswar Machara",
    url: "/research",
  },
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <Reveal>
        <h1 className="font-heading text-3xl font-semibold text-navy">Research</h1>
        <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-slate-700">
          My research interests span <em>Medical Image Analysis</em>, <em>Computational Biology</em>,{" "}
          <em>Computational Pathology</em>, and <em>Computer Vision</em>. I am particularly interested in problems that
          are grounded in Clinical Reality, where the work has to hold up not just technically but in a setting where
          it actually affects people. Below are my Publications and Ongoing Projects.
        </p>
      </Reveal>

      <div className="mt-12">
        <Reveal>
          <SectionHeading>Publications</SectionHeading>
        </Reveal>
        <ul className="space-y-5">
          {publications.map((publication, index) => (
            <Reveal as="li" key={publication.slug} delay={index * 0.06}>
              <PublicationCard publication={publication} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-3 text-xs italic text-slate-400">† Equal contribution</p>
      </div>

      <div className="mt-14">
        <Reveal>
          <SectionHeading>Ongoing Research Projects</SectionHeading>
          <ul className="space-y-4">
            {ongoingResearch.map((item) => (
              <li key={item.title} className="text-[0.98rem] leading-relaxed text-slate-700">
                <strong className="font-semibold text-navy">{item.title}</strong> - {item.description}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-14">
        <Reveal>
          <SectionHeading>Research Competitions</SectionHeading>
          <ul className="space-y-4">
            {competitions.map((competition) => (
              <li key={competition.rank} className="text-[0.98rem] leading-relaxed text-slate-700">
                <a href={competition.rankHref} target="_blank" rel="noopener noreferrer" className="link-hover font-semibold">
                  {competition.rank}
                </a>{" "}
                - <RichText segments={competition.name} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
