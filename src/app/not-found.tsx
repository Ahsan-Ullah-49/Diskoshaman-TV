import Image from "next/image";
import Link from "next/link";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import cinema from "@/components/cinema/cinema.module.css";
import { PillLink } from "@/components/pill-link";
import { pages } from "@/content/site";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <section className={`${cinema.litSet} ${styles.scene}`}>
      <Image
        className={styles.picture}
        src="/media/studio/on-set.webp"
        alt=""
        fill
        sizes="100vw"
      />
      <div className={`container ${styles.content}`}>
        <h1 className={cinema.display}>Page not found</h1>
        <p className={cinema.lede}>The link may have changed.</p>
        <div>
          <PillLink href="/" arrow="right">
            Back to home
          </PillLink>
          <Link href={pages.work.path} className={cinema.lineLink}>
            Browse the films <DiagonalArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
