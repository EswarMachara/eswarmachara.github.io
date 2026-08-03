import Image from "next/image";
import { FaAt, FaHome, FaUniversity } from "react-icons/fa";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { SiGooglescholar } from "react-icons/si";
import RichText from "@/components/RichText";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import HeroIntro from "@/components/HeroIntro";
import { bio, education, profile, site } from "@/data/profile";
import { news } from "@/data/news";

const CONTACT_ROWS = [
  { icon: FaHome, content: profile.location },
  { icon: FaUniversity, content: profile.university },
  { icon: FaAt, content: site.email, href: `mailto:${site.email}` },
  { icon: SiGooglescholar, content: "Google Scholar", href: site.scholar },
  { icon: FaLinkedin, content: "LinkedIn", href: site.linkedin },
  { icon: FaGithub, content: "GitHub", href: site.github },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <div className="grid gap-10 sm:grid-cols-[260px_1fr] sm:gap-14">
        <HeroIntro>
          <Image
            src={profile.headshot}
            alt={`Photo of ${site.name}`}
            width={260}
            height={260}
            priority
            className="mx-auto aspect-square w-48 rounded-xl border border-slate-200 object-cover shadow-md sm:w-full"
          />

          <p className="mt-6 text-center font-heading text-lg font-semibold text-navy sm:text-left">
            {profile.title}
            <br />
            <span className="text-sm font-medium text-slate-500">{profile.program}</span>
          </p>

          <ul className="mt-6 space-y-3">
            {CONTACT_ROWS.map(({ icon: Icon, content, href }) => (
              <li key={content} className="flex items-start gap-3 text-sm text-slate-700">
                <Icon className="mt-0.5 shrink-0 text-navy/70" size={15} />
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
            <div className="space-y-5 text-[1rem] leading-relaxed text-slate-700">
              {bio.map((paragraph, index) => (
                <p key={index}>
                  <RichText segments={paragraph} />
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05} className="mt-12">
            <SectionHeading>News</SectionHeading>
            <ol className="thin-scrollbar max-h-56 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              {news.map((item, index) => (
                <Reveal as="li" key={index} delay={index * 0.04} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                  <span className="shrink-0 font-heading font-semibold text-navy">[{item.year}]</span>
                  <span>
                    <RichText segments={item.segments} />
                  </span>
                </Reveal>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <SectionHeading>Education</SectionHeading>
            <ul className="space-y-4">
              {education.map((entry) => (
                <li key={entry.institution}>
                  <p className="font-medium text-slate-800">
                    {entry.program} ({entry.years})
                  </p>
                  <p className="text-sm text-slate-500">
                    {entry.institution}, {entry.location}
                  </p>
                  <p className="text-sm text-slate-500">{entry.gpa}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
