"use client";

import { useLayoutEffect, useRef } from "react";
import { socialViews } from "@/content/home";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import styles from "./hero.module.css";

type Platform = (typeof socialViews)[number]["platform"];

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M23 7.3a3 3 0 0 0-2.1-2.1C19.1 4.7 12 4.7 12 4.7s-7.1 0-8.9.5A3 3 0 0 0 1 7.3a27 27 0 0 0-.5 4.8 27 27 0 0 0 .5 4.8A3 3 0 0 0 3.1 19c1.8.5 8.9.5 8.9.5s7.1 0 8.9-.5a3 3 0 0 0 2.1-2.1 27 27 0 0 0 .5-4.8 27 27 0 0 0-.5-4.8ZM9.7 15.4V8.8l6.1 3.3-6.1 3.3Z"
        />
      </svg>
    );
  }
  if (platform === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.6 1c.4 2.8 2 4.6 5 4.9v3.7c-1.9 0-3.6-.5-5-1.5v7.6a7 7 0 1 1-6.9-7v3.8a3.2 3.2 0 1 0 3.1 3.2V1h3.8Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5.2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function SocialViews({ enabled }: { enabled: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  const setCountingEnabled = useRef<((value: boolean) => void) | null>(null);

  useGSAP(
    () => {
      const element = list.current;
      if (!element) return;
      const numbers = Array.from(
        element.querySelectorAll<HTMLElement>("[data-count]"),
      );
      const progress = { value: 0 };
      function render() {
        numbers.forEach((number, index) => {
          const { millions, decimals } = socialViews[index];
          const next = String(
            Number((millions * progress.value).toFixed(decimals)),
          );
          if (number.textContent !== next) number.textContent = next;
        });
      }
      const count = gsap.to(progress, {
        value: 1,
        duration: 2.7,
        ease: "sine.inOut",
        paused: true,
        onUpdate: render,
      });
      let active = false;
      let hasPlayed = false;
      function replay() {
        hasPlayed = true;
        count.pause(0);
        render();
        count.play();
      }
      let armed = false;
      let leaveAt = Infinity;
      let returnAt = 0;
      let stripTop = 0;
      let stripHeight = 0;
      const measure = () => {
        const rect = element.getBoundingClientRect();
        stripTop = rect.top + window.scrollY;
        stripHeight = rect.height;
        const headerHeight =
          document.querySelector("header")?.offsetHeight ?? 0;
        const pastStrip = rect.bottom + window.scrollY - headerHeight;
        const max = ScrollTrigger.maxScroll(window);
        // A short page may reach its footer before the numbers can leave the viewport.
        leaveAt = max >= pastStrip ? pastStrip : max * 0.82;
        returnAt =
          max >= pastStrip ? pastStrip - rect.height * 0.7 : max * 0.23;
        if (max < 40) leaveAt = Infinity;
      };
      function update() {
        if (!active) return;
        const y = window.scrollY;
        const visible =
          stripTop + stripHeight * 0.35 < y + window.innerHeight &&
          stripTop + stripHeight > y;
        if (y >= leaveAt) armed = true;
        if (visible && (!hasPlayed || (armed && y <= returnAt))) {
          armed = false;
          replay();
        }
      }
      measure();
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: update,
        onRefresh() {
          measure();
          update();
        },
      });
      // Keep the tween for this page visit so a pause or theme change cannot reset its digits.
      setCountingEnabled.current = (next) => {
        active = next;
        armed = false;
        if (active) update();
        else if (hasPlayed) count.progress(1).pause();
      };
      return () => {
        setCountingEnabled.current = null;
      };
    },
    { scope: list },
  );

  useLayoutEffect(() => {
    setCountingEnabled.current?.(enabled);
  }, [enabled]);

  return (
    <ul ref={list} className={styles.metrics} aria-label="Social media views">
      {socialViews.map(({ platform, millions }) => (
        <li key={platform}>
          <span className={styles.platformIcon} aria-hidden="true">
            <PlatformIcon platform={platform} />
          </span>
          <div className={styles.metricText} aria-hidden="true">
            <strong className={styles.count}>
              <span className={styles.countMeasure}>{millions}+</span>
              <span className={styles.countValue}>
                <span className={styles.staticValue}>{millions}</span>
                <span className={styles.animatedValue} data-count>
                  0
                </span>
                +
              </span>
            </strong>
            <span className={styles.metricLabel}>Million views</span>
          </div>
          <span className="visually-hidden">
            {platform}, {millions} million or more views
          </span>
        </li>
      ))}
    </ul>
  );
}
