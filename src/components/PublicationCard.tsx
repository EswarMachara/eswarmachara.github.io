import RichText from "@/components/RichText";
import Badge from "@/components/Badge";
import SafeImage from "@/components/SafeImage";
import type { Publication } from "@/data/research";

export default function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <li className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-navy-50 sm:h-auto sm:w-40">
        <SafeImage
          src={publication.thumbnail}
          alt={`${publication.title} thumbnail`}
          fill
          sizes="160px"
          className="object-cover"
        />
        <span className="absolute left-2 top-2">
          <Badge label={publication.venueBadge.label} variant={publication.venueBadge.variant} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base font-semibold leading-snug text-navy">
          {publication.paperHref ? (
            <a href={publication.paperHref} target="_blank" rel="noopener noreferrer" className="hover:text-blue">
              {publication.title}
            </a>
          ) : (
            publication.title
          )}
        </h3>
        <p className="mt-1.5 text-sm text-slate-600">
          <RichText segments={publication.authors} />
        </p>
        <p className="mt-1 text-sm italic text-slate-500">{publication.venue}</p>

        {publication.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {publication.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-navy/70 px-3 py-1 text-xs font-semibold tracking-wide text-navy transition-colors hover:bg-navy hover:text-white"
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
