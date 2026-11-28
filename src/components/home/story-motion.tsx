"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { useStudioMotion } from "../studio-motion";
import styles from "./story.module.css";

const wideScreen = "(min-width: 60rem)";
const finePointer = "(hover: hover) and (pointer: fine)";

function select(scope: HTMLElement, className: string | undefined) {
  return scope.querySelector<HTMLElement>(`.${className}`);
}

/**
 * Drives the studio story's 3D scroll sequence. Every tween runs from an
 * offset state back to the stylesheet's layout, so reverting the context
 * (motion paused, reduced motion or unmount) leaves the finished composition.
 */
export function StoryMotion({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      if (!enabled) {
        // Reverting scrubbed tweens can leave their start values inline, so
        // clear every animated part and let the stylesheet show the finished section.
        const animatedParts = [
          styles.letter,
          styles.word,
          styles.reveal,
          styles.film,
          styles.rig,
          styles.beamLight,
          styles.marqueeTrack,
        ]
          .map((className) => `.${className}`)
          .join(",");
        gsap.set(root.querySelectorAll(animatedParts), { clearProps: "all" });
        return;
      }
      const set = select(root, styles.set);
      const rig = select(root, styles.rig);
      const film = select(root, styles.film);
      const beam = select(root, styles.beamLight);
      const lead = select(root, styles.lead);
      const marquee = select(root, styles.marqueeTrack);
      const letters = root.querySelectorAll(`.${styles.letter}`);
      const words = root.querySelectorAll(`.${styles.word}`);
      const reveals = gsap.utils.toArray<HTMLElement>(
        `.${styles.reveal}`,
        root,
      );
      if (!set || !rig || !film || !beam || !lead) return;

      // Title letters flip up out of the floor with scroll, and fold away
      // again when the visitor scrolls back up.
      gsap.fromTo(
        letters,
        { yPercent: 95, rotationX: -88, autoAlpha: 0 },
        {
          yPercent: 0,
          rotationX: 0,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.045,
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            end: "top 28%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );

      if (marquee) {
        gsap.fromTo(
          marquee,
          { xPercent: 0 },
          {
            xPercent: -34,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      // The story brightens word by word as it scrolls up the screen.
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: lead,
            start: "top 85%",
            end: "bottom 55%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      reveals.forEach((element) => {
        gsap.fromTo(
          element,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 94%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // SiteScroll re-measures every scene once a newly opened page settles,
      // so the scrubbed title and words never keep positions from the page
      // that was just left.

      const screens = gsap.matchMedia();
      screens.add(
        { wide: wideScreen, pointer: finePointer },
        ({ conditions }) => {
          const wide = Boolean(conditions?.wide);

          // The portrait starts deep and tilted, then dollies forward to face
          // the visitor as the section settles under the header.
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: wide ? root : set,
                start: wide ? "top 92%" : "top 96%",
                end: wide ? "top 12%" : "center 58%",
                scrub: 0.7,
              },
            })
            .fromTo(
              film,
              {
                rotationX: wide ? 30 : 22,
                rotationY: wide ? -22 : -10,
                z: wide ? -520 : -240,
                yPercent: wide ? 12 : 8,
              },
              { rotationX: 0, rotationY: 0, z: 0, yPercent: 0, duration: 1 },
              0,
            )
            .fromTo(
              beam,
              { opacity: 0, scaleY: 0.35 },
              { opacity: 1, scaleY: 1, duration: 0.7 },
              0.3,
            );

          // A fine pointer lets the visitor lean the film. The player keeps
          // the pointer once it is over the embed.
          if (!conditions?.pointer) return;
          const tiltX = gsap.quickTo(rig, "rotationX", {
            duration: 0.9,
            ease: "power3.out",
          });
          const tiltY = gsap.quickTo(rig, "rotationY", {
            duration: 0.9,
            ease: "power3.out",
          });
          const lean = (event: PointerEvent) => {
            const bounds = set.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            tiltY(gsap.utils.clamp(-0.6, 0.6, x) * 14);
            tiltX(gsap.utils.clamp(-0.6, 0.6, y) * -9);
          };
          const settle = () => {
            tiltX(0);
            tiltY(0);
          };
          root.addEventListener("pointermove", lean);
          root.addEventListener("pointerleave", settle);
          return () => {
            root.removeEventListener("pointermove", lean);
            root.removeEventListener("pointerleave", settle);
          };
        },
      );

      return () => {
        screens.revert();
      };
    },
    { scope: section, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <section
      ref={section}
      id="our-story"
      className={styles.story}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
