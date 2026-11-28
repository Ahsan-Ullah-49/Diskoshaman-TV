"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
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
 * Players load two at a time. A screen of frames otherwise starts a burst of
 * Vimeo players together, which stalls slower phones and laptops.
 */
const loadLimit = 2;
let loading = 0;
const waiting: (() => void)[] = [];

/** Run `start` when a loading slot is free. The returned release is safe to call twice. */
function requestLoad(start: () => void) {
  let granted = false;
  let done = false;
  const grant = () => {
    granted = true;
    loading += 1;
    start();
  };
  if (loading < loadLimit) grant();
  else waiting.push(grant);
  return () => {
    if (done) return;
    done = true;
    if (granted) {
      loading -= 1;
      waiting.shift()?.();
    } else {
      waiting.splice(waiting.indexOf(grant), 1);
    }
  };
}

/**
 * A film that plays muted inside its own frame, like the studio's published
 * content library. The Vimeo player mounts only when the frame comes near the
 * viewport and is removed again once it is well out of view, so a long
 * library never runs dozens of players at once. On screen it plays; just off
 * screen it pauses. The poster stays until Vimeo reports its player ready,
 * so a blocked or failed player never leaves an empty frame. With motion off
 * the poster stays until the visitor presses play, and the film then plays
 * with sound in the same frame.
 */
export function AutoplayFilm({ project, caption, sizes }: AutoplayFilmProps) {
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const releaseLoad = useRef(() => {});
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);
  const { enabled } = useStudioMotion();
  const wanted = chosen || (enabled && near);
  const mounted = wanted && allowed;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    // Mount a little before the frame arrives so the film is already moving.
    const nearby = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "40% 0px" },
    );
    const visible = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    );
    nearby.observe(element);
    visible.observe(element);
    return () => {
      nearby.disconnect();
      visible.disconnect();
    };
  }, []);

  // Wait for a loading slot while the player is wanted. The slot is given
  // back once the player is ready, is removed, or has had time to load.
  useEffect(() => {
    if (!wanted) return;
    let timer = 0;
    const release = requestLoad(() => {
      setAllowed(true);
      timer = window.setTimeout(() => release(), 12000);
    });
    releaseLoad.current = release;
    return () => {
      window.clearTimeout(timer);
      release();
      setAllowed(false);
    };
  }, [wanted]);

  // A removed player starts again from its poster next time.
  const [wasMounted, setWasMounted] = useState(mounted);
  if (mounted !== wasMounted) {
    setWasMounted(mounted);
    if (!mounted) setReady(false);
  }

  // Vimeo can load an error document in the frame, so wait for the player itself.
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
        releaseLoad.current();
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [mounted]);

  useEffect(() => {
    if (!ready || chosen) return;
    if (onScreen) commandVimeo(player.current, "setMuted", true);
    commandVimeo(player.current, onScreen ? "play" : "pause");
  }, [onScreen, ready, chosen]);

  return (
    <figure
      className={styles.film}
      data-portrait={project.portrait ?? false}
      data-reveal
    >
      <div ref={frame} className={styles.frame} data-ready={ready}>
        <div className={styles.screen}>
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
                title: true,
              })}
              title={project.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => commandVimeo(player.current, "ping")}
            />
          )}
          {!wanted && !enabled && (
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
