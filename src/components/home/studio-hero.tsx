"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { heroCopy, heroReel } from "@/content/home";
import { pages, showreelPoster } from "@/content/site";
import { gsap, useGSAP } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import { MotionToggle, useStudioMotion } from "../studio-motion";
import { SocialViews } from "./social-views";
import styles from "./hero.module.css";

function StudioSignature({ playing }: { playing: boolean }) {
  const text = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const output = text.current;
      if (!output || !playing) return;
      const signature = heroCopy.signature;
      const progress = { letters: 0 };
      const write = () => {
        const next = signature.slice(0, Math.round(progress.letters));
        if (output.textContent !== next) output.textContent = next;
      };
      write();
      const typing = gsap.timeline({ repeat: -1, repeatDelay: 0.48 });
      typing
        .to(progress, {
          letters: signature.length,
          duration: 1.18,
          ease: "none",
          onUpdate: write,
        })
        .to(
          progress,
          { letters: 0, duration: 0.68, ease: "none", onUpdate: write },
          "+=2.4",
        );
      return () => {
        output.textContent = signature;
      };
    },
    { scope: text, dependencies: [playing], revertOnUpdate: true },
  );
  return (
    <span className={styles.signature}>
      <span className="visually-hidden">{heroCopy.signature}</span>
      <span className={styles.signatureMeasure} aria-hidden="true">
        {heroCopy.signature}
      </span>
      <span className={styles.typed} aria-hidden="true">
        <span ref={text}>{heroCopy.signature}</span>
      </span>
    </span>
  );
}

function Headline({ playing }: { playing: boolean }) {
  const slot = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!playing || !slot.current) return;
      const words = Array.from(slot.current.children);
      if (words.length < 2) return;
      const cycle = gsap.timeline({ repeat: -1 });
      words.forEach((word, index) => {
        const next = words[(index + 1) % words.length];
        cycle
          .to(word, { autoAlpha: 0, duration: 0.16, ease: "sine.in" }, "+=2.45")
          .to(next, { autoAlpha: 1, duration: 0.22, ease: "sine.out" });
      });
    },
    { scope: slot, dependencies: [playing], revertOnUpdate: true },
  );

  return (
    <h1 id="home-title" className={styles.title}>
      <span className="visually-hidden">
        {heroCopy.headline} {heroCopy.endings[0]}
      </span>
      <span className={styles.lead} aria-hidden="true">
        {heroCopy.headline}
      </span>{" "}
      <span ref={slot} className={styles.wordSlot} aria-hidden="true">
        {heroCopy.endings.map((word) => (
          <span key={word} className={styles.word}>
            {word}
          </span>
        ))}
      </span>
    </h1>
  );
}

export function StudioHero() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useVisible(section);
  const { enabled, setEnabled } = useStudioMotion();
  const playing = enabled && visible;

  const playReel = useCallback(() => {
    const reel = video.current;
    if (!reel) return;
    // Choose one encode when playback starts. Resizing should never download the film again.
    if (!reel.hasAttribute("src")) {
      reel.src = window.matchMedia(
        "(max-width: 47.99rem) and (orientation: portrait)",
      ).matches
        ? heroReel.mobile
        : heroReel.desktop;
    }
    void reel.play().catch((error: DOMException) => {
      if (error.name === "NotAllowedError") setEnabled(false);
    });
  }, [setEnabled]);

  useEffect(() => {
    const reel = video.current;
    if (!reel) return;
    if (playing) playReel();
    else reel.pause();
    return () => reel.pause();
  }, [playing, playReel]);

  return (
    <section ref={section} className={styles.hero} aria-labelledby="home-title">
      <div className={styles.film} aria-hidden="true">
        <Image src={showreelPoster.src} alt="" fill sizes="100vw" preload />
        <video
          ref={video}
          muted
          playsInline
          loop
          preload="none"
          tabIndex={-1}
          onPlaying={(event) => {
            event.currentTarget.dataset.ready = "true";
          }}
          onError={(event) => {
            delete event.currentTarget.dataset.ready;
          }}
        />
      </div>
      <div className={styles.copy}>
        <Headline playing={playing} />
        <p className={styles.description}>{heroCopy.description}</p>
        <StudioSignature playing={playing} />
        <div className={styles.actions}>
          <Link
            className="button button-cinematic button-gold"
            href={pages.work.path}
          >
            Our Work <span aria-hidden="true">↗</span>
          </Link>
          <Link
            className="button button-cinematic button-glass"
            href={pages.contact.path}
          >
            Contact Us <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className={styles.foot}>
        <SocialViews enabled={enabled} />
        <MotionToggle className={styles.playback} onPlay={playReel} />
      </div>
    </section>
  );
}
