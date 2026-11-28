import { FlipTitle } from "@/components/cinema/flip-title";
import { ProjectorDust } from "@/components/cinema/projector-dust";
import { PillLink } from "@/components/pill-link";
import { projects } from "@/content/projects";
import { bookingPath, pages } from "@/content/site";
import { ContentLibrary } from "./content-library";
import { PosterRing } from "./poster-ring";
import styles from "./work.module.css";

// Landscape posters read best on the turning ring; twelve keeps it full.
const ringFilms = projects.filter((project) => !project.portrait).slice(0, 12);

export function WorkPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="work-title">
        <ProjectorDust />
        <div className={`container ${styles.heroCopy}`}>
          <FlipTitle
            as="h1"
            id="work-title"
            label="Portfolio"
            words={["Our", "Work"]}
            size="display"
            align="center"
            oneLine
          />
          <p className={styles.heroLede}>{pages.work.intro}</p>
          <div className={styles.heroActions}>
            <PillLink href="#film-archive" arrow="right">
              Browse the library
            </PillLink>
            <PillLink href={bookingPath} variant="secondary" arrow="right">
              Book a call
            </PillLink>
          </div>
        </div>
        <div className={styles.ring}>
          <PosterRing films={ringFilms} />
          <p className={styles.ringHint} aria-hidden="true">
            Drag to turn · Select a poster to watch
          </p>
        </div>
      </section>

      <section
        className={styles.archive}
        id="film-archive"
        aria-labelledby="portfolio-title"
      >
        <div className="container">
          {/* Heading and line as published on the studio's current site. */}
          <div className={styles.sectionHead}>
            <FlipTitle
              id="portfolio-title"
              label="Every film"
              words={["Content", "Library"]}
              align="center"
              oneLine
            />
            <p className={styles.sectionLine}>
              A curated selection of corporate, commercial, and cinematic work.
            </p>
          </div>
          <ContentLibrary projects={projects} />
        </div>
      </section>
    </>
  );
}
