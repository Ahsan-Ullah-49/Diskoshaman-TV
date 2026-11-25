"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { useStudioMotion } from "./studio-motion";

export function SiteScroll() {
  const { enabled } = useStudioMotion();
  const pathname = usePathname();
  const active = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const scroll = new Lenis({
      duration: 1.65,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    active.current = scroll;
    const tick = (seconds: number) => scroll.raf(seconds * 1000);
    scroll.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);

    // Stop outstanding wheel momentum as soon as the native phone menu opens.
    const menu = document.querySelector("dialog[data-mobile-navigation]");
    const syncMenu = () => {
      if (menu?.hasAttribute("open")) scroll.stop();
      else scroll.start();
    };
    const observer = new MutationObserver(syncMenu);
    if (menu)
      observer.observe(menu, { attributes: true, attributeFilter: ["open"] });
    syncMenu();
    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      scroll.off("scroll", ScrollTrigger.update);
      scroll.destroy();
      active.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    // Next restores the actual document position on navigation and browser history.
    const frame = requestAnimationFrame(() => {
      active.current?.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
