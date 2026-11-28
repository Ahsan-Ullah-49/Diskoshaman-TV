"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import cinema from "@/components/cinema/cinema.module.css";
import { PillLink } from "@/components/pill-link";
import { useStudioMotion } from "@/components/studio-motion";
import type { HomeScreeningProgram, Project } from "@/content/projects";
import { pages } from "@/content/site";
import { embedUrl, vimeoOrigin } from "@/features/work/vimeo-film";
import { gsap, useGSAP } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import type { ScreeningDeckScene } from "./screening-deck-scene";
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

function ScreeningDeck({
  selection,
  approach,
}: {
  selection: number;
  approach: RefObject<number>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ScreeningDeckScene | null>(null);
  const selected = useRef(selection);

  useEffect(() => {
    selected.current = selection;
  }, [selection]);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    let cancelled = false;
    void import("./screening-deck-scene")
      .then(({ mountScreeningDeck }) => {
        if (cancelled) return;
        scene.current = mountScreeningDeck(surface, () => ({
          selection: selected.current,
          approach: approach.current,
        }));
      })
      .catch(() => {
        // The on-set photograph and the still deck already fill the stage.
      });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, [approach]);

  return <canvas ref={canvas} className={styles.deck} aria-hidden="true" />;
}

const framePositions = ["front", "right", "back", "left"] as const;
const frameTravel = 860;
const motionTiming = { "--frame-travel": `${frameTravel}ms` } as CSSProperties;

export function HomeScreening({ films }: { films: HomeScreeningProgram }) {
  const { enabled } = useStudioMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const aperture = useRef<HTMLDivElement>(null);
  const approach = useRef(1);
  const anchorSettled = useRef(false);
  const visible = useVisible(stage);
  const filmVisible = useVisible(aperture);
  const [selection, setSelection] = useState(0);
  const [seated, setSeated] = useState(true);
  const { project, label } = films[selection];
  const previous = (selection + films.length - 1) % films.length;
  const next = (selection + 1) % films.length;

  function selectFilm(index: number) {
    if (index === selection) return;
    setSeated(false);
    setSelection(index);
  }

  useEffect(() => {
    if (seated) return;
    // Keep the provider window level and wait for the new cover to seat in it.
    const timeout = window.setTimeout(
      () => setSeated(true),
      enabled ? frameTravel : 0,
    );
    return () => window.clearTimeout(timeout);
  }, [enabled, seated, selection]);

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
      // The whole rig tilts on approach so the covers settle upright together.
      gsap.fromTo(
        rig.current,
        { rotationX: 22, rotationY: -42, rotationZ: -6, z: -185, y: 56 },
        {
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          z: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stage.current,
            start: "top bottom",
            end: "top 43%",
            scrub: 0.7,
            onUpdate: ({ progress }) => {
              approach.current = progress;
            },
            onRefresh: ({ progress }) => {
              approach.current = progress;
            },
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
      style={motionTiming}
    >
      <div className={`container ${styles.layout}`}>
        <h2
          id="home-work-title"
          className={`${cinema.heading} ${styles.title}`}
        >
          Selected work
        </h2>

        <div className={styles.installation}>
          <div className={styles.setPhoto} aria-hidden="true">
            <Image
              src="/media/showreel-still.webp"
              alt=""
              sizes="(min-width: 52rem) 63vw, 100vw"
              fill
            />
          </div>
          <div
            id="home-screening"
            className={styles.stage}
            ref={stage}
            role="region"
            aria-label={label}
          >
            <div className={styles.deckStill} aria-hidden="true" />
            {enabled && visible && (
              <ScreeningDeck selection={selection} approach={approach} />
            )}
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
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className={styles.gate}>
                <div className={styles.case}>
                  <div className={styles.screen} ref={aperture}>
                    {filmVisible && (seated || !enabled) && (
                      <InlineScreeningPlayer
                        key={`${project.slug}-${enabled}`}
                        project={project}
                        autoplay={enabled}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={styles.steps}
              role="group"
              aria-label="Browse films"
            >
              <button
                type="button"
                aria-label="Previous film"
                onClick={() => selectFilm(previous)}
              />
              <button
                type="button"
                aria-label="Next film"
                onClick={() => selectFilm(next)}
              />
            </div>
          </div>
        </div>

        <div className={styles.browse}>
          <div
            className={styles.program}
            role="group"
            aria-label="Select a project"
          >
            {films.map((film, index) => (
              <button
                key={film.project.slug}
                type="button"
                aria-pressed={index === selection}
                aria-controls="home-screening"
                onClick={() => selectFilm(index)}
              >
                <span className={styles.thumbnail} aria-hidden="true">
                  <Image src={film.project.poster} alt="" fill sizes="62px" />
                </span>
                <span className={styles.projectText}>
                  <span className={styles.projectName}>{film.label}</span>
                  <span className={styles.category}>{film.category}</span>
                </span>
              </button>
            ))}
          </div>
          <span className="visually-hidden" aria-live="polite">
            {label}
          </span>
          <PillLink href={pages.work.path}>All Films</PillLink>
        </div>
      </div>
    </section>
  );
}
