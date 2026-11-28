"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { pages } from "@/content/site";
import { projects } from "@/content/projects";
import { embedUrl } from "@/features/work/vimeo-film";

const warmedKey = "diskoshaman-media-warmed";
const warmupDelay = 2500;
const warmupLifetime = 20000;

function slowConnection() {
  const { connection } = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return (
    Boolean(connection?.saveData) ||
    /(^|-)2g$/.test(connection?.effectiveType ?? "")
  );
}

/**
 * While a visitor reads the page they landed on, fetch what the Work page
 * needs ahead of time: its route code and one hidden, silent Vimeo player,
 * so the player's scripts are cached and the library's films start sooner.
 * Runs once per visit after the page has loaded and the browser is idle.
 * Skipped on data saver, on slow connections and where films already load.
 */
export function MediaWarmup() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let idle = 0;
    let warmFrame: HTMLIFrameElement | null = null;

    function warm() {
      if (cancelled) return;
      try {
        if (sessionStorage.getItem(warmedKey)) return;
        sessionStorage.setItem(warmedKey, "1");
      } catch {
        // Storage can be unavailable; warming twice is harmless.
      }
      router.prefetch(pages.work.path);
      if (slowConnection()) return;
      if (document.querySelector('iframe[src^="https://player.vimeo.com"]'))
        return;
      warmFrame = document.createElement("iframe");
      warmFrame.src = embedUrl(projects[0], { autoplay: false, muted: true });
      warmFrame.title = "";
      warmFrame.tabIndex = -1;
      warmFrame.setAttribute("aria-hidden", "true");
      warmFrame.style.cssText =
        "position:fixed;left:-20px;top:0;width:2px;height:2px;border:0;opacity:0;pointer-events:none";
      document.body.append(warmFrame);
      timer = window.setTimeout(() => warmFrame?.remove(), warmupLifetime);
    }

    function schedule() {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idle = window.requestIdleCallback(warm, { timeout: 4000 });
        } else {
          warm();
        }
      }, warmupDelay);
    }

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
      warmFrame?.remove();
    };
  }, [router]);

  return null;
}
