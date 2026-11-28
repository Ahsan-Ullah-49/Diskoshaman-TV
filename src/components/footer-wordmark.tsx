"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/motion";
import styles from "./site-footer.module.css";

const name = site.name.replace(/\s*TV$/, "");
const suffix = "TV";

function Letters() {
  return (
    <>
      {[...name].map((letter, index) => (
        <span key={index} className={styles.wordLetter}>
          {letter}
        </span>
      ))}
      <span className={`${styles.wordLetter} ${styles.wordSuffix}`}>
        {suffix[0]}
      </span>
      <span className={styles.wordLetter}>{suffix[1]}</span>
    </>
  );
}

/**
 * The oversized studio wordmark at the foot of every page. Its letters rise
 * into place one after another as the visitor scrolls to the end of the page.
 * A fine pointer carries a gold spotlight across it; otherwise a slow light
 * sweeps by itself. Purely decorative: the studio name is linked above it.
 */
export function FooterWordmark() {
  const mark = useRef<HTMLDivElement>(null);
  const spot = useRef({ x: 50, y: 50, targetX: 50, targetY: 50, frame: 0 });
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const current = spot.current;
    return () => cancelAnimationFrame(current.frame);
  }, []);

  // Scrub the letters up from below the band as the footer reaches the end of the page.
  useGSAP(
    () => {
      const element = mark.current;
      if (!element || !enabled) return;
      const layers = [...element.children].map((layer) => [
        ...layer.querySelectorAll<HTMLElement>(`.${styles.wordLetter}`),
      ]);
      const count = layers[0]?.length ?? 0;
      if (!count) return;
      gsap.fromTo(
        layers.flat(),
        { yPercent: 105 },
        {
          yPercent: 0,
          ease: "power3.out",
          // Both stacked layers share one stagger so the gold stays on its letter.
          stagger: (index) => (index % count) * 0.06,
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { dependencies: [enabled], scope: mark },
  );

  // Ease the spotlight toward the pointer on every frame instead of
  // restarting a CSS transition on each pointer event, which made it stutter.
  function glide() {
    const element = mark.current;
    const current = spot.current;
    if (!element) return;
    current.x += (current.targetX - current.x) * 0.2;
    current.y += (current.targetY - current.y) * 0.2;
    element.style.setProperty("--spot-x", `${current.x.toFixed(2)}%`);
    element.style.setProperty("--spot-y", `${current.y.toFixed(2)}%`);
    const settled =
      Math.abs(current.targetX - current.x) < 0.05 &&
      Math.abs(current.targetY - current.y) < 0.05;
    current.frame = settled ? 0 : requestAnimationFrame(glide);
  }

  function follow(event: PointerEvent<HTMLDivElement>) {
    const element = mark.current;
    if (!element || event.pointerType !== "mouse") return;
    const bounds = element.getBoundingClientRect();
    const current = spot.current;
    current.targetX = ((event.clientX - bounds.left) / bounds.width) * 100;
    current.targetY = ((event.clientY - bounds.top) / bounds.height) * 100;
    if (!("lit" in element.dataset)) {
      // Start the light where the pointer enters rather than sliding in from the last spot.
      current.x = current.targetX;
      current.y = current.targetY;
      element.dataset.lit = "";
    }
    if (!current.frame) current.frame = requestAnimationFrame(glide);
  }

  function release() {
    delete mark.current?.dataset.lit;
  }

  return (
    <div
      ref={mark}
      className={styles.wordmark}
      aria-hidden="true"
      onPointerMove={follow}
      onPointerLeave={release}
    >
      <span className={styles.wordBase}>
        <Letters />
      </span>
      <span className={styles.wordLit}>
        <Letters />
      </span>
    </div>
  );
}
