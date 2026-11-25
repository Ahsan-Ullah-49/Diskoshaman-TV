import { StudioHero } from "@/components/home/studio-hero";
import Link from "next/link";
import { pages, site } from "@/content/site";
import { absoluteUrl, pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

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
      <section className={styles.browse} aria-labelledby="browse-title">
        <div className="container">
          <h2 id="browse-title">Explore the studio</h2>
          <ul className="page-links">
            <li>
              <Link href={pages.work.path}>
                Production portfolio <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href={pages.services.path}>
                Videography, photography and editing{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
