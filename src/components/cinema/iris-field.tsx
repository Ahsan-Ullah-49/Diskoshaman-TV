"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { createFrameGate } from "@/lib/render-quality";
import { useVisible } from "@/lib/use-visible";
import styles from "./iris-field.module.css";

const bladeCount = 7;
const tickCount = 120;

/** Read a colour like #efbd78 into r, g, b, falling back to studio gold. */
function readAccent(element: HTMLElement) {
  const value = getComputedStyle(element)
    .getPropertyValue("--service-accent")
    .trim();
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return "239, 189, 120";
  const hex = parseInt(match[1], 16);
  return `${(hex >> 16) & 255}, ${(hex >> 8) & 255}, ${hex & 255}`;
}

/**
 * A minimal camera aperture drawn in hairlines: a focus ring with fine ticks
 * turns slowly while the iris blades open and close like a lens breathing.
 * The pointer turns the ring a little and opens the iris. It takes the
 * page's --service-accent colour. Decorative only; motion off holds a frame.
 */
export function IrisField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(canvas);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context || !visible) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const accent = readAccent(surface);
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = performance.now();
    let clock = 6;
    let pointerClientX = 0;
    let pointerClientY = 0;
    let hasMouse = false;
    let turn = 0;
    let open = 0;

    function resize() {
      width = surface!.clientWidth;
      height = surface!.clientHeight;
      surface!.width = Math.round(width * pixelRatio);
      surface!.height = Math.round(height * pixelRatio);
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
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
      const ease = 1 - Math.exp(-elapsed * 2.5);
      turn += ((inside ? (localX / width - 0.5) * 0.5 : 0) - turn) * ease;
      open += ((inside ? 1 : 0) - open) * ease;

      const centreX = width / 2;
      const centreY = height * 0.5;
      const radius = Math.min(width * 0.46, height * 0.46, 430);
      context!.clearRect(0, 0, width, height);
      context!.lineWidth = 1;

      // A faint pool of the accent at the centre of the lens.
      const pool = context!.createRadialGradient(
        centreX,
        centreY,
        0,
        centreX,
        centreY,
        radius,
      );
      pool.addColorStop(0, `rgba(${accent}, 0.13)`);
      pool.addColorStop(1, `rgba(${accent}, 0)`);
      context!.fillStyle = pool;
      context!.fillRect(0, 0, width, height);

      // Focus ring: fine ticks that turn slowly, every tenth one longer.
      const ringTurn = clock * 0.025 + turn;
      context!.strokeStyle = `rgba(${accent}, 0.26)`;
      context!.beginPath();
      for (let tick = 0; tick < tickCount; tick++) {
        const angle = (tick / tickCount) * Math.PI * 2 + ringTurn;
        const inner = radius * (tick % 10 === 0 ? 1.06 : 1.09);
        const outer = radius * 1.12;
        context!.moveTo(
          centreX + Math.cos(angle) * inner,
          centreY + Math.sin(angle) * inner,
        );
        context!.lineTo(
          centreX + Math.cos(angle) * outer,
          centreY + Math.sin(angle) * outer,
        );
      }
      context!.stroke();

      context!.strokeStyle = `rgba(${accent}, 0.14)`;
      for (const scale of [1, 1.18]) {
        context!.beginPath();
        context!.arc(centreX, centreY, radius * scale, 0, Math.PI * 2);
        context!.stroke();
      }

      // Iris: each blade edge is tangent to the opening, so together they
      // draw the familiar polygon of a lens aperture.
      const breathe = 0.5 + Math.sin(clock * 0.35) * 0.5;
      const opening = radius * (0.3 + breathe * 0.16 + open * 0.12);
      const bladeTurn = -clock * 0.04 - turn * 0.6;
      const reach = Math.sqrt(Math.max(0, radius * radius - opening * opening));
      context!.strokeStyle = `rgba(${accent}, 0.4)`;
      context!.lineWidth = 1.25;
      context!.beginPath();
      for (let blade = 0; blade < bladeCount; blade++) {
        const angle = (blade / bladeCount) * Math.PI * 2 + bladeTurn;
        const touchX = centreX + Math.cos(angle) * opening;
        const touchY = centreY + Math.sin(angle) * opening;
        const directionX = -Math.sin(angle);
        const directionY = Math.cos(angle);
        context!.moveTo(
          touchX - directionX * reach * 0.25,
          touchY - directionY * reach * 0.25,
        );
        context!.lineTo(
          touchX + directionX * reach,
          touchY + directionY * reach,
        );
      }
      context!.stroke();
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
      className={[styles.iris, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
