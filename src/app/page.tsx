import { HomeContent } from "@/components/home/home-content";
import { StudioHero } from "@/components/home/studio-hero";
import { StudioStory } from "@/components/home/studio-story";
import { pages, site } from "@/content/site";
import { absoluteUrl, pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(pages.home);

const studioSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#studio"),
      name: site.name,
      url: site.url,
      logo: absoluteUrl("/brand/studio-logo.png"),
      email: site.email,
      areaServed: { "@type": "Country", name: "Australia" },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: site.name,
      url: site.url,
      inLanguage: "en-AU",
      publisher: { "@id": absoluteUrl("/#studio") },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(studioSchema).replace(/</g, "\\u003c"),
        }}
      />
      <StudioHero />
      <StudioStory />
      <HomeContent />
    </>
  );
}
