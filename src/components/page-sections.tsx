import type { ReactNode } from "react";
import cinema from "./cinema/cinema.module.css";
import styles from "./page-sections.module.css";

export function SectionIntro({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.sectionIntro}>
      <h2 className={cinema.heading} id={id}>
        {title}
      </h2>
      {description && <p className={cinema.lede}>{description}</p>}
      {children}
    </div>
  );
}
