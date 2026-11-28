import cinema from "@/components/cinema/cinema.module.css";
import { BrandReel } from "./brand-reel";
import styles from "./brand-logo-section.module.css";

export function BrandLogoSection() {
  return (
    <BrandReel>
      <div className={styles.heading}>
        <h2
          id="brand-logos-title"
          className={`${cinema.display} ${styles.title}`}
        >
          <span>Brands &amp;</span> <span>collaborators</span>
        </h2>
        {/* The line the studio's current site uses for this section. */}
        <p className={styles.subheading}>
          Trusted by world-class brands and organizations of all sizes.
        </p>
      </div>
    </BrandReel>
  );
}
