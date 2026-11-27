"use client";

import { useRef, type PointerEvent } from "react";
import { site } from "@/content/site";
import styles from "./site-footer.module.css";

/**
 * The oversized studio wordmark at the foot of every page. A fine pointer
 * carries a gold spotlight across it; otherwise a slow light sweeps by itself.
 * Purely decorative: the studio name is already linked above it.
 */
export function FooterWordmark() {
  const mark = useRef<HTMLDivElement>(null);
  const [name, suffix] = [site.name.replace(/\s*TV$/, ""), "TV"];

  function follow(event: PointerEvent<HTMLDivElement>) {
    const element = mark.current;
    if (!element || event.pointerType !== "mouse") return;
    const bounds = element.getBoundingClientRect();
    element.style.setProperty(
      "--spot-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    element.style.setProperty(
      "--spot-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
    element.dataset.lit = "";
  }

  function release() {
    delete mark.current?.dataset.lit;
  }

  const letters = (
    <>
      {name}
      <span>{suffix}</span>
    </>
  );

  return (
    <div
      ref={mark}
      className={styles.wordmark}
      aria-hidden="true"
      onPointerMove={follow}
      onPointerLeave={release}
    >
      <span className={styles.wordBase}>{letters}</span>
      <span className={styles.wordLit}>{letters}</span>
    </div>
  );
}
