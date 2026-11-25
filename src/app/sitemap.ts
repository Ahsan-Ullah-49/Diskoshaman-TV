import type { MetadataRoute } from "next";
import { sitePages } from "@/content/site";
import { absoluteUrl, indexable } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexable
    ? sitePages.map(({ path }) => ({ url: absoluteUrl(path) }))
    : [];
}
