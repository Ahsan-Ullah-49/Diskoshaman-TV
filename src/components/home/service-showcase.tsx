"use client";

import Link from "next/link";
import { useRef } from "react";
import { StudioCamera } from "@/components/cinema/studio-camera";
import { useStudioMotion } from "@/components/studio-motion";
import type { HomeService } from "@/features/services/service-pages";
import { gsap, useGSAP } from "@/lib/motion";
import styles from "./service-showcase.module.css";

const heading = { label: "What we make", words: ["Production", "Services"] };

/** The home services index beside the production camera. */
export function ServiceShowcase({
  services,
}: {
  services: readonly HomeService[];
}) {
  const section = useRef<HTMLDivElement>(null);
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const heading = root.querySelector<HTMLElement>(`.${styles.heading}`);
      const label = root.querySelector<HTMLElement>(`.${styles.headingLabel}`);
      const camera = root.querySelector<HTMLElement>(`.${styles.camera}`);
      const letters = root.querySelectorAll(`.${styles.letter}`);
      const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`, root);
      const animated = [...letters, ...rows, label, camera].filter(
        (element): element is Element => Boolean(element),
      );
      if (!enabled) {
        gsap.set(animated, { clearProps: "all" });
        return;
      }
      if (!heading) return;

      // Everything here follows the scrollbar, so the section keeps moving
      // with the visitor instead of playing once and standing still.
      if (label) {
        gsap.fromTo(
          label,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: heading,
              start: "top 92%",
              end: "top 66%",
              scrub: true,
            },
          },
        );
      }

      // Letters flip up out of each line's mask, like the studio story's name.
      gsap.fromTo(
        letters,
        { yPercent: 95, rotationX: -88, autoAlpha: 0 },
        {
          yPercent: 0,
          rotationX: 0,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: heading,
            start: "top 90%",
            end: "bottom 58%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );

      // Each service tips up into place as it reaches the lower third. Opacity
      // only, never visibility, so keyboard users can still tab to every link.
      rows.forEach((row) => {
        gsap.fromTo(
          row,
          {
            opacity: 0,
            xPercent: -5,
            rotationX: -55,
            transformPerspective: 900,
            transformOrigin: "50% 0%",
          },
          {
            opacity: 1,
            xPercent: 0,
            rotationX: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 97%",
              end: "top 74%",
              scrub: 0.6,
            },
          },
        );
      });
    },
    { scope: section, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    // data-camera-track lets the camera assemble across this whole block on wide screens.
    <div className={styles.showcase} ref={section} data-camera-track="">
      <h2 id="home-services-title" className={styles.heading}>
        <span className={styles.headingLabel}>{heading.label}</span>
        <span className="visually-hidden">{heading.words.join(" ")}</span>
        {heading.words.map((word) => (
          <span key={word} className={styles.headingWord} aria-hidden="true">
            {Array.from(word).map((letter, index) => (
              <span key={index} className={styles.letter}>
                {letter}
              </span>
            ))}
          </span>
        ))}
      </h2>

      {/* Phones read heading, camera, then services; wide screens keep the camera beside the list. */}
      <div className={styles.camera}>
        <StudioCamera />
      </div>

      <ol className={styles.list}>
        {services.map((service, index) => (
          <li key={service.slug} className={styles.row}>
            <Link href={service.path} className={styles.link}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.text}>
                <span className={styles.name}>{service.label}</span>
                <span className={styles.short}>{service.short}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
