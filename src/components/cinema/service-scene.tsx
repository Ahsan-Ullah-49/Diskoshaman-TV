"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { createFrameGate } from "@/lib/render-quality";
import { useVisible } from "@/lib/use-visible";
import { sceneDrawings, type SceneKind } from "./service-scene-drawings";
import styles from "./service-scene.module.css";

/**
 * Read the canvas's resolved text colour, which the stylesheet sets to the
 * page accent, as "r, g, b". Browsers report it either as rgb() or, for
 * mixed colours, as color(srgb ...).
 */
function readAccent(element: HTMLElement) {
  const colour = getComputedStyle(element).color;
  const channels = /rgba?\(([^)]+)\)/.exec(colour);
  if (channels) return channels[1].split(",").slice(0, 3).join(",");
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(colour);
  if (srgb) {
    return srgb
      .slice(1, 4)
      .map((value) => Math.round(Number(value) * 255))
      .join(", ");
  }
  return "239, 189, 120";
}

/**
 * The live hairline scene behind a services hero. The overview shows a
 * camera aperture; each service has its own scene. A fine pointer over the
 * hero turns and opens it. Decorative only; with motion off one still frame
 * is drawn.
 */
export function ServiceScene({ kind }: { kind: SceneKind }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context || !visible) return;
    const drawScene = sceneDrawings[kind];
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    // Re-read on each mount so a theme change picks up the new accent.
    const accent = readAccent(surface);
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = performance.now();
    let clock = 6;
    const pointer = { x: 0, y: 0, inside: false };
    let easedX = 0;
    let easedY = 0;
    let hover = 0;

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    // The hero copy sits above the canvas, so follow the pointer on the window.
    function trackPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const bounds = surface!.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      pointer.inside = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;
    }

    function draw(now: number) {
      const elapsed = Math.min(0.06, (now - previous) / 1000);
      previous = now;
      if (enabled) clock += elapsed;
      const ease = 1 - Math.exp(-elapsed * 3);
      const active = enabled && pointer.inside;
      easedX += ((active ? pointer.x : 0) - easedX) * ease;
      easedY += ((active ? pointer.y : 0) - easedY) * ease;
      hover += ((active ? 1 : 0) - hover) * ease;
      context!.clearRect(0, 0, width, height);
      drawScene({
        context: context!,
        width,
        height,
        time: clock,
        pointerX: easedX,
        pointerY: easedY,
        hover,
        accent,
      });
    }

    // Software rendering draws at 30 fps.
    const gate = createFrameGate();
    function loop(now: number) {
      if (gate(now)) draw(now);
      frame = requestAnimationFrame(loop);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      // Resizing clears the canvas, so redraw at once rather than wait for a tick.
      draw(performance.now());
    });
    observer.observe(surface);
    draw(performance.now());
    if (enabled) {
      window.addEventListener("pointermove", trackPointer, { passive: true });
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", trackPointer);
    };
  }, [visible, enabled, kind, resolvedTheme]);

  return <canvas ref={canvas} className={styles.scene} aria-hidden="true" />;
}
