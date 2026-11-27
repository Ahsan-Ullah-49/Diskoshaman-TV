"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./signal-waves.module.css";

type Wave = {
  /** Vertical position as a share of the frame height. */
  base: number;
  amplitude: number;
  length: number;
  speed: number;
  alpha: number;
  width: number;
};

const waves: Wave[] = [
  {
    base: 0.56,
    amplitude: 0.09,
    length: 1.1,
    speed: 0.35,
    alpha: 0.85,
    width: 2.4,
  },
  {
    base: 0.6,
    amplitude: 0.07,
    length: 0.8,
    speed: -0.25,
    alpha: 0.6,
    width: 1.8,
  },
  {
    base: 0.64,
    amplitude: 0.11,
    length: 1.4,
    speed: 0.2,
    alpha: 0.45,
    width: 1,
  },
  {
    base: 0.52,
    amplitude: 0.05,
    length: 0.6,
    speed: -0.4,
    alpha: 0.38,
    width: 1,
  },
  {
    base: 0.68,
    amplitude: 0.08,
    length: 1.8,
    speed: 0.15,
    alpha: 0.3,
    width: 0.8,
  },
  {
    base: 0.48,
    amplitude: 0.06,
    length: 2.2,
    speed: 0.28,
    alpha: 0.24,
    width: 0.8,
  },
];

/**
 * Flowing gold signal lines, like a conversation drawn as sound. The lines
 * swell toward the middle of the frame and settle at the edges. Decorative;
 * with motion off they hold one still frame.
 */
export function SignalWaves({ className }: { className?: string }) {
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

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw(seconds: number) {
      context!.clearRect(0, 0, width, height);
      const gradient = context!.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(204, 152, 40, 0)");
      gradient.addColorStop(0.3, "rgba(231, 186, 96, 1)");
      gradient.addColorStop(0.7, "rgba(255, 226, 170, 1)");
      gradient.addColorStop(1, "rgba(204, 152, 40, 0)");

      for (const wave of waves) {
        context!.beginPath();
        for (let step = 0; step <= 120; step++) {
          const t = step / 120;
          // An envelope keeps the wave calm at the edges and fuller mid-frame.
          const envelope = Math.sin(t * Math.PI) ** 1.4;
          const phase =
            t * Math.PI * 2 * wave.length + seconds * wave.speed * 2;
          const swing =
            Math.sin(phase) + Math.sin(phase * 0.5 + seconds * 0.3) * 0.4;
          const y =
            (wave.base + swing * wave.amplitude * envelope * 0.7) * height;
          if (step === 0) context!.moveTo(t * width, y);
          else context!.lineTo(t * width, y);
        }
        context!.globalAlpha = wave.alpha;
        context!.strokeStyle = gradient;
        // A soft halo makes each line read as light rather than a stroke.
        context!.shadowColor = "rgba(231, 186, 96, 0.8)";
        context!.shadowBlur = 10;
        context!.lineWidth = wave.width;
        context!.stroke();
      }
      context!.globalAlpha = 1;
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
    if (enabled) frame = requestAnimationFrame(tick);
    else draw(0);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [visible, enabled]);

  return (
    <canvas
      ref={canvas}
      className={[styles.waves, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
