import { FlipTitle } from "@/components/cinema/flip-title";
import { ProjectorDust } from "@/components/cinema/projector-dust";
import { ScrollReveal } from "@/components/cinema/scroll-reveal";
import { PillLink } from "@/components/pill-link";
import { createFilmSelection, projects } from "@/content/projects";
import { bookingPath, pages } from "@/content/site";
import { FilmStage } from "./film-stage";
import { PosterRing } from "./poster-ring";
import { WorkCollection } from "./work-collection";
import styles from "./work.module.css";

const screening = createFilmSelection(
  "birth-of-the-automobile",
  "the-orient",
  "rio-tinto",
  "beast-philanthropy",
);

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
              Browse the archive
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

      <section className={styles.featured} aria-labelledby="featured-title">
        <div className="container">
          <div className={styles.sectionHead}>
            <FlipTitle
              id="featured-title"
              label="Now screening"
              words={["Featured", "films"]}
            />
          </div>
          <FilmStage films={screening} />
        </div>
      </section>

      <section
        className={styles.archive}
        id="film-archive"
        aria-labelledby="portfolio-title"
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <FlipTitle
              id="portfolio-title"
              label="Every film"
              words={["Film", "archive"]}
            />
          </div>
          <ScrollReveal>
            <WorkCollection projects={projects} filters />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
