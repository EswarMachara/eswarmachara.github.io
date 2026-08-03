import Link from "next/link";
import RichText from "@/components/RichText";
import Badge from "@/components/Badge";
import SafeImage from "@/components/SafeImage";
import type { Publication } from "@/data/research";

export default function PublicationCard({ publication }: { publication: Publication }) {
  const articleHref = publication.sections ? `/research/${publication.slug}` : undefined;

  return (
    <div className="group flex flex-col gap-5 border-l-2 border-stone-200 bg-paper-raised/50 p-5 transition-all hover:border-gold hover:bg-paper-raised sm:flex-row">
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md bg-stone-200 sm:h-auto sm:w-40">
        <SafeImage
          src={publication.thumbnail}
          alt={`${publication.title} thumbnail`}
          fill
          sizes="160px"
          className="object-cover grayscale-[15%] transition-all duration-300 group-hover:grayscale-0"
        />
        <span className="absolute left-2 top-2">
          <Badge label={publication.venueBadge.label} variant={publication.venueBadge.variant} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-lg font-medium leading-snug text-ink">
          {articleHref ? (
            <Link href={articleHref} className="hover:text-wine">
              {publication.title}
            </Link>
          ) : publication.paperHref ? (
            <a href={publication.paperHref} target="_blank" rel="noopener noreferrer" className="hover:text-wine">
              {publication.title}
            </a>
          ) : (
            publication.title
          )}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          <RichText segments={publication.authors} />
        </p>
        <p className="mt-1 text-sm italic text-ink-soft/80">{publication.venue}</p>

        {(articleHref || publication.links.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {articleHref && (
              <Link
                href={articleHref}
                className="rounded-full bg-ink px-3.5 py-1 text-xs font-semibold tracking-wide text-paper transition-colors hover:bg-ink/85"
              >
                READ THE ARTICLE
              </Link>
            )}
            {publication.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/70 px-3.5 py-1 text-xs font-semibold tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
