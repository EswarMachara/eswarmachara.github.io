import Link from "next/link";
import { FaGithub, FaCircleInfo } from "react-icons/fa6";
import Badge from "@/components/Badge";
import SafeImage from "@/components/SafeImage";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      <Link href={`/projects/${project.slug}`} className="relative h-44 w-full shrink-0 overflow-hidden rounded-lg bg-navy-50 sm:h-auto sm:w-56">
        <SafeImage src={project.thumbnail} alt={project.title} fill sizes="224px" className="object-contain p-3" />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-lg font-semibold text-navy">
          <Link href={`/projects/${project.slug}`} className="hover:text-blue">
            {project.title}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.badges.map((badge) => (
            <Badge key={badge.label} label={badge.label} variant={badge.variant} />
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{project.summary}</p>
        <div className="mt-4 flex items-center gap-4 text-sm font-medium">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-blue hover:text-blue-dark">
            <FaCircleInfo size={13} /> Details
          </Link>
          <a
            href={project.githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-navy"
          >
            <FaGithub size={14} /> GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
