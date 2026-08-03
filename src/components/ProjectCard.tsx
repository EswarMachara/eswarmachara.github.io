import Link from "next/link";
import { FaGithub, FaCircleInfo } from "react-icons/fa6";
import Badge from "@/components/Badge";
import SafeImage from "@/components/SafeImage";
import Spotlight from "@/components/effects/Spotlight";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Spotlight className="group flex flex-col gap-5 border-l-2 border-stone-200 bg-paper-raised/50 p-5 transition-all hover:border-gold hover:bg-paper-raised sm:flex-row">
      <Link href={`/projects/${project.slug}`} className="relative h-44 w-full shrink-0 overflow-hidden rounded-md bg-stone-100 sm:h-auto sm:w-56">
        <SafeImage
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="224px"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-xl font-medium text-ink">
          <Link href={`/projects/${project.slug}`} className="hover:text-wine">
            {project.title}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.badges.map((badge) => (
            <Badge key={badge.label} label={badge.label} variant={badge.variant} />
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{project.summary}</p>
        <div className="mt-4 flex items-center gap-5 text-sm font-medium">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-wine hover:text-wine-dark">
            <FaCircleInfo size={13} /> Details
          </Link>
          <a
            href={project.githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink"
          >
            <FaGithub size={14} /> GitHub
          </a>
        </div>
      </div>
    </Spotlight>
  );
}
