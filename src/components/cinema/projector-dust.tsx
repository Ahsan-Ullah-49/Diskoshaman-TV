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

/**
 * A projector beam falling from the top of the frame, with dust motes
 * drifting through it. The motes glow brighter inside the beam. Decorative
 * only; with motion off the beam stays and the motes hold still.
 */
export function ProjectorDust({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
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
    let previous = performance.now();
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
      for (const mote of motes) {
        const x =
          (mote.x + Math.sin(seconds * 0.2 + mote.phase) * 0.012) * width;
        const y = mote.y * height;
        // The beam widens as it falls from the lens at the top centre.
        const spread = 0.08 + (y / height) * 0.32;
        const inBeam = Math.max(0, 1 - Math.abs(x / width - 0.5) / spread);
        const twinkle = 0.6 + Math.sin(seconds * 1.3 + mote.phase) * 0.4;
        const alpha = (0.08 + inBeam * 0.7) * twinkle;
        context!.beginPath();
        context!.fillStyle = `rgba(255, ${232 - inBeam * 30}, ${200 - inBeam * 90}, ${alpha})`;
        context!.arc(x, y, mote.size * (1 + inBeam * 0.8), 0, Math.PI * 2);
        context!.fill();
      }
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
      draw(time / 1000);
      frame = requestAnimationFrame(tick);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    observer.observe(surface);
    if (enabled) frame = requestAnimationFrame(tick);
    else draw(0);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [visible, enabled]);

  return (
    <div
      className={[styles.projector, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <div className={styles.beam} />
      <canvas ref={canvas} className={styles.dust} />
    </div>
  );
}
