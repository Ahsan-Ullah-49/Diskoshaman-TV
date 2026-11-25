"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import type { MarkPlayer } from "./studio-mark-scene";
import styles from "../site-header.module.css";

export function StudioMark() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<MarkPlayer | null>(null);
  const gesture = useRef<{
    id: number;
    x: number;
    distance: number;
    start: number;
  } | null>(null);
  const skipClick = useRef(false);
  const [ready, setReady] = useState(false);
  const help = useId();
  const { enabled } = useStudioMotion();
  const visible = useVisible(canvas);
  const running = enabled && visible;
  const lifetime = useRef<AbortController | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    requested.current = false;
    return () => {
      controller.abort();
      player.current?.dispose();
      player.current = null;
    };
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const controller = lifetime.current;
    if (!running || !element || !controller || requested.current) return;
    requested.current = true;
    void import("./studio-mark-scene")
      .then(async ({ createStudioMark }) => {
        if (controller.signal.aborted) return;
        const scene = await createStudioMark(element, controller.signal);
        if (controller.signal.aborted) scene.dispose();
        else {
          player.current = scene;
          setReady(true);
        }
      })
      .catch(() => {
        delete element.dataset.ready;
      });
  }, [running]);

  useEffect(() => {
    player.current?.setRunning(running);
    if (!running) {
      gesture.current = null;
      player.current?.setHover(false);
    }
  }, [ready, running]);

  function release(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    skipClick.current =
      current.distance > 4 || performance.now() - current.start > 220;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <>
      <button
        type="button"
        className={styles.mark}
        disabled={!ready || !enabled}
        aria-label="Face the Diskoshaman emblem forward"
        aria-describedby={help}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") player.current?.setHover(true);
        }}
        onPointerLeave={() => player.current?.setHover(false)}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          skipClick.current = false;
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            distance: 0,
            start: performance.now(),
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = gesture.current;
          if (!current || current.id !== event.pointerId) return;
          const delta = event.clientX - current.x;
          current.distance += Math.abs(delta);
          current.x = event.clientX;
          player.current?.turnBy(
            (delta * Math.PI) / event.currentTarget.clientWidth,
          );
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onClick={(event) => {
          if (!skipClick.current || event.detail === 0)
            player.current?.faceFront();
          skipClick.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          player.current?.turnBy(
            ((event.key === "ArrowLeft" ? -1 : 1) * Math.PI) / 12,
          );
        }}
      >
        <Image
          className={styles.markPoster}
          src="/brand/studio-logo.png"
          alt=""
          fill
          draggable={false}
          sizes="(max-width: 352px) 88px, (max-width: 400px) 25vw, 100px"
        />
        <canvas ref={canvas} className={styles.markCanvas} aria-hidden="true" />
      </button>
      <span id={help} className="visually-hidden">
        Drag or use the left and right arrow keys to turn the DS emblem.
        Activate it to return to the front view.
      </span>
    </>
  );
}
