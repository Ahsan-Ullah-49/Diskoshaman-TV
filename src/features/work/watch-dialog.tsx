"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PillButton } from "@/components/pill-button";
import type { Project } from "@/content/projects";
import { embedUrl, vimeoOrigin } from "./vimeo-film";
import styles from "./work.module.css";

type VimeoMessage = {
  event?: string;
  method?: string;
  value?: unknown;
  data?: { name?: string; method?: string };
};

function parseMessage(value: unknown): VimeoMessage | null {
  try {
    const message: unknown =
      typeof value === "string" ? JSON.parse(value) : value;
    return message && typeof message === "object"
      ? (message as VimeoMessage)
      : null;
  } catch {
    return null;
  }
}

function VimeoFilm({
  project,
  onRetry,
}: {
  project: Project;
  onRetry: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [needsPlay, setNeedsPlay] = useState(false);

  function send(method: string, value?: string) {
    frame.current?.contentWindow?.postMessage({ method, value }, vimeoOrigin);
  }

  useEffect(() => {
    // An iframe load can also be Vimeo’s error document. Wait for a player response.
    const fallback = window.setTimeout(() => setStatus("error"), 12000);

    function receive(event: MessageEvent) {
      if (
        event.origin !== vimeoOrigin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const message = parseMessage(event.data);
      if (!message) return;

      if (message.event === "ready" || message.method === "ping") {
        if (ready.current) return;
        ready.current = true;
        window.clearTimeout(fallback);
        setStatus("ready");
        send("addEventListener", "play");
        send("addEventListener", "error");
        send("getPaused");
      }
      if (message.method === "getPaused") setNeedsPlay(message.value === true);
      if (message.event === "play") setNeedsPlay(false);
      if (message.event === "error") {
        if (message.data?.name === "NotAllowedError") {
          setNeedsPlay(true);
        } else {
          window.clearTimeout(fallback);
          setStatus("error");
        }
      }
    }

    window.addEventListener("message", receive);
    send("ping");
    return () => {
      window.removeEventListener("message", receive);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <div className={styles.dialogScreen} data-portrait={project.portrait}>
        <Image
          className={styles.poster}
          src={project.poster}
          alt=""
          fill
          sizes="(min-width: 50rem) 44rem, 92vw"
        />
        {status !== "error" && (
          <iframe
            ref={frame}
            className={styles.frame}
            data-ready={status === "ready"}
            src={embedUrl(project)}
            title={`${project.title} video player`}
            width={project.portrait ? 360 : 960}
            height={project.portrait ? 640 : 540}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            tabIndex={status === "ready" ? 0 : -1}
            onLoad={() => send("ping")}
            onError={() => setStatus("error")}
          />
        )}
        {status === "loading" && (
          <p className={styles.playerMessage} role="status">
            Loading film…
          </p>
        )}
        {status === "error" && (
          <div className={styles.playerMessage} role="status">
            <p>The player couldn’t load this film.</p>
            <PillButton onClick={onRetry}>Retry player</PillButton>
          </div>
        )}
      </div>
      <div className={styles.playerActions}>
        {status === "ready" && needsPlay && (
          <button
            className={styles.textAction}
            type="button"
            onClick={() => send("play")}
          >
            Play film
          </button>
        )}
      </div>
    </>
  );
}

export function WatchDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) {
      element.showModal();
      close.current?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      // The frame shows only the film; its title is announced, not printed.
      aria-label={project.title}
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className={styles.dialogBody}>
        <div className={styles.dialogHeader}>
          <button
            className={styles.close}
            ref={close}
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close film"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <VimeoFilm
          key={attempt}
          project={project}
          onRetry={() => {
            close.current?.focus({ preventScroll: true });
            setAttempt((value) => value + 1);
          }}
        />
      </div>
    </dialog>
  );
}
