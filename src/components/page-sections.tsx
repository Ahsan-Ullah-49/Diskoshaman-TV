import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { bookingPath, pages } from "@/content/site";
import { DiagonalArrow } from "./cinema/diagonal-arrow";
import cinema from "./cinema/cinema.module.css";
import { PillLink } from "./pill-link";
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

export function ContactBand({ title = "Have a project in mind?" }) {
  return (
    <section
      className={`${cinema.litSet} ${styles.contactBand}`}
      aria-labelledby="contact-band-title"
    >
      <Image
        className={styles.bandImage}
        src="/media/showreel-still.webp"
        alt=""
        fill
        sizes="(min-width: 56rem) 64vw, 100vw"
      />
      <div className={`container ${styles.contactInner}`}>
        <h2 className={cinema.heading} id="contact-band-title">
          {title}
        </h2>
        <p className={cinema.lede}>
          Tell us what you want to make in a 20-minute discovery call.
        </p>
        <div className={styles.actions}>
          <PillLink href={bookingPath}>Book a call</PillLink>
          <Link
            href={`${pages.contact.path}#enquiry`}
            className={cinema.lineLink}
          >
            Send an enquiry <DiagonalArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
