import type { MetadataRoute } from "next";
import { site } from "@/data/profile";
import { publications } from "@/data/research";

export const dynamic = "force-static";

// The /projects section is intentionally left out here while its content is
// still being written up — same as it was on the previous static site.
// Once it's ready, add entries for /projects and /projects/[slug].
export default function sitemap(): MetadataRoute.Sitemap {
  const articleEntries: MetadataRoute.Sitemap = publications
    .filter((publication) => publication.sections)
    .map((publication) => ({
      url: `${site.url}/research/${publication.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    }));

  return [
    { url: `${site.url}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${site.url}/research`, lastModified: new Date(), priority: 0.9 },
    ...articleEntries,
    { url: `${site.url}/experience`, lastModified: new Date(), priority: 0.8 },
    { url: `${site.url}/cv`, lastModified: new Date(), priority: 0.6 },
  ];
}
