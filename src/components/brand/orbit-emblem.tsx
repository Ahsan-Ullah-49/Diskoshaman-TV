"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import type { OrbitEmblemScene } from "./orbit-emblem-scene";
import styles from "./orbit-emblem.module.css";

const clampHalf = (value: number) => Math.max(-0.5, Math.min(0.5, value));

/**
 * The turning 3D studio emblem for the About hero. The emblem's poster shows
 * until the model is ready and stays if WebGL is unavailable. The scene
 * loads when the stage first comes into view and runs only while visible
 * with motion on.
 */
export function OrbitEmblem({ className }: { className?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<OrbitEmblemScene | null>(null);
  const lifetime = useRef<AbortController | null>(null);
  const [ready, setReady] = useState(false);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const running = visible && enabled;

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    return () => {
      controller.abort();
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    const surface = canvas.current;
    const controller = lifetime.current;
    if (!visible || !surface || !controller || scene.current) return;
    void import("./orbit-emblem-scene")
      .then(({ mountOrbitEmblem }) =>
        mountOrbitEmblem(surface, controller.signal),
      )
      .then((mounted) => {
        if (controller.signal.aborted || scene.current) {
          mounted.dispose();
          return;
        }
        scene.current = mounted;
        setReady(true);
      })
      .catch(() => {
        // The poster stays in place when WebGL or the model is unavailable.
      });
  }, [visible]);

  useEffect(() => {
    scene.current?.setRunning(running);
  }, [running, ready]);

  // The emblem leans toward a fine pointer anywhere over the hero.
  useEffect(() => {
    const element = stage.current;
    const hero = element?.closest("section");
    if (!element || !hero || !enabled) return;
    const aim = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = element.getBoundingClientRect();
      const area = hero.getBoundingClientRect();
      const inside = event.clientY >= area.top && event.clientY <= area.bottom;
      const across = (event.clientX - bounds.left) / bounds.width - 0.5;
      const down = (event.clientY - bounds.top) / bounds.height - 0.5;
      scene.current?.aim(
        inside ? clampHalf(across) : 0,
        inside ? clampHalf(down) : 0,
      );
    };
    window.addEventListener("pointermove", aim, { passive: true });
    return () => window.removeEventListener("pointermove", aim);
  }, [enabled]);

  return (
    <div
      ref={stage}
      className={[styles.stage, className].filter(Boolean).join(" ")}
      data-ready={ready}
      data-orbit-anchor
      aria-hidden="true"
    >
      <Image
        className={styles.poster}
        src="/brand/studio-logo.png"
        alt=""
        fill
        sizes="(min-width: 52rem) 34vw, 70vw"
      />
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  );
}
