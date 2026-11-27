import Image from "next/image";
import cinema from "@/components/cinema/cinema.module.css";
import { brandLogoSource, brandLogos } from "@/content/brand-logos";
import { BrandReel } from "./brand-reel";
import styles from "./brand-logo-section.module.css";

export function BrandLogoSection() {
  return (
    <section
      className={`${cinema.litSet} ${styles.section}`}
      id="brands"
      aria-labelledby="brand-logos-title"
    >
      <div className={`container ${styles.layout}`}>
        <h2
          id="brand-logos-title"
          className={`${cinema.display} ${styles.title}`}
        >
          <span>Brands &amp;</span> <span>collaborators</span>
        </h2>
        <BrandReel />
        <details className={styles.archive}>
          <summary>See all {brandLogos.length} logos</summary>
          <ul className={styles.archiveGrid} role="list">
            {brandLogos.map((logo) => (
              <li
                key={logo.slug}
                className={styles.matte}
                data-dark={logo.darkBackground}
              >
                <Image
                  src={brandLogoSource(logo)}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  unoptimized
                />
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
