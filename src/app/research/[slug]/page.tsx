import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import Reveal from "@/components/Reveal";
import Badge from "@/components/Badge";
import ArticleContent from "@/components/ArticleContent";
import { getPublication, publications } from "@/data/research";

const ARTICLE_SLUGS = publications.filter((p) => p.sections).map((p) => p.slug);

export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const publication = getPublication(slug);
  if (!publication || !publication.sections) return {};

  return {
    title: publication.title,
    description: publication.deck ?? publication.venue,
    alternates: { canonical: `/research/${publication.slug}` },
    openGraph: {
      title: `${publication.title} | Sai Manikanta Eswar Machara`,
      description: publication.deck ?? publication.venue,
      url: `/research/${publication.slug}`,
    },
  };
}

function estimateReadingMinutes(sectionsWordCount: number) {
  return Math.max(1, Math.round(sectionsWordCount / 200));
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publication = getPublication(slug);
  if (!publication || !publication.sections) notFound();

  const wordCount = publication.sections.reduce(
    (total, section) =>
      total +
      section.blocks.reduce((blockTotal, block) => {
        if (block.kind === "paragraph" || block.kind === "subheading") return blockTotal + block.text.split(/\s+/).length;
        if (block.kind === "list") return blockTotal + block.items.reduce((n, item) => n + item.text.split(/\s+/).length, 0);
        return blockTotal;
      }, 0),
    0,
  );
  const readingMinutes = estimateReadingMinutes(wordCount);

  return (
    <article className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
      <Reveal>
        <Link href="/research" className="inline-flex items-center gap-2 text-sm font-medium text-wine hover:text-wine-dark">
          <FaArrowLeft size={12} /> Back to Research
        </Link>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <div className="flex items-center gap-3">
          <Badge label={publication.venueBadge.label} variant={publication.venueBadge.variant} />
          <span className="text-xs text-ink-soft">{publication.dateLabel}</span>
          <span className="text-xs text-ink-soft">·</span>
          <span className="text-xs text-ink-soft">{readingMinutes} min read</span>
        </div>

        <h1 className="mt-5 font-heading text-3xl font-medium leading-tight text-ink sm:text-4xl">{publication.title}</h1>

        {publication.deck && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{publication.deck}</p>}

        {publication.articleAuthors && (
          <p className="mt-6 text-sm text-ink-soft">
            {publication.articleAuthors.map((author, index) => (
              <span key={author.name}>
                {author.href ? (
                  <a href={author.href} target="_blank" rel="noopener noreferrer" className="link-hover">
                    {author.name}
                  </a>
                ) : (
                  <span className="font-semibold text-ink">{author.name}</span>
                )}
                <sup>{author.affiliation}</sup>
                {index < publication.articleAuthors!.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}

        {publication.affiliations && (
          <p className="mt-1 text-xs text-ink-soft/70">
            {publication.affiliations.map((aff, index) => (
              <span key={aff} className="mr-4">
                <sup>{index + 1}</sup> {aff}
              </span>
            ))}
          </p>
        )}

        <p className="mt-2 text-sm italic text-ink-soft">{publication.venue}</p>

        {publication.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {publication.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/70 px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </Reveal>

      {publication.heroImage && (
        <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-lg border border-stone-200 bg-paper-raised">
          <Image
            src={publication.heroImage}
            alt={`${publication.title} overview figure`}
            width={1400}
            height={700}
            priority
            className="h-auto w-full object-contain"
          />
        </Reveal>
      )}

      <div className="mt-12 space-y-10">
        {publication.sections.map((section, index) => (
          <Reveal key={section.heading} delay={Math.min(index * 0.04, 0.24)}>
            <ArticleContent section={section} />
          </Reveal>
        ))}
      </div>
    </article>
  );
}
