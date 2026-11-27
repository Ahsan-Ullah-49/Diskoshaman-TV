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
      const letters = root.querySelectorAll(`.${styles.letter}`);
      const rows = root.querySelectorAll(`.${styles.row}`);
      if (!enabled) {
        gsap.set([...letters, ...rows], { clearProps: "all" });
        return;
      }
      // Plays once on entry on its own clock, so it always finishes cleanly.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        })
        .fromTo(
          letters,
          { yPercent: 95, rotationX: -88, autoAlpha: 0 },
          {
            yPercent: 0,
            rotationX: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "back.out(1.4)",
            stagger: 0.035,
          },
        )
        .fromTo(
          rows,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.08,
          },
          "<0.3",
        );
    },
    { scope: section, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <div className={styles.showcase} ref={section}>
      <div className={styles.copy}>
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

      <div className={styles.camera}>
        <StudioCamera />
      </div>
    </div>
  );
}
