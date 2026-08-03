import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PageHeader from "@/components/PageHeader";
import ExperienceCard from "@/components/ExperienceCard";
import { academicCollaborations, extraCurricular } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience and academic collaborations of Sai Manikanta Eswar Machara: AI research, deep learning projects, and competition achievements.",
  keywords: ["Eswar Machara experience", "research experience", "AI hackathons", "ICCV 2025", "IEEE INDICON", "RGUKT Nuzvid"],
  alternates: { canonical: "/experience" },
  openGraph: {
    title: "Experience | Sai Manikanta Eswar Machara",
    description: "Professional experience and academic collaborations",
    url: "/experience",
  },
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <PageHeader kicker="Where I've Worked" title="Experience" />

      <div className="mt-16">
        <Reveal>
          <SectionHeading index="01">Academic Collaborations</SectionHeading>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-5">
          {academicCollaborations.map((entry, index) => (
            <Reveal key={entry.institution} delay={index * 0.06}>
              <ExperienceCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Reveal>
          <SectionHeading index="02">Extra-Curricular</SectionHeading>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-5">
          {extraCurricular.map((entry, index) => (
            <Reveal key={entry.institution} delay={index * 0.06}>
              <ExperienceCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
