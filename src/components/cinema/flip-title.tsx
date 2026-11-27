"use client";

import { useRef } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { gsap, useGSAP } from "@/lib/motion";
import styles from "./flip-title.module.css";

type FlipTitleProps = {
  as?: "h1" | "h2";
  id: string;
  /** Small gold label with a rule, shown above the title. */
  label?: string;
  /** Each word sits on its own line; the last one is set in gold. */
  words: readonly string[];
  size?: "display" | "section";
  align?: "start" | "center";
  /** Set the words side by side on one line instead of one per line. */
  oneLine?: boolean;
};

/**
 * The studio's signature title: a gold label, then large Big Shoulders words
 * whose letters flip up once as the title enters the viewport. The words are
 * read once by assistive technology; the letter spans are decorative.
 */
export function FlipTitle({
  as: Tag = "h2",
  id,
  label,
  words,
  size = "section",
  align = "start",
  oneLine = false,
}: FlipTitleProps) {
  const title = useRef<HTMLHeadingElement>(null);
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      const element = title.current;
      if (!element) return;
      const letters = element.querySelectorAll(`.${styles.letter}`);
      if (!enabled) {
        gsap.set(letters, { clearProps: "all" });
        return;
      }
      // Plays once on its own clock so it can never stop half way.
      gsap.fromTo(
        letters,
        { yPercent: 95, rotationX: -88, autoAlpha: 0 },
        {
          yPercent: 0,
          rotationX: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "back.out(1.4)",
          stagger: 0.03,
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: title, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <Tag
      ref={title}
      id={id}
      className={styles.title}
      data-size={size}
      data-align={align}
      data-line={oneLine || undefined}
    >
      {label && <span className={styles.label}>{label}</span>}
      <span className="visually-hidden">{words.join(" ")}</span>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={styles.word}
          data-accent={index === words.length - 1 && words.length > 1}
          aria-hidden="true"
        >
          {Array.from(word).map((letter, letterIndex) => (
            <span key={letterIndex} className={styles.letter}>
              {letter === " " ? " " : letter}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
