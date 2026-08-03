import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaFilePdf, FaGithub, FaFilePowerpoint, FaFileMedical } from "react-icons/fa6";
import Reveal from "@/components/Reveal";
import Badge from "@/components/Badge";
import ProjectContent from "@/components/ProjectContent";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | Sai Manikanta Eswar Machara`,
      description: project.summary,
      url: `/projects/${project.slug}`,
    },
  };
}

const LINK_ICONS = {
  pdf: FaFilePdf,
  slides: FaFilePowerpoint,
  code: FaGithub,
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <Reveal>
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue-dark">
          <FaArrowLeft size={12} /> Back to Projects
        </Link>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <h1 className="font-heading text-3xl font-semibold text-navy">{project.title}</h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-slate-700">{project.summary}</p>

        {project.authors && (
          <p className="mt-4 text-sm text-slate-600">
            {project.authors.map((author, index) => (
              <span key={author.name}>
                {author.href ? (
                  <a href={author.href} target="_blank" rel="noopener noreferrer" className="link-hover">
                    {author.name}
                  </a>
                ) : (
                  <span className="font-semibold text-navy">{author.name}</span>
                )}
                <sup>{author.affiliation}</sup>
                {index < project.authors!.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}

        {project.affiliations && (
          <p className="mt-1 text-xs text-slate-400">
            {project.affiliations.map((aff, index) => (
              <span key={aff} className="mr-4">
                <sup>{index + 1}</sup> {aff}
              </span>
            ))}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.badges.map((badge) => (
            <Badge key={badge.label} label={badge.label} variant={badge.variant} />
          ))}
        </div>

        {project.links && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.links.map((link) => {
              const Icon = LINK_ICONS[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue"
                >
                  <Icon size={14} /> {link.label}
                </a>
              );
            })}
          </div>
        )}
      </Reveal>

      {project.comingSoon ? (
        <Reveal delay={0.1} className="mt-14 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
          <FaFileMedical size={44} className="mx-auto text-navy/20" />
          <h2 className="mt-5 font-heading text-xl font-semibold text-navy">Content Coming Soon</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            The full technical write-up for this project is currently being prepared. Check back soon, or get in
            touch directly to learn more about the current state of this work.
          </p>
          {project.tags && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-blue/25 bg-blue/5 px-3 py-1 text-xs font-medium text-blue">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Reveal>
      ) : (
        <div className="mt-14 space-y-10">
          {project.sections?.map((section, index) => (
            <Reveal key={section.heading} delay={Math.min(index * 0.05, 0.3)}>
              <ProjectContent section={section} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
