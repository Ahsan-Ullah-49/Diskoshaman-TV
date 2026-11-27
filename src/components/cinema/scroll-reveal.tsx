"use client";

import { useRef, type ReactNode } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { gsap, useGSAP } from "@/lib/motion";

/**
 * Raises every `[data-reveal]` element inside it once, in a short stagger,
 * as the group enters the viewport. The markup is complete without it.
 */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const group = useRef<HTMLDivElement>(null);
  const { enabled } = useStudioMotion();

  useGSAP(
    () => {
      const root = group.current;
      if (!root) return;
      const items = root.querySelectorAll("[data-reveal]");
      if (!enabled) {
        gsap.set(items, { clearProps: "all" });
        return;
      }
      gsap.fromTo(
        items,
        { y: 48, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: root,
            start: "top 84%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: group, dependencies: [enabled], revertOnUpdate: true },
  );

  return (
    <div ref={group} className={className}>
      {children}
    </div>
  );
}
