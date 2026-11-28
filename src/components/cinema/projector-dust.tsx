"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./projector-dust.module.css";

type Mote = {
  x: number;
  y: number;
  size: number;
  drift: number;
  phase: number;
};

const moteCount = 90;
// The lens sits just above the frame, at the top centre.
const lensY = -0.06;
const maxSwing = 40;
const idleSwing = 4;
// After this long without pointer movement the beam drifts back to its sway.
const pointerTimeout = 2600;

/**
 * A projector beam falling from the top of the frame, with dust motes
 * drifting through it. A fine pointer pulls the beam toward it and leaves a
 * soft pool of light where it rests; otherwise the beam sways gently. The
 * motes glow brighter inside the beam. Decorative only; with motion off the
 * beam stays straight and the motes hold still.
 */
export function ProjectorDust({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const host = root.current;
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!host || !surface || !context || !visible) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = performance.now();
    let angle = 0;
    let glow = 0;
    const pointer = { x: 0, y: 0, at: -Infinity };
    // A fixed seed keeps the still frame identical between visits.
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      x: random(),
      y: random(),
      size: 0.6 + random() * 1.9,
      drift: 0.008 + random() * 0.02,
      phase: random() * Math.PI * 2,
    }));

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw(seconds: number) {
      context!.clearRect(0, 0, width, height);
      const slope = Math.tan((-angle * Math.PI) / 180);
      for (const mote of motes) {
        const x =
          (mote.x + Math.sin(seconds * 0.2 + mote.phase) * 0.012) * width;
        const y = mote.y * height;
        // The beam widens as it falls and leans with its current angle.
        const axis = width / 2 + (y - lensY * height) * slope;
        const spread = 0.08 + (y / height) * 0.32;
        const inBeam = Math.max(0, 1 - Math.abs(x - axis) / width / spread);
        const twinkle = 0.6 + Math.sin(seconds * 1.3 + mote.phase) * 0.4;
        const alpha = (0.08 + inBeam * 0.7) * twinkle;
        context!.beginPath();
        context!.fillStyle = `rgba(255, ${232 - inBeam * 30}, ${200 - inBeam * 90}, ${alpha})`;
        context!.arc(x, y, mote.size * (1 + inBeam * 0.8), 0, Math.PI * 2);
        context!.fill();
      }
    }

    function aimFromPointer(time: number) {
      const active = time - pointer.at < pointerTimeout;
      if (!active) return { target: Math.sin(time / 2200) * idleSwing, lit: 0 };
      const dx = pointer.x - width / 2;
      const dy = Math.max(pointer.y - lensY * height, 1);
      const toward = (-Math.atan2(dx, dy) * 180) / Math.PI;
      return {
        target: Math.max(-maxSwing, Math.min(maxSwing, toward)),
        lit: 1,
      };
    }

    function tick(time: number) {
      const elapsed = Math.min(time - previous, 60) / 1000;
      previous = time;
      for (const mote of motes) {
        mote.y -= mote.drift * elapsed;
        if (mote.y < -0.02) {
          mote.y = 1.02;
          mote.x = random();
        }
      }
      const { target, lit } = aimFromPointer(time);
      const ease = 1 - Math.exp(-elapsed * 3.2);
      angle += (target - angle) * ease;
      glow += (lit - glow) * (1 - Math.exp(-elapsed * 2.4));
      host!.style.setProperty("--beam-angle", `${angle.toFixed(3)}deg`);
      host!.style.setProperty("--pool-opacity", glow.toFixed(3));
      host!.style.setProperty("--pool-x", `${pointer.x.toFixed(1)}px`);
      host!.style.setProperty("--pool-y", `${pointer.y.toFixed(1)}px`);
      draw(time / 1000);
      frame = requestAnimationFrame(tick);
    }

    // The section's own content sits above this layer, so read the pointer
    // from the window and keep only fine pointers inside the hero.
    function follow(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const bounds = host!.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.at = performance.now();
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    observer.observe(surface);
    if (enabled) {
      window.addEventListener("pointermove", follow, { passive: true });
      frame = requestAnimationFrame(tick);
    } else {
      angle = 0;
      host.style.removeProperty("--beam-angle");
      host.style.removeProperty("--pool-opacity");
      draw(0);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", follow);
    };
  }, [visible, enabled]);

  return (
    <div
      ref={root}
      className={[styles.projector, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <div className={styles.beam} />
      <div className={styles.pool} />
      <canvas ref={canvas} className={styles.dust} />
    </div>
  );
}
