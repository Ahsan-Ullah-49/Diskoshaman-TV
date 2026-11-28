"use client";

import { useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { productionSteps } from "@/content/studio";
import { gsap, useGSAP } from "@/lib/motion";
import styles from "./services.module.css";

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Plan, shoot and deliver as a timeline. A line of light runs along the
 * track with scroll and each stage lights up as the line reaches it. With
 * motion off, the track shows full and every stage is lit.
 */
export function ProcessTimeline() {
  const timeline = useRef<HTMLOListElement>(null);
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      const root = timeline.current;
      if (!root) return;
      const fill = root.parentElement?.querySelector<HTMLElement>(
        `.${styles.trackFill}`,
      );
      const stages = gsap.utils.toArray<HTMLElement>(`.${styles.stage}`, root);
      if (!fill) return;
      if (!enabled) {
        gsap.set(fill, { clearProps: "all" });
        stages.forEach((stage) => (stage.dataset.lit = ""));
        return;
      }
      gsap.fromTo(
        fill,
        { "--progress": 0 },
        {
          "--progress": 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 0.6,
            onUpdate: ({ progress }) => {
              // Light each stage once the line has reached its marker.
              stages.forEach((stage, index) => {
                const reached =
                  progress >= index / Math.max(1, stages.length - 1) - 0.02;
                if (reached) stage.dataset.lit = "";
                else delete stage.dataset.lit;
              });
            },
          },
        },
      );
    },
    { scope: timeline, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <div className={styles.timeline}>
      <div className={styles.track} aria-hidden="true">
        <span className={styles.trackFill} />
      </div>
      <ol ref={timeline} className={styles.stages}>
        {productionSteps.map(({ title, description }, index) => (
          <li key={title} className={styles.stage}>
            <span className={styles.marker} aria-hidden="true">
              {number(index)}
            </span>
            <div className={styles.stageCard}>
              <p className={styles.stageLabel}>Stage {index + 1}</p>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
