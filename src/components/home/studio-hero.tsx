"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroCopy, heroReel } from "@/content/home";
import { pages, showreelPoster } from "@/content/site";
import { gsap, useGSAP } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import { PillLink } from "../pill-link";
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

/** Re-measure the headline endings after fonts load and when the viewport settles. */
function useLayoutVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let timer = 0;
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVersion((value) => value + 1), 180);
    };
    void document.fonts?.ready.then(bump);
    window.addEventListener("resize", bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", bump);
    };
  }, []);
  return version;
}

function Headline({ playing }: { playing: boolean }) {
  const slot = useRef<HTMLSpanElement>(null);
  const layoutVersion = useLayoutVersion();

  useGSAP(
    () => {
      const holder = slot.current;
      if (!playing || !holder) return;
      const words = Array.from(holder.children) as HTMLElement[];
      if (words.length < 2) return;
      const lettersOf = (word: HTMLElement) => word.children;
      const widths = words.map((word) => word.offsetWidth);

      // The slot follows the current word's width so the line stays centred.
      gsap.set(holder, { width: widths[0] });
      gsap.set(words.slice(1), { autoAlpha: 1 });
      words.slice(1).forEach((word) => {
        gsap.set(lettersOf(word), { rotationX: -95, opacity: 0 });
      });

      // Each ending tips its letters up and away while the next flips up from below.
      // The cycle ends on the first word again, so each repeat starts with a full hold.
      const cycle = gsap.timeline({ repeat: -1 });
      words.forEach((word, index) => {
        const nextIndex = (index + 1) % words.length;
        const next = words[nextIndex];
        cycle
          .to(
            lettersOf(word),
            {
              rotationX: 95,
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
              stagger: 0.028,
            },
            "+=2.3",
          )
          .fromTo(
            lettersOf(next),
            { rotationX: -95, opacity: 0 },
            {
              rotationX: 0,
              opacity: 1,
              duration: 0.72,
              ease: "back.out(1.7)",
              stagger: 0.034,
              // Without this, the closing flip back to the first word would hide it at the start.
              immediateRender: false,
            },
            "<0.22",
          )
          .to(
            holder,
            { width: widths[nextIndex], duration: 0.62, ease: "power3.inOut" },
            "<",
          );
      });
    },
    {
      scope: slot,
      dependencies: [playing, layoutVersion],
      revertOnUpdate: true,
    },
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
            {Array.from(word).map((letter, index) => (
              <span key={index} className={styles.wordLetter}>
                {letter}
              </span>
            ))}
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
        <p className={styles.eyebrow}>{pages.home.title}</p>
        <Headline playing={playing} />
        <p className={styles.description}>{heroCopy.description}</p>
        <StudioSignature playing={playing} />
        <div className={styles.actions}>
          <PillLink href={pages.work.path}>Our Work</PillLink>
          <PillLink href={pages.contact.path} variant="secondary" arrow="right">
            Contact Us
          </PillLink>
        </div>
      </div>
      <div className={styles.foot}>
        <SocialViews enabled={enabled} />
        <a href="#our-story" className={styles.scrollCue}>
          <span className={styles.scrollTrack} aria-hidden="true">
            <span className={styles.scrollDot} />
          </span>
          Scroll
        </a>
        <MotionToggle className={styles.playback} onPlay={playReel} />
      </div>
    </section>
  );
}
