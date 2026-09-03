import Image from "next/image";
import { FaAt, FaHome, FaUniversity } from "react-icons/fa";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { SiGooglescholar } from "react-icons/si";
import RichText from "@/components/RichText";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import HeroIntro from "@/components/HeroIntro";
import HeroText from "@/components/HeroText";
import NeuralBackground from "@/components/effects/NeuralBackground";
import ScrambleText from "@/components/effects/ScrambleText";
import TiltCard from "@/components/effects/TiltCard";
import { bio, education, profile, site } from "@/data/profile";
import { news } from "@/data/news";

const CONTACT_ROWS = [
  { icon: FaHome, content: profile.location },
  { icon: FaUniversity, content: profile.university, href: profile.universityHref },
  { icon: FaAt, content: site.email, href: `mailto:${site.email}` },
  { icon: SiGooglescholar, content: "Google Scholar", href: site.scholar },
  { icon: FaLinkedin, content: "LinkedIn", href: site.linkedin },
  { icon: FaGithub, content: "GitHub", href: site.github },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200">
        <NeuralBackground />
        <div className="relative mx-auto max-w-4xl px-5 pb-14 pt-16 sm:pb-20 sm:pt-24">
          <HeroText>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <span className="h-px w-9 bg-gold" />
              {profile.title}
            </p>
            <h1 className="mt-6 max-w-2xl font-heading text-[2.6rem] font-medium leading-[1.08] text-ink sm:text-6xl">
              <ScrambleText text={site.nameLead} />{" "}
              <ScrambleText as="em" text={site.nameAccent} className="italic text-wine" startDelay={350} />
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{profile.program}</p>
          </HeroText>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[240px_1fr] md:gap-14">
          <HeroIntro>
            <TiltCard className="mx-auto w-40 md:mx-0 md:w-full">
              <Image
                src={profile.headshot}
                alt={`Photo of ${site.name}`}
                width={260}
                height={260}
                priority
                className="aspect-square w-full rounded-xl border border-stone-200 object-cover"
              />
            </TiltCard>

            <ul className="mt-10 space-y-3 border-t border-stone-200 pt-6">
              {CONTACT_ROWS.map(({ icon: Icon, content, href }) => (
                <li key={content} className="flex items-start gap-3 text-sm text-ink-soft">
                  <Icon className="mt-0.5 shrink-0 text-gold" size={14} />
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="link-hover break-all">
                      {content}
                    </a>
                  ) : (
                    <span className="break-words">{content}</span>
                  )}
                </li>
              ))}
            </ul>
          </HeroIntro>

          <div className="min-w-0">
            <Reveal>
              <div className="space-y-5 text-[1.02rem] leading-[1.75] text-ink-soft">
                {bio.map((paragraph, index) => (
                  <p key={index}>
                    <RichText segments={paragraph} />
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-14">
              <SectionHeading index="01">News</SectionHeading>
              <ol className="relative ml-1 border-l border-stone-200 pl-7">
                {news.map((item, index) => (
                  <Reveal as="li" key={index} delay={index * 0.04} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-gold" />
                    <span className="font-heading text-sm italic text-gold">{item.year}</span>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      <RichText segments={item.segments} />
                    </p>
                  </Reveal>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.1} className="mt-14">
              <SectionHeading index="02">Education</SectionHeading>
              <ul className="space-y-4">
                {education.map((entry) => (
                  <li key={entry.program} className="border-l-2 border-gold/50 pl-4">
                    <p className="font-medium text-ink">
                      {entry.program} ({entry.years})
                    </p>
                    <p className="text-sm text-ink-soft">
                      {entry.institutionHref ? (
                        <a href={entry.institutionHref} target="_blank" rel="noopener noreferrer" className="link-hover">
                          {entry.institution}
                        </a>
                      ) : (
                        entry.institution
                      )}
                      , {entry.location}
                    </p>
                    <p className="text-sm text-ink-soft">{entry.gpa}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
