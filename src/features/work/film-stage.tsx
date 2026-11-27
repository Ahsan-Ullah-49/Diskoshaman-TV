"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FocusFrame } from "@/components/cinema/focus-frame";
import { projectCategories } from "@/content/project-categories";
import type { Project } from "@/content/projects";
import { FeaturedPosterMotion } from "./featured-poster-motion";
import { WatchDialog } from "./watch-dialog";
import styles from "./film-stage.module.css";

export function FilmStage({
  films,
  scrollReveal = false,
  priority = false,
}: {
  films: readonly [Project, ...Project[]];
  scrollReveal?: boolean;
  priority?: boolean;
}) {
  const [selection, setSelection] = useState(0);
  const [watching, setWatching] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const project = films[selection];
  const FilmTitle = scrollReveal ? "h3" : "h2";
  const left = films[(selection + 1) % films.length];
  const right = films[(selection + films.length - 1) % films.length];

  return (
    <div
      className={styles.gallery}
      ref={frame}
      data-film-stage
      data-screening={priority || undefined}
    >
      {scrollReveal && <FeaturedPosterMotion section={frame} />}
      <div className={styles.stage}>
        <div className={styles.spill} aria-hidden="true" />
        <div className={styles.sideLeft} data-film-side aria-hidden="true">
          <Image
            src={left.poster}
            alt=""
            fill
            sizes="(min-width: 60rem) 25vw, 22vw"
          />
        </div>
        <div className={styles.sideRight} data-film-side aria-hidden="true">
          <Image
            src={right.poster}
            alt=""
            fill
            sizes="(min-width: 60rem) 25vw, 22vw"
          />
        </div>
        <div className={styles.screen} data-film-screen>
          <FocusFrame className={styles.focus}>
            <div className={styles.exposure} data-portrait={project.portrait}>
              <Image
                key={project.slug}
                className={styles.still}
                src={project.poster}
                alt=""
                fill
                sizes="(min-width: 90rem) 960px, (min-width: 52rem) 68vw, 92vw"
                fetchPriority={priority && selection === 0 ? "high" : undefined}
                loading={priority || selection !== 0 ? "eager" : undefined}
              />
              <div className={styles.frameCorners} aria-hidden="true" />
              <div className={styles.caption} aria-live="polite">
                <div>
                  <p>{projectCategories[project.category]}</p>
                  <FilmTitle>{project.title}</FilmTitle>
                </div>
                <button
                  type="button"
                  className={styles.play}
                  ref={trigger}
                  aria-haspopup="dialog"
                  aria-label={`Watch film: ${project.title}`}
                  onClick={() => setWatching(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 5.5v13l10-6.5z" />
                  </svg>
                  <span>Watch film</span>
                </button>
              </div>
            </div>
          </FocusFrame>
        </div>
      </div>
      <div className={styles.strip} role="group" aria-label="Featured films">
        {films.map((film, index) => (
          <button
            key={film.slug}
            type="button"
            aria-pressed={index === selection}
            onClick={() => setSelection(index)}
          >
            <span className={styles.selectionStill}>
              <Image src={film.poster} alt="" fill sizes="72px" />
            </span>
            <span className={styles.stripName}>{film.title}</span>
          </button>
        ))}
      </div>
      {watching && (
        <WatchDialog
          key={project.slug}
          project={project}
          onClose={() => {
            setWatching(false);
            trigger.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}
