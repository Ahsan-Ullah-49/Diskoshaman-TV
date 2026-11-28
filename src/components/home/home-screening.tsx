"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import cinema from "@/components/cinema/cinema.module.css";
import { useStudioMotion } from "@/components/studio-motion";
import type { HomeScreeningProgram, Project } from "@/content/projects";
import { pages } from "@/content/site";
import { embedUrl, vimeoOrigin } from "@/features/work/vimeo-film";
import { gsap, useGSAP } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./home-screening.module.css";

type PlayerMessage = {
  event?: string;
  method?: string;
  data?: { name?: string };
};

function readMessage(value: unknown): PlayerMessage | null {
  try {
    const message: unknown =
      typeof value === "string" ? JSON.parse(value) : value;
    return message && typeof message === "object"
      ? (message as PlayerMessage)
      : null;
  } catch {
    return null;
  }
}

function InlineScreeningPlayer({
  project,
  autoplay,
}: {
  project: Project;
  autoplay: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  function ping() {
    frame.current?.contentWindow?.postMessage({ method: "ping" }, vimeoOrigin);
  }

  useEffect(() => {
    // Vimeo can load an error document in the iframe. Wait for the player itself.
    const timeout = window.setTimeout(() => setStatus("error"), 12000);
    let ready = false;
    function receive(event: MessageEvent) {
      if (
        event.origin !== vimeoOrigin ||
        event.source !== frame.current?.contentWindow
      ) {
        return;
      }
      const message = readMessage(event.data);
      if (message?.event === "ready" || message?.method === "ping") {
        if (ready) return;
        ready = true;
        window.clearTimeout(timeout);
        setStatus("ready");
        frame.current?.contentWindow?.postMessage(
          { method: "addEventListener", value: "error" },
          vimeoOrigin,
        );
      } else if (
        message?.event === "error" &&
        message.data?.name !== "NotAllowedError"
      ) {
        window.clearTimeout(timeout);
        setStatus("error");
      }
    }
    window.addEventListener("message", receive);
    ping();
    return () => {
      window.removeEventListener("message", receive);
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  useEffect(() => {
    if (!autoplay || status !== "ready") return;
    // Start once the provider frame is visible and its muted player is ready.
    const tick = requestAnimationFrame(() => {
      const player = frame.current?.contentWindow;
      player?.postMessage({ method: "setMuted", value: true }, vimeoOrigin);
      player?.postMessage({ method: "play" }, vimeoOrigin);
    });
    return () => cancelAnimationFrame(tick);
  }, [autoplay, status]);

  useEffect(() => {
    if (
      attempt > 0 &&
      status === "ready" &&
      document.activeElement === document.body
    ) {
      frame.current?.focus({ preventScroll: true });
    }
  }, [attempt, status]);

  if (status === "error") {
    return (
      <div className={styles.recovery}>
        <p role="status">The film couldn’t load.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setAttempt((previous) => previous + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <iframe
      key={attempt}
      ref={frame}
      className={styles.player}
      data-ready={status === "ready" || undefined}
      src={embedUrl(project, { autoplay, muted: autoplay })}
      title={project.title}
      width={960}
      height={540}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      tabIndex={status === "ready" ? undefined : -1}
      onLoad={ping}
      onError={() => setStatus("error")}
    />
  );
}

function runningTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const framePositions = ["front", "right", "back", "left"] as const;

export function HomeScreening({ films }: { films: HomeScreeningProgram }) {
  const { enabled } = useStudioMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const anchorSettled = useRef(false);
  const visible = useVisible(stage);
  const [selection, setSelection] = useState(0);
  const { project, label, seconds } = films[selection];
  const previous = (selection + films.length - 1) % films.length;
  const next = (selection + 1) % films.length;

  useEffect(() => {
    if (
      !enabled ||
      anchorSettled.current ||
      window.location.hash !== "#selected-work"
    )
      return;
    // The brand reel above reserves its scroll distance after hydration.
    const frame = requestAnimationFrame(() => {
      anchorSettled.current = true;
      const target = section.current;
      if (
        target &&
        target.getBoundingClientRect().top > window.innerHeight / 2
      ) {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  useGSAP(
    () => {
      if (!enabled || !stage.current || !rig.current) return;
      // Scroll sets the camera angle. The film carriers rotate independently.
      gsap.fromTo(
        rig.current,
        { rotationX: 12, rotationY: -25, z: -130, y: 42 },
        {
          rotationX: 0,
          rotationY: 0,
          z: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stage.current,
            start: "top bottom",
            end: "top 39%",
            scrub: 0.75,
          },
        },
      );
    },
    { scope: stage, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <section
      id="selected-work"
      ref={section}
      className={`${cinema.litSet} ${styles.room}`}
      aria-labelledby="home-work-title"
      data-screen-motion={enabled || undefined}
    >
      <div className={`container ${styles.layout}`}>
        <div className={styles.index}>
          <h2
            id="home-work-title"
            className={`${cinema.heading} ${styles.title}`}
          >
            Selected <span>work</span>
          </h2>

          <div className={styles.browse}>
            <div
              className={styles.program}
              role="group"
              aria-label="Film categories"
            >
              {films.map((film, index) => (
                <button
                  key={film.project.slug}
                  type="button"
                  aria-pressed={index === selection}
                  aria-controls="home-screening"
                  onClick={() => setSelection(index)}
                >
                  {film.category}
                </button>
              ))}
            </div>
            <Link href={pages.work.path} className={cinema.lineLink}>
              All films <DiagonalArrow />
            </Link>
          </div>
        </div>

        <figure className={styles.installation} data-film={project.slug}>
          <div
            id="home-screening"
            className={styles.stage}
            ref={stage}
            role="region"
            aria-label={label}
            data-screen-visible={visible || undefined}
          >
            <div className={styles.spill} aria-hidden="true" />
            <div className={styles.platform} aria-hidden="true" />
            <div className={styles.rig} ref={rig}>
              {films.map((film, index) => {
                const position =
                  framePositions[
                    (index - selection + films.length) % films.length
                  ];
                return (
                  <div
                    key={film.project.slug}
                    className={styles.carrier}
                    data-frame-position={position}
                  >
                    <div className={styles.case}>
                      <div className={styles.screen}>
                        <Image
                          className={styles.poster}
                          src={film.project.poster}
                          alt=""
                          fill
                          sizes="(min-width: 84rem) 580px, (min-width: 52rem) 47vw, 76vw"
                        />
                        {position === "front" && visible && (
                          <InlineScreeningPlayer
                            key={String(enabled)}
                            project={film.project}
                            autoplay={enabled}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className={styles.steps}
              role="group"
              aria-label="Browse films"
            >
              <button
                type="button"
                aria-label="Previous film"
                onClick={() => setSelection(previous)}
              />
              <button
                type="button"
                aria-label="Next film"
                onClick={() => setSelection(next)}
              />
            </div>
          </div>
          <figcaption className={styles.caption} aria-live="polite">
            <span key={project.slug}>{label}</span>
            <time dateTime={`PT${seconds}S`}>{runningTime(seconds)}</time>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
