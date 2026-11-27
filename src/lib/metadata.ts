import type { Metadata } from "next";
import { showreelPoster, site } from "@/content/site";

export const indexable =
  process.env.SITE_INDEXING === "enabled" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");

export function absoluteUrl(path: string) {
  return new URL(path, site.url).href;
}

export function pageMetadata(
  page: { path: string; title: string; description: string },
  image: { url: string; alt: string; width?: number; height?: number } = {
    url: showreelPoster.socialImage,
    width: showreelPoster.width,
    height: showreelPoster.height,
    alt: showreelPoster.alt,
  },
): Metadata {
  return {
    title: `${page.title} | ${site.name}`,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_AU",
      url: page.path,
      title: page.title,
      description: page.description,
      images: [image],
    },
    twitter: { card: "summary_large_image" },
  };
}
