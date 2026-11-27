"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import {
  projectCategories,
  type ProjectCategory,
} from "@/content/project-categories";
import type { Project } from "@/content/projects";
import { WatchDialog } from "./watch-dialog";
import styles from "./work.module.css";

type OpenProject = (
  event: MouseEvent<HTMLButtonElement>,
  project: Project,
) => void;

function ProjectCard({
  project,
  onWatch,
}: {
  project: Project;
  onWatch: OpenProject;
}) {
  return (
    <article
      className={styles.card}
      id={project.slug}
      data-portrait={project.portrait}
      data-reveal
    >
      <div className={styles.cardMedia}>
        <Image
          className={styles.poster}
          src={project.poster}
          alt=""
          fill
          sizes="(min-width: 72rem) 54vw, (min-width: 44rem) 51vw, 92vw"
        />
        <span className={styles.playIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 5.5v13l10-6.5z" />
          </svg>
        </span>
      </div>
      <div className={styles.cardTitle}>
        <div>
          <p className={styles.category}>
            {projectCategories[project.category]}
          </p>
          <h3>
            <button
              type="button"
              className={styles.watchLink}
              onClick={(event) => onWatch(event, project)}
              aria-haspopup="dialog"
              aria-label={`Watch ${project.title}`}
            >
              {project.title}
            </button>
          </h3>
        </div>
        <DiagonalArrow />
      </div>
    </article>
  );
}

const categories: ProjectCategory[] = [
  "corporate",
  "brand",
  "interview",
  "documentary",
];
const archivePreviewSize = 8;

export function WorkCollection({
  projects,
  filters = false,
}: {
  projects: Project[];
  filters?: boolean;
}) {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [active, setActive] = useState<Project | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const visibleProjects =
    category === "all"
      ? projects
      : projects.filter((project) => project.category === category);
  const firstFilms = filters
    ? visibleProjects.slice(0, archivePreviewSize)
    : visibleProjects;
  const remaining = visibleProjects.length - firstFilms.length;

  // Films open in the on-site player; there is no off-site link to fall back to.
  function openProject(event: MouseEvent<HTMLButtonElement>, project: Project) {
    opener.current = event.currentTarget;
    setActive(project);
  }

  function closeProject() {
    setActive(null);
    opener.current?.focus({ preventScroll: true });
  }

  return (
    <>
      {filters && (
        <div className={styles.controls}>
          <div role="group" aria-label="Filter portfolio">
            <button
              type="button"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              All films
            </button>
            {categories.map((key) => (
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
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? "film" : "films"}
          </p>
        </div>
      )}
      <div className={styles.grid} data-archive={filters || undefined}>
        {firstFilms.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onWatch={openProject}
          />
        ))}
      </div>
      {remaining > 0 && (
        <details className={styles.more} key={category}>
          <summary>
            <span className={styles.showMore}>
              Show {remaining} more {remaining === 1 ? "film" : "films"}
            </span>
            <span className={styles.showLess}>Hide additional films</span>
            <span className={styles.moreIcon} aria-hidden="true" />
          </summary>
          <div className={styles.grid} data-archive>
            {visibleProjects.slice(archivePreviewSize).map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                onWatch={openProject}
              />
            ))}
          </div>
        </details>
      )}
      {active && (
        <WatchDialog
          key={active.slug}
          project={active}
          onClose={closeProject}
        />
      )}
    </>
  );
}
