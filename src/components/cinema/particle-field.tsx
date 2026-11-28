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

const baseRows = 58;
const nearDepth = 0.22;
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

    /** 0 as the field enters from below, 1 as it leaves at the top. */
    function scrollTravel() {
      const bounds = surface!.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      return Math.min(
        1,
        Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)),
      );
    }

    // A fine pointer carries a pool of light across the sheet, in the same
    // spirit as the footer wordmark's spotlight. Strength eases in and out.
    // Kept in viewport coordinates and mapped every frame, so the light stays
    // under a still mouse while the page scrolls beneath it.
    let pointerClientX = 0;
    let pointerClientY = 0;
    let hasMouse = false;
    let pointerStrength = 0;
    let previous = 0;

    function trackPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      hasMouse = true;
    }

    function draw(time: number) {
      const bounds = surface!.getBoundingClientRect();
      const pointerX = pointerClientX - bounds.left;
      const pointerY = pointerClientY - bounds.top;
      const pointerInside =
        hasMouse &&
        pointerX >= 0 &&
        pointerY >= 0 &&
        pointerX <= bounds.width &&
        pointerY <= bounds.height;
      // The sheet moves at 60% of its original pace so it stays calm behind copy.
      const seconds = (time / 1000) * 0.6;
      const elapsed = Math.min(0.06, (time - previous) / 1000);
      previous = time;
      pointerStrength +=
        ((pointerInside ? 1 : 0) - pointerStrength) *
        (1 - Math.exp(-elapsed * 6));
      // Scrolling rolls the ripples outward and deepens the well, so the
      // sheet answers the visitor's movement as well as the clock.
      const travel = enabled ? scrollTravel() : 0.5;
      context!.clearRect(0, 0, width, height);
      const focal = width * 0.62;
      const horizon = height * 0.12;
      // The sheet is just wide enough to fill the frame at its far edge.
      const spread = (width / focal) * farDepth * 1.08;
      const eye = 0.6;
      // Lift the near rows so the sheet always reaches the bottom of the frame.
      const lift = ((height * 1.04 - horizon) * nearDepth) / (eye * focal);
      // Phones get a much sparser net so it reads as texture, not noise;
      // tall frames still get a few extra rows so the floor reaches the bottom.
      const narrow = width < 700;
      const rows = Math.round(
        (narrow ? 30 : baseRows) *
          Math.min(narrow ? 1.6 : 2.6, Math.max(1, (height / width) * 0.9)),
      );
      const columns = narrow ? 46 : 150;
      const spotRadius = Math.max(110, Math.min(190, width * 0.14));
      // Place the well so it lands under the requested point on screen.
      const wellZ = 0.3 + wellDepth * 1.1;
      const wellX = ((wellLeft - 0.5) * width * wellZ) / focal;

      for (let row = 0; row < rows; row++) {
        // Rows are spaced so they bunch toward the horizon like a real floor.
        const depth =
          nearDepth + (row / (rows - 1)) ** 1.35 * (farDepth - nearDepth);
        const fade = Math.max(0, 1 - (depth - nearDepth) / 1.5);
        for (let column = 0; column < columns; column++) {
          const x = (column / (columns - 1) - 0.5) * spread;
          const dx = x - wellX;
          const dz = depth - wellZ;
          const distance = Math.sqrt(dx * dx + dz * dz);
          const pull =
            Math.exp(-(distance * distance) / 0.09) * (0.3 + travel * 0.24);
          const ripple =
            Math.sin(distance * 9 - seconds * 1.4 - travel * 14) *
            Math.exp(-distance * 1.6) *
            0.06;
          const swell = Math.sin(x * 1.6 + seconds * 0.45 + depth * 3) * 0.025;
          const y = ripple + swell - pull;

          const screenX = width / 2 + (x / depth) * focal;
          if (screenX < -4 || screenX > width + 4) continue;
          let screenY = horizon + ((eye - y) / depth) * focal * lift;
          if (screenY < -4 || screenY > height + 4) continue;

          // Particles under the pointer rise slightly and burn brighter.
          let spot = 0;
          if (pointerStrength > 0.01) {
            const offsetX = screenX - pointerX;
            const offsetY = screenY - pointerY;
            spot =
              Math.exp(
                -(offsetX * offsetX + offsetY * offsetY) /
                  (spotRadius * spotRadius),
              ) * pointerStrength;
            screenY -= spot * 12;
          }

          const glow = Math.min(1, pull * 2.2 + spot * 1.2);
          const alpha = Math.min(1, 0.28 + fade * 0.6 + glow * 0.3);
          const radius = Math.min(
            3.6 + spot * 1.4,
            Math.max(1.1, (1.5 / depth) * (0.85 + glow * 0.7 + spot * 0.6)),
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
    if (enabled) {
      window.addEventListener("pointermove", trackPointer, { passive: true });
      frame = requestAnimationFrame(loop);
    } else draw(0);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", trackPointer);
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
