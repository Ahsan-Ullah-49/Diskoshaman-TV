"use client";

import type { RefObject } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { gsap, useGSAP } from "@/lib/motion";

export function FeaturedPosterMotion({
  section,
}: {
  section: RefObject<HTMLElement | null>;
}) {
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      if (!enabled || !section.current) return;
      const match = gsap.matchMedia();
      match.add(
        {
          desktop: "(min-width: 48rem)",
          phone: "(max-width: 47.999rem)",
        },
        ({ conditions }) => {
          const desktop = conditions?.desktop;
          // The still composition remains the finished frame when this cut is reverted.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section.current,
                start: "top 96%",
                end: desktop ? "top 29%" : "top 46%",
                scrub: 0.65,
              },
            })
            .fromTo(
              "[data-film-screen]",
              {
                clipPath: desktop
                  ? "inset(9% 11% 9% 11% round 1.3rem)"
                  : "inset(3% 3% 3% 3% round 0.8rem)",
                scale: desktop ? 0.89 : 0.98,
                y: desktop ? 46 : 16,
              },
              {
                clipPath: "inset(0% 0% 0% 0% round 0.7rem)",
                scale: 1,
                y: 0,
                ease: "none",
              },
            )
            .set("[data-film-screen]", { clearProps: "clipPath" }, 1);

          if (desktop) {
            gsap.from("[data-film-side]", {
              y: 58,
              scale: 0.92,
              opacity: 0.3,
              scrollTrigger: {
                trigger: section.current,
                start: "top 91%",
                end: "top 32%",
                scrub: 0.65,
              },
            });
          }
        },
      );
      return () => match.revert();
    },
    { scope: section, dependencies: [enabled], revertOnUpdate: true },
  );

  return null;
}
