"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import type { ServiceMediaDetails } from "@/content/service-details";
import { useVisible } from "@/lib/use-visible";
import styles from "./services.module.css";

function FrameSequence({
  frames,
  playing,
}: {
  frames: ServiceMediaDetails["frames"];
  playing: boolean;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(
      () => setFrame((index) => (index + 1) % frames.length),
      3400,
    );
    return () => window.clearInterval(interval);
  }, [playing, frames.length]);

  return (
    <Image
      key={frame}
      className={styles.mediaImage}
      src={frames[frame].src}
      alt={frames[frame].alt}
      fill
      sizes="(min-width: 52rem) 50vw, 92vw"
      data-frame={frame > 0 || undefined}
    />
  );
}

function Clip({ src, playing }: { src: string; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "loading" | "playing" | "paused" | "error"
  >("loading");

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) {
      let cancelled = false;
      void element.play().catch(() => {
        if (!cancelled)
          setStatus((current) => (current === "error" ? current : "paused"));
      });
      return () => {
        cancelled = true;
        element.pause();
      };
    }
  }, [playing]);

  return (
    <>
      <video
        ref={video}
        src={src}
        preload="none"
        muted
        playsInline
        loop
        width={720}
        height={404}
        className={styles.video}
        data-ready={status === "playing"}
        onPlaying={() => setStatus("playing")}
        onError={() => setStatus("error")}
        aria-hidden="true"
      />
      {status === "error" && (
        <p className={styles.mediaNotice} role="status">
          Video unavailable. Film frames are available.
        </p>
      )}
      {status === "paused" && playing && (
        <button
          type="button"
          className={styles.mediaNotice}
          onClick={() =>
            void video.current?.play().catch(() => setStatus("error"))
          }
        >
          Play clip
        </button>
      )}
    </>
  );
}

export function ServiceMedia({
  title,
  media,
}: {
  title: string;
  media: ServiceMediaDetails;
}) {
  const screen = useRef<HTMLDivElement>(null);
  const visible = useVisible(screen);
  const { enabled } = useStudioMotion();
  const [view, setView] = useState<"clip" | "frames">(
    media.clip ? "clip" : "frames",
  );
  const [paused, setPaused] = useState(false);
  const playing = enabled && visible && !paused;

  return (
    <figure className={styles.media} aria-label={`${title} example`}>
      <div className={styles.screen} data-framing={media.framing} ref={screen}>
        <FrameSequence
          frames={media.frames}
          playing={playing && view === "frames"}
        />
        {view === "clip" && media.clip && visible && enabled && (
          <Clip src={media.clip} playing={playing} />
        )}
        {enabled && (
          <button
            type="button"
            className={styles.motionControl}
            onClick={() => setPaused((value) => !value)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d={paused ? "m8 5 11 7-11 7z" : "M7 5h3v14H7zm7 0h3v14h-3z"}
              />
            </svg>
            {paused ? "Play preview" : "Pause preview"}
          </button>
        )}
      </div>
      {media.clip && (
        <div
          className={styles.treatments}
          role="group"
          aria-label="Compare service treatments"
        >
          <button
            type="button"
            aria-pressed={view === "clip"}
            onClick={() => setView("clip")}
          >
            Video excerpt
          </button>
          <button
            type="button"
            aria-pressed={view === "frames"}
            onClick={() => setView("frames")}
          >
            Film frames
          </button>
        </div>
      )}
    </figure>
  );
}
