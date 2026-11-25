import type { MetadataRoute } from "next";
import { absoluteUrl, indexable } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be able to read the preview's noindex directive.
    rules: { userAgent: "*", allow: "/" },
    ...(indexable ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  };
}
