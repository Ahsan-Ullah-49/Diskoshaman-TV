"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./particle-field.module.css";

type Well = {
  /** Horizontal position of the gravity well, from 0 (left) to 1 (right). */
  x: number;
  /** Depth of the well into the scene, from 0 (near) to 1 (far). */
  z: number;
};

const columns = 150;
const rows = 58;
const farDepth = 1.72;

/**
 * A field of gold particles laid out like a sheet of fabric in perspective.
 * A gravity well pulls the sheet down at one point and slow ripples run out
 * from it. Decorative only; it draws a single still frame when motion is off.
 */
export function ParticleField({
  well = { x: 0.7, z: 0.42 },
  className,
}: {
  well?: Well;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { x: wellLeft, z: wellDepth } = well;
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context || !visible) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw(time: number) {
      const seconds = time / 1000;
      context!.clearRect(0, 0, width, height);
      const focal = width * 0.62;
      const horizon = height * 0.3;
      // The sheet is just wide enough to fill the frame at its far edge.
      const spread = (width / focal) * farDepth * 1.08;
      const eye = 0.6;
      const lift = 0.42;
      // Place the well so it lands under the requested point on screen.
      const wellZ = 0.3 + wellDepth * 1.1;
      const wellX = ((wellLeft - 0.5) * width * wellZ) / focal;

      for (let row = 0; row < rows; row++) {
        // Rows are spaced so they bunch toward the horizon like a real floor.
        const depth = 0.22 + (row / (rows - 1)) ** 1.35 * (farDepth - 0.22);
        const fade = Math.max(0, 1 - (depth - 0.22) / 1.5);
        for (let column = 0; column < columns; column++) {
          const x = (column / (columns - 1) - 0.5) * spread;
          const dx = x - wellX;
          const dz = depth - wellZ;
          const distance = Math.sqrt(dx * dx + dz * dz);
          const pull = Math.exp(-(distance * distance) / 0.09) * 0.42;
          const ripple =
            Math.sin(distance * 9 - seconds * 1.4) *
            Math.exp(-distance * 1.6) *
            0.06;
          const swell = Math.sin(x * 1.6 + seconds * 0.45 + depth * 3) * 0.025;
          const y = ripple + swell - pull;

          const screenX = width / 2 + (x / depth) * focal;
          if (screenX < -4 || screenX > width + 4) continue;
          const screenY = horizon + ((eye - y) / depth) * focal * lift;
          if (screenY < -4 || screenY > height + 4) continue;

          const glow = Math.min(1, pull * 2.2);
          const alpha = Math.min(1, 0.28 + fade * 0.6 + glow * 0.3);
          const radius = Math.min(
            3.6,
            Math.max(1.1, (1.5 / depth) * (0.85 + glow * 0.7)),
          );
          context!.fillStyle = `rgba(${231 + glow * 20}, ${186 + glow * 40}, ${96 + glow * 80}, ${alpha})`;
          context!.fillRect(
            screenX - radius / 2,
            screenY - radius / 2,
            radius,
            radius,
          );
        }
      }
    }

    function loop(time: number) {
      draw(time);
      frame = requestAnimationFrame(loop);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (!enabled) draw(0);
    });
    observer.observe(surface);
    if (enabled) frame = requestAnimationFrame(loop);
    else draw(0);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [visible, enabled, wellLeft, wellDepth]);

  return (
    <canvas
      ref={canvas}
      className={[styles.field, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
