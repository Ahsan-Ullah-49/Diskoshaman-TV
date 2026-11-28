"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import type { Project } from "@/content/projects";
import {
  commandVimeo,
  embedUrl,
  readVimeoMessage,
  vimeoOrigin,
} from "./vimeo-film";
import styles from "./autoplay-film.module.css";

type AutoplayFilmProps = {
  project: Project;
  /** Short format label shown under the frame, such as "Documentary". */
  caption?: string;
  sizes: string;
};

/*
 * Players load three at a time, in the order their frames come near, and a
 * film the visitor pressed play on goes first. A screen of frames otherwise
 * starts a burst of Vimeo players together, which stalls slower phones and
 * laptops before any of them can play.
 */
const loadLimit = 3;
let loading = 0;
const waiting: { grant: () => void; urgent: boolean }[] = [];

function startNext() {
  while (loading < loadLimit && waiting.length) {
    const index = waiting.findIndex((entry) => entry.urgent);
    const [next] = waiting.splice(index < 0 ? 0 : index, 1);
    next.grant();
  }
}

/**
 * Queue a player load. `start` runs when a slot is free. The returned
 * handle moves the load to the front or releases the slot; releasing twice
 * is safe.
 */
function queueLoad(start: () => void) {
  let state: "waiting" | "loading" | "done" = "waiting";
  const entry = {
    urgent: false,
    grant: () => {
      state = "loading";
      loading += 1;
      start();
    },
  };
  waiting.push(entry);
  startNext();
  return {
    hurry() {
      entry.urgent = true;
      startNext();
    },
    release() {
      if (state === "loading") {
        loading -= 1;
        startNext();
      } else if (state === "waiting") {
        waiting.splice(waiting.indexOf(entry), 1);
      }
      state = "done";
    },
  };
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Films follow the visitor's system motion setting only. The site's own
 * motion pause is for decorative movement; the library autoplays like the
 * studio's current site.
 */
function usePrefersStill() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

/**
 * A film that plays muted and on a loop inside its own frame, like the
 * studio's published content library. Players start loading well before
 * their frame scrolls into view, in the order they come near, and once
 * playing they keep playing wherever the visitor scrolls. The poster shows
 * until the player is ready. With reduced motion the poster stays until the visitor presses
 * play, and the film then plays with sound in the same frame.
 */
export function AutoplayFilm({ project, caption, sizes }: AutoplayFilmProps) {
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const load = useRef<ReturnType<typeof queueLoad> | null>(null);
  const [near, setNear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);
  const prefersStill = usePrefersStill();
  const autoplay = !prefersStill;

  // Start loading about one and a half screens ahead of the frame.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "150% 0px" },
    );
    nearby.observe(element);
    return () => nearby.disconnect();
  }, []);

  // Once mounted, a player stays for the visit so it keeps playing.
  useEffect(() => {
    if (!(chosen || (autoplay && near))) return;
    let timer = 0;
    const queued = queueLoad(() => {
      setMounted(true);
      // Give the slot back if a player is slow, so the next one can start.
      timer = window.setTimeout(() => queued.release(), 9000);
    });
    load.current = queued;
    if (chosen) queued.hurry();
    return () => {
      window.clearTimeout(timer);
      queued.release();
    };
  }, [autoplay, near, chosen]);

  // Show the player once Vimeo says it is ready. A frame that cannot run the
  // player (blocked or offline) keeps its poster instead of going blank.
  useEffect(() => {
    if (!mounted) return;
    function receive(event: MessageEvent) {
      if (
        event.origin !== vimeoOrigin ||
        event.source !== player.current?.contentWindow
      ) {
        return;
      }
      const message = readVimeoMessage(event.data);
      if (message?.event === "ready" || message?.method === "ping") {
        setReady(true);
        load.current?.release();
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [mounted]);

  useEffect(() => {
    if (!ready || chosen) return;
    // Some browsers hold back autoplay until asked again once the player is ready.
    commandVimeo(player.current, "setMuted", true);
    commandVimeo(player.current, "play");
  }, [ready, chosen]);

  function loaded() {
    commandVimeo(player.current, "ping");
    // In case the ready message is missed, show the player a little later.
    window.setTimeout(() => {
      setReady(true);
      load.current?.release();
    }, 5000);
  }

  // A tap on a frame that is still waiting loads its player straight away.
  function startNow() {
    if (ready || !autoplay) return;
    setNear(true);
    load.current?.hurry();
  }

  return (
    <figure
      className={styles.film}
      data-portrait={project.portrait ?? false}
      style={
        { "--film-aspect": project.portrait ? 0.5625 : 1.7778 } as CSSProperties
      }
      data-reveal
    >
      <div ref={frame} className={styles.frame} data-ready={ready}>
        <div className={styles.screen} onClick={startNow}>
          <Image
            className={styles.poster}
            src={project.poster}
            alt=""
            fill
            sizes={sizes}
          />
          {mounted && (
            <iframe
              ref={player}
              className={styles.player}
              src={embedUrl(project, {
                autoplay: true,
                muted: !chosen,
                loop: true,
                playAlongside: true,
              })}
              title={project.title}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              onLoad={loaded}
            />
          )}
          {!autoplay && !chosen && (
            <button
              type="button"
              className={styles.play}
              onClick={() => setChosen(true)}
              aria-label={`Play ${project.title}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 5.5v13l10-6.5z" />
              </svg>
            </button>
          )}
        </div>
        <span className={styles.corners} aria-hidden="true" />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
