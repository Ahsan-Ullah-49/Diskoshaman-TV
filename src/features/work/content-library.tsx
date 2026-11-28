"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/cinema/scroll-reveal";
import {
  libraryCategories,
  projectCategories,
  type ProjectCategory,
} from "@/content/project-categories";
import type { Project } from "@/content/projects";
import { AutoplayFilm } from "./autoplay-film";
import styles from "./content-library.module.css";

const landscapeSizes = "(min-width: 44rem) 46vw, 92vw";
const portraitSizes = "(min-width: 64rem) 22vw, (min-width: 44rem) 30vw, 80vw";

/**
 * Films in frames: landscape films two across from tablets, portrait films
 * three or four across, and one per row on phones. Captions show each film's
 * format, such as "Short documentary", never its title.
 */
export function FilmGrid({
  films,
  captions = false,
}: {
  films: Project[];
  captions?: boolean;
}) {
  const landscape = films.filter((film) => !film.portrait);
  const portrait = films.filter((film) => film.portrait);
  const captionFor = (film: Project) =>
    captions ? (film.credit ?? projectCategories[film.category]) : undefined;

  return (
    <>
      {landscape.length > 0 && (
        <ScrollReveal className={styles.landscape}>
          {landscape.map((film) => (
            <AutoplayFilm
              key={film.slug}
              project={film}
              caption={captionFor(film)}
              sizes={landscapeSizes}
            />
          ))}
        </ScrollReveal>
      )}
      {portrait.length > 0 && (
        <ScrollReveal className={styles.portrait}>
          {portrait.map((film) => (
            <AutoplayFilm
              key={film.slug}
              project={film}
              caption={captionFor(film)}
              sizes={portraitSizes}
            />
          ))}
        </ScrollReveal>
      )}
    </>
  );
}

function LibraryGroup({
  heading,
  films,
}: {
  heading: string;
  films: Project[];
}) {
  const headingId = `library-${heading.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <header className={styles.groupHead}>
        <h3 id={headingId}>{heading}</h3>
        <span className={styles.groupCount} aria-hidden="true">
          {String(films.length).padStart(2, "0")}
        </span>
      </header>
      <FilmGrid films={films} />
    </section>
  );
}

/**
 * Every film, grouped under the published library headings. All films shows
 * each category with its heading; a filter shows that one category. Films
 * play muted in their frames, with no captions under them.
 */
export function ContentLibrary({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const groups = libraryCategories
    .filter(({ key }) => category === "all" || key === category)
    .map(({ key, heading }) => ({
      key,
      heading,
      films: projects.filter((project) => project.category === key),
    }))
    .filter(({ films }) => films.length > 0);
  const filmCount = groups.reduce(
    (total, { films }) => total + films.length,
    0,
  );

  return (
    <>
      <div className={styles.controls}>
        <div role="group" aria-label="Filter the library">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            All films
          </button>
          {libraryCategories.map(({ key }) => (
            <button
              type="button"
              key={key}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {projectCategories[key]}
            </button>
          ))}
        </div>
        <p role="status" className={styles.count}>
          {filmCount} {filmCount === 1 ? "film" : "films"}
        </p>
      </div>
      <div className={styles.groups}>
        {groups.map(({ key, heading, films }) => (
          <LibraryGroup key={key} heading={heading} films={films} />
        ))}
      </div>
    </>
  );
}
