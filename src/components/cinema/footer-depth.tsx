"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import type { FooterDepthScene } from "./footer-depth-scene";
import styles from "./footer-depth.module.css";

/**
 * Full-bleed 3D background for the footer. The scene loads only once the
 * footer is near the viewport, runs only while visible with motion on, and
 * leaves the plain dark fill in place if WebGL is unavailable.
 */
export function FooterDepth() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<FooterDepthScene | null>(null);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const runningRef = useRef(false);

  // Mount the scene the first time the footer comes into view.
  useEffect(() => {
    const host = stage.current;
    const surface = canvas.current;
    if (!host || !surface || !visible || scene.current) return;
    let cancelled = false;
    void import("./footer-depth-scene")
      .then(({ mountFooterDepth }) => {
        if (cancelled) return;
        scene.current = mountFooterDepth(host, surface);
        scene.current.setRunning(runningRef.current);
        host.dataset.ready = "";
      })
      .catch(() => {
        // The dark fill stays in place when WebGL is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    runningRef.current = visible && enabled;
    scene.current?.setRunning(runningRef.current);
  }, [visible, enabled]);

  // The view leans toward a fine pointer anywhere over the footer.
  useEffect(() => {
    const host = stage.current;
    if (!host || !enabled) return;
    const aim = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = host.getBoundingClientRect();
      const inside =
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      scene.current?.aim(
        inside ? (event.clientX - bounds.left) / bounds.width - 0.5 : 0,
        inside ? (event.clientY - bounds.top) / bounds.height - 0.5 : 0,
      );
    };
    window.addEventListener("pointermove", aim, { passive: true });
    return () => window.removeEventListener("pointermove", aim);
  }, [enabled]);

  useEffect(
    () => () => {
      scene.current?.dispose();
      scene.current = null;
    },
    [],
  );

  return (
    <div className={styles.stage} ref={stage} aria-hidden="true">
      <canvas className={styles.canvas} ref={canvas} />
    </div>
  );
}
