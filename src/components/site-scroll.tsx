"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { useStudioMotion } from "./studio-motion";

// Wait this long after the last layout change before re-measuring scroll scenes.
const refreshDelay = 160;

export function SiteScroll() {
  const { enabled } = useStudioMotion();
  const pathname = usePathname();
  const active = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // A long exponential glide, as on premium automotive sites: each wheel
    // movement eases out over about one and a half seconds. Touch keeps the
    // phone's native scrolling.
    const scroll = new Lenis({
      duration: 1.55,
      easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    active.current = scroll;
    const tick = (seconds: number) => scroll.raf(seconds * 1000);
    scroll.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    // Lenis drives scrolling from GSAP's ticker; lag smoothing would make the
    // page jump after a slow frame, so keep the two in lockstep.
    gsap.ticker.lagSmoothing(0);

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
      gsap.ticker.lagSmoothing(500, 33);
      scroll.off("scroll", ScrollTrigger.update);
      scroll.destroy();
      active.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    // Re-measure every scroll scene once the page has settled. Each refresh is
    // costly, so bursts of changes (navigation, fonts, images and 3D scenes
    // that load late and change the page height) are coalesced into one.
    let timer = 0;
    let measuredHeight = document.documentElement.scrollHeight;
    const remeasure = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        active.current?.resize();
        ScrollTrigger.refresh();
        measuredHeight = document.documentElement.scrollHeight;
      }, refreshDelay);
    };
    remeasure();
    void document.fonts?.ready.then(remeasure);
    window.addEventListener("load", remeasure);

    // Content that loads late above a pinned scene moves it; measure again,
    // but ignore the small changes that a refresh itself can make.
    const growth = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      if (Math.abs(height - measuredHeight) > 24) remeasure();
    });
    growth.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", remeasure);
      growth.disconnect();
    };
  }, [pathname]);

  return null;
}
