"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./orbit-field.module.css";

type Orbit = { radius: number; speed: number; lights: number; phase: number };

// Rings sized as a share of the frame's shorter side.
const orbits: Orbit[] = [
  { radius: 0.22, speed: 0.22, lights: 2, phase: 0.4 },
  { radius: 0.34, speed: -0.15, lights: 3, phase: 1.7 },
  { radius: 0.47, speed: 0.1, lights: 3, phase: 3.1 },
  { radius: 0.62, speed: -0.07, lights: 4, phase: 0.9 },
  { radius: 0.8, speed: 0.05, lights: 4, phase: 2.4 },
];
const starCount = 70;

/**
 * Tilted gold orbits, like the globe in the studio emblem, with points of
 * light travelling around them and faint stars behind. "Infinity lies
 * within." The orbits centre on `centre`, a share of the frame, or on the
 * `[data-orbit-anchor]` element in the same section when there is one.
 * Decorative; with motion off it draws a single still frame.
 */
export function OrbitField({
  centre = { x: 0.7, y: 0.5 },
  className,
}: {
  centre?: { x: number; y: number };
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { x: centreX, y: centreY } = centre;
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context || !visible) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    let width = 0;
    let height = 0;
    let frame = 0;
    let seed = 11;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const stars = Array.from({ length: starCount }, () => ({
      x: random(),
      y: random(),
      size: 0.4 + random() * 1.1,
      phase: random() * Math.PI * 2,
    }));

    let cx = centreX;
    let cy = centreY;
    const anchor = surface.parentElement?.querySelector<HTMLElement>(
      "[data-orbit-anchor]",
    );

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      cx = centreX * width;
      cy = centreY * height;
      // Both scroll together, so the anchor's offset only changes with layout.
      if (anchor) {
        const frame = surface!.getBoundingClientRect();
        const target = anchor.getBoundingClientRect();
        cx = target.left + target.width / 2 - frame.left;
        cy = target.top + target.height / 2 - frame.top;
      }
    }

    function draw(seconds: number) {
      context!.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = 0.35 + Math.sin(seconds * 0.9 + star.phase) * 0.3;
        context!.fillStyle = `rgba(255, 244, 222, ${twinkle * 0.5})`;
        context!.fillRect(
          star.x * width,
          star.y * height,
          star.size,
          star.size,
        );
      }

      const unit = Math.min(width, height * 1.4);
      // The whole system turns very slowly; each ring is a tilted ellipse.
      const spin = seconds * 0.03;
      const tilt = 0.34;

      orbits.forEach((orbit, index) => {
        const rx = orbit.radius * unit;
        const ry = rx * tilt;
        const lean = -0.32 + index * 0.05;
        context!.save();
        context!.translate(cx, cy);
        context!.rotate(lean);
        context!.beginPath();
        context!.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        context!.strokeStyle = `rgba(231, 186, 96, ${0.16 - index * 0.018})`;
        context!.lineWidth = 1;
        context!.stroke();

        for (let light = 0; light < orbit.lights; light++) {
          const angle =
            orbit.phase +
            spin +
            seconds * orbit.speed +
            (light / orbit.lights) * Math.PI * 2;
          const x = Math.cos(angle) * rx;
          const y = Math.sin(angle) * ry;
          // Lights on the near half of the orbit are larger and brighter.
          const near = (Math.sin(angle) + 1) / 2;
          const radius = 1.4 + near * 2.4;
          const glow = context!.createRadialGradient(x, y, 0, x, y, radius * 5);
          glow.addColorStop(0, `rgba(255, 226, 160, ${0.5 + near * 0.45})`);
          glow.addColorStop(1, "rgba(231, 186, 96, 0)");
          context!.fillStyle = glow;
          context!.beginPath();
          context!.arc(x, y, radius * 5, 0, Math.PI * 2);
          context!.fill();
        }
        context!.restore();
      });
    }

    function tick(time: number) {
      draw(time / 1000);
      frame = requestAnimationFrame(tick);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    observer.observe(surface);
    if (anchor) observer.observe(anchor);
    if (enabled) frame = requestAnimationFrame(tick);
    else draw(0);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [visible, enabled, centreX, centreY]);

  return (
    <canvas
      ref={canvas}
      className={[styles.field, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
