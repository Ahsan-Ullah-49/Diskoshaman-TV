"use client";

import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { useVisible } from "@/lib/use-visible";
import styles from "./process-orbit.module.css";

type Step = { title: string; description: string };

const autoAdvance = 5200;

/**
 * The About page's process: the steps ride a tilted gold orbit, like the
 * globe in the studio emblem. The chosen step swings to the front; the
 * others wait behind it. The orbit tilts toward a fine pointer and moves on
 * by itself while in view. Every step's text is always in the page; with
 * motion off the steps change without travelling and never advance alone.
 */
export function ProcessOrbit({ steps }: { steps: readonly Step[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const motion = useRef({ position: 0, tiltX: 0, tiltY: 0, aimX: 0, aimY: 0 });

  // Advance on a timer while the orbit is in view and nobody is reading a step.
  useEffect(() => {
    if (!enabled || !visible || held) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % steps.length),
      autoAdvance,
    );
    return () => window.clearInterval(timer);
  }, [enabled, visible, held, steps.length]);

  // Ease the orbit toward the chosen step and the pointer tilt, then stop.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const state = motion.current;
    let frame = 0;
    let previous = performance.now();

    function place() {
      const count = steps.length;
      cards.current.forEach((card, index) => {
        if (!card) return;
        // Shortest way round the orbit from the front to this card.
        let offset = (index - state.position) % count;
        if (offset > count / 2) offset -= count;
        if (offset < -count / 2) offset += count;
        const angle = (offset / count) * Math.PI * 2;
        const front = (Math.cos(angle) + 1) / 2;
        card.style.setProperty("--orbit-x", `${Math.sin(angle) * 100}%`);
        card.style.setProperty("--orbit-z", `${(front - 1) * 22}rem`);
        card.style.setProperty("--orbit-y", `${(1 - front) * -2.4}rem`);
        card.style.setProperty("--orbit-front", front.toFixed(3));
        card.style.zIndex = String(Math.round(front * 10));
      });
      element!.style.setProperty("--tilt-x", `${state.tiltX.toFixed(2)}deg`);
      element!.style.setProperty("--tilt-y", `${state.tiltY.toFixed(2)}deg`);
    }

    function tick(time: number) {
      const elapsed = Math.min(time - previous, 60) / 1000;
      previous = time;
      const ease = 1 - Math.exp(-elapsed * 4.2);
      let target = active;
      // Travel forward round the ring rather than back across it.
      while (target < state.position - steps.length / 2) target += steps.length;
      while (target > state.position + steps.length / 2) target -= steps.length;
      state.position += (target - state.position) * ease;
      state.tiltX += (state.aimY * -8 - state.tiltX) * ease;
      state.tiltY += (state.aimX * 12 - state.tiltY) * ease;
      place();
      const settled =
        Math.abs(target - state.position) < 0.001 &&
        Math.abs(state.aimY * -8 - state.tiltX) < 0.01 &&
        Math.abs(state.aimX * 12 - state.tiltY) < 0.01;
      frame = settled ? 0 : requestAnimationFrame(tick);
    }

    if (!enabled) {
      state.position = active;
      state.tiltX = 0;
      state.tiltY = 0;
      place();
      return;
    }

    function aim(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const bounds = element!.getBoundingClientRect();
      const inside =
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      state.aimX = inside
        ? (event.clientX - bounds.left) / bounds.width - 0.5
        : 0;
      state.aimY = inside
        ? (event.clientY - bounds.top) / bounds.height - 0.5
        : 0;
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", aim, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", aim);
    };
  }, [active, enabled, steps.length]);

  return (
    <div
      className={styles.process}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className={styles.picker} role="group" aria-label="Choose a step">
        {steps.map(({ title }, index) => (
          <button
            key={title}
            type="button"
            aria-pressed={active === index}
            aria-controls={`process-step-${index}`}
            onClick={() => setActive(index)}
          >
            <span className={styles.pickerNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            {title}
          </button>
        ))}
      </div>

      <div ref={stage} className={styles.stage}>
        <div className={styles.ring} aria-hidden="true" />
        <ol className={styles.cards}>
          {steps.map(({ title, description }, index) => (
            <li
              key={title}
              id={`process-step-${index}`}
              ref={(card) => {
                cards.current[index] = card;
              }}
              className={styles.card}
              data-active={active === index}
              onClick={() => setActive(index)}
            >
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
