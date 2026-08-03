import type { MetadataRoute } from "next";
import { site } from "@/data/profile";

export const dynamic = "force-static";

// The /projects section is intentionally left out here while its content is
// still being written up — same as it was on the previous static site.
// Once it's ready, add entries for /projects and /projects/[slug].
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${site.url}/research`, lastModified: new Date(), priority: 0.9 },
    { url: `${site.url}/experience`, lastModified: new Date(), priority: 0.8 },
  ];
}
