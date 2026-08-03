import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ExperienceCard from "@/components/ExperienceCard";
import { academicCollaborations, extraCurricular } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience and academic collaborations of Sai Manikanta Eswar Machara — AI research, deep learning projects, and competition achievements.",
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
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <Reveal>
        <h1 className="font-heading text-3xl font-semibold text-navy">Professional Experience</h1>
      </Reveal>

      <div className="mt-12">
        <Reveal>
          <SectionHeading>Academic Collaborations</SectionHeading>
        </Reveal>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {academicCollaborations.map((entry, index) => (
            <Reveal key={entry.institution} delay={index * 0.06}>
              <ExperienceCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <Reveal>
          <SectionHeading>Extra-Curricular</SectionHeading>
        </Reveal>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
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
