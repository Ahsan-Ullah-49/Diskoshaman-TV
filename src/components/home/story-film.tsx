"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useVisible } from "@/lib/use-visible";
import { useStudioMotion } from "../studio-motion";
import styles from "./story.module.css";

const vimeoOrigin = "https://player.vimeo.com";

type StoryFilmDetails = {
  title: string;
  vimeoId: string;
  vimeoHash: string;
};

function readPlayerMessage(data: unknown) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data && typeof data === "object" ? data : null;
}

function VimeoStoryPlayer({
  title,
  source,
  focusOnReady,
  onRetry,
}: {
  title: string;
  source: string;
  focusOnReady: boolean;
  onRetry: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  function pingPlayer() {
    frame.current?.contentWindow?.postMessage({ method: "ping" }, vimeoOrigin);
  }

  useEffect(() => {
    // A cross-origin iframe's load event can also fire on an error page.
    const timeout = window.setTimeout(() => setStatus("unavailable"), 12000);
    function receiveMessage(event: MessageEvent) {
      if (
        event.origin !== vimeoOrigin ||
        event.source !== frame.current?.contentWindow
      )
        return;

      const message = readPlayerMessage(event.data);
      if (!message) return;
      if (
        ("event" in message && message.event === "ready") ||
        ("method" in message && message.method === "ping")
      ) {
        window.clearTimeout(timeout);
        setStatus("ready");
      } else if ("event" in message && message.event === "error") {
        window.clearTimeout(timeout);
        setStatus("unavailable");
      }
    }

    window.addEventListener("message", receiveMessage);
    pingPlayer();
    return () => {
      window.removeEventListener("message", receiveMessage);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (
      status === "ready" &&
      focusOnReady &&
      document.activeElement === document.body
    ) {
      frame.current?.focus({ preventScroll: true });
    }
  }, [status, focusOnReady]);

  return (
    <>
      <iframe
        ref={frame}
        className={styles.player}
        data-ready={status === "ready" || undefined}
        src={source}
        title={title}
        width={360}
        height={640}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        tabIndex={status === "ready" ? undefined : -1}
        onLoad={pingPlayer}
        onError={() => setStatus("unavailable")}
      />
      {status !== "ready" && (
        <div className={styles.cover}>
          <p role="status">
            {status === "loading"
              ? "Loading the story…"
              : "The player couldn’t load the story."}
          </p>
          {/* Films always play here on the site, so recovery reloads the player instead of leaving. */}
          {status === "unavailable" && (
            <button type="button" className={styles.retry} onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function StoryFilm({ film }: { film: StoryFilmDetails }) {
  const screen = useRef<HTMLDivElement>(null);
  const { enabled } = useStudioMotion();
  const visible = useVisible(screen);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const showPlayer = visible && (enabled || requested);
  const params = new URLSearchParams({
    h: film.vimeoHash,
    autoplay: "1",
    muted: requested ? "0" : "1",
    loop: requested ? "0" : "1",
    playsinline: "1",
    dnt: "1",
    color: "cc9828",
    title: "0",
    byline: "0",
    portrait: "0",
    // Hidden on Vimeo plans that allow it, so the player keeps viewers here.
    vimeo_logo: "0",
  });

  return (
    <figure className={styles.film} aria-label={film.title}>
      <div ref={screen} className={styles.screen}>
        <Image
          src="/media/story-poster.webp"
          alt=""
          className={styles.poster}
          fill
          sizes="(min-width: 48rem) 320px, (min-width: 26rem) 296px, 75vw"
        />
        {showPlayer ? (
          <VimeoStoryPlayer
            key={attempt}
            title={film.title}
            source={`${vimeoOrigin}/video/${film.vimeoId}?${params}`}
            focusOnReady={requested}
            onRetry={() => {
              setRequested(true);
              setAttempt((value) => value + 1);
            }}
          />
        ) : (
          <div className={styles.cover}>
            <button
              type="button"
              className={styles.play}
              onClick={() => setRequested(true)}
            >
              <span className={styles.playIcon} aria-hidden="true" />
              Watch the story
            </button>
          </div>
        )}
      </div>
    </figure>
  );
}
