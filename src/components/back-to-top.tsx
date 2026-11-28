"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./site-footer.module.css";

const holdDelay = 450;
const hintDuration = 1400;

/**
 * Return to the top of the page and hand keyboard focus back to the main
 * content. On phones only the arrow shows; pressing and holding it shows its
 * name, like a long press on an app icon, without leaving the page.
 */
export function BackToTop() {
  const [hint, setHint] = useState(false);
  const holdTimer = useRef(0);
  const hideTimer = useRef(0);
  const held = useRef(false);

  useEffect(
    () => () => {
      window.clearTimeout(holdTimer.current);
      window.clearTimeout(hideTimer.current);
    },
    [],
  );

  function goToTop() {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }

  function endHold() {
    window.clearTimeout(holdTimer.current);
    if (!held.current) return;
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setHint(false), hintDuration);
  }

  return (
    <button
      type="button"
      className={styles.top}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        held.current = false;
        window.clearTimeout(holdTimer.current);
        holdTimer.current = window.setTimeout(() => {
          held.current = true;
          window.clearTimeout(hideTimer.current);
          setHint(true);
        }, holdDelay);
      }}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      // Keep the browser's long-press menu from covering the hint.
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        // A long press only names the button; a tap or keyboard press acts.
        if (held.current && event.detail !== 0) {
          held.current = false;
          return;
        }
        goToTop();
      }}
    >
      <span className={styles.topLabel}>Back to top</span>
      <span className={styles.topIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </span>
      <span className={styles.topHint} data-shown={hint} aria-hidden="true">
        Back to top
      </span>
    </button>
  );
}
