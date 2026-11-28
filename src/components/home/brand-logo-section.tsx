import cinema from "@/components/cinema/cinema.module.css";
import { BrandReel } from "./brand-reel";
import styles from "./brand-logo-section.module.css";

export function BrandLogoSection() {
  return (
    <BrandReel>
      <h2
        id="brand-logos-title"
        className={`${cinema.display} ${styles.title}`}
      >
        <span>Brands &amp;</span> <span>collaborators</span>
      </h2>
    </BrandReel>
  );
}
