"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { createFrameGate } from "@/lib/render-quality";
import { useVisible } from "@/lib/use-visible";
import styles from "./wave-ribbon.module.css";

const lineCount = 34;

/**
 * A ribbon of fine lines that flows across the frame like silk thread,
 * each line a little out of step with the next so the ribbon twists.
 * A fine pointer swells the ribbon beneath it. Decorative only; motion off
 * holds a single frame. Thinner and denser than the Contact page's waves.
 */
export function WaveRibbon({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context || !visible) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = performance.now();
    let clock = 12;
    let pointerClientX = 0;
    let pointerClientY = 0;
    let hasMouse = false;
    let swell = 0;
    let swellX = 0;

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      swellX = width / 2;
    }

    function trackPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      hasMouse = true;
    }

    function draw(now: number) {
      const elapsed = Math.min(0.06, (now - previous) / 1000);
      previous = now;
      if (enabled) clock += elapsed;
      const bounds = surface!.getBoundingClientRect();
      const localX = pointerClientX - bounds.left;
      const localY = pointerClientY - bounds.top;
      const inside =
        enabled &&
        hasMouse &&
        localX >= 0 &&
        localY >= 0 &&
        localX <= width &&
        localY <= height;
      const ease = 1 - Math.exp(-elapsed * 4);
      swell += ((inside ? 1 : 0) - swell) * ease;
      if (inside) swellX += (localX - swellX) * ease;

      context!.clearRect(0, 0, width, height);
      const centreY = height * 0.5;
      const amplitude = height * 0.2;
      const step = Math.max(6, width / 160);
      const swellRadius = Math.max(160, width * 0.16);
      const stroke = context!.createLinearGradient(0, 0, width, 0);
      stroke.addColorStop(0, "rgba(231, 186, 96, 0)");
      stroke.addColorStop(0.25, "rgba(231, 186, 96, 1)");
      stroke.addColorStop(0.5, "rgba(255, 244, 222, 1)");
      stroke.addColorStop(0.75, "rgba(231, 186, 96, 1)");
      stroke.addColorStop(1, "rgba(231, 186, 96, 0)");
      context!.strokeStyle = stroke;
      context!.lineWidth = 1;

      for (let line = 0; line < lineCount; line++) {
        const share = line / (lineCount - 1);
        // Lines at the middle of the ribbon are brighter than its edges.
        context!.globalAlpha = 0.05 + Math.sin(share * Math.PI) * 0.22;
        const phase = share * 2.4;
        context!.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const across = x / width;
          let y =
            Math.sin(across * 5.2 + clock * 0.45 + phase) * 0.55 +
            Math.sin(across * 2.1 - clock * 0.3 + phase * 0.6) * 0.45;
          y *= amplitude * (0.35 + share * 0.65);
          const distance = (x - swellX) / swellRadius;
          y *= 1 + Math.exp(-distance * distance) * swell * 0.7;
          if (x === -step) context!.moveTo(x, centreY + y);
          else context!.lineTo(x, centreY + y);
        }
        context!.stroke();
      }
      context!.globalAlpha = 1;
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
  }, [visible, enabled]);

  return (
    <canvas
      ref={canvas}
      className={[styles.ribbon, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
