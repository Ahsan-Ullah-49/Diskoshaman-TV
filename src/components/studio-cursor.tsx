"use client";

import { useEffect, useRef } from "react";
import { useStudioMotion } from "./studio-motion";
import styles from "./studio-cursor.module.css";

const trailSizes = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5];
const actions =
  'a[href], button:enabled, summary, select:enabled, input:enabled, [role="button"], [role="link"], [data-cursor="hover"]';
const typingFields =
  'iframe, textarea, [contenteditable]:not([contenteditable="false"]), input:not([type]), input:is([type="text"],[type="search"],[type="url"],[type="tel"],[type="email"],[type="password"],[type="number"])';

export function StudioCursor() {
  const overlay = useRef<HTMLDivElement>(null);
  const hotspot = useRef<HTMLDivElement>(null);
  const { enabled } = useStudioMotion();

  useEffect(() => {
    const layer = overlay.current;
    const anchor = hotspot.current;
    if (!enabled || !layer || !anchor) return;

    const fine = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine)",
    );
    const trail = Array.from(
      layer.querySelectorAll<HTMLElement>("[data-trail]"),
      (dot) => ({ dot, x: 0, y: 0 }),
    );
    let x = 0,
      y = 0,
      frame = 0;
    let lastSample = -1;
    let visible = false;
    let activeDialog: Element | null = null;

    function settleTrail() {
      let aheadX = x,
        aheadY = y;
      for (const point of trail) {
        const dx = aheadX - point.x;
        const dy = aheadY - point.y;
        // Cap the gap when the pointer jumps across monitors or browser chrome.
        const lag = Math.min(0.6, 14 / (Math.hypot(dx, dy) || 1));
        point.x = aheadX - dx * lag;
        point.y = aheadY - dy * lag;
        point.dot.style.transform = `translate3d(${point.x}px,${point.y}px,0)`;
        aheadX = point.x;
        aheadY = point.y;
      }
      const moving = Math.hypot(x - aheadX, y - aheadY) > 0.6;
      layer?.toggleAttribute("data-trailing", moving);
      frame = moving ? requestAnimationFrame(settleTrail) : 0;
    }

    function hide() {
      visible = false;
      activeDialog = null;
      layer?.removeAttribute("data-visible");
      layer?.removeAttribute("data-interactive");
      layer?.removeAttribute("data-trailing");
      if (
        layer?.isConnected &&
        typeof layer.hidePopover === "function" &&
        layer.matches(":popover-open")
      ) {
        layer.hidePopover();
      }
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function showAt(target: Element) {
      if (!layer || target.closest(typingFields)) {
        hide();
        return;
      }
      const dialog = target.closest("dialog[open]");
      // A native dialog occupies the top layer. Keep the decorative ring above its links too.
      if (!visible || dialog !== activeDialog) {
        if (typeof layer.showPopover === "function") {
          if (layer.matches(":popover-open")) layer.hidePopover();
          layer.showPopover();
        }
        activeDialog = dialog;
        visible = true;
        layer.dataset.visible = "true";
      }
      const action = target.closest(actions);
      layer.toggleAttribute(
        "data-interactive",
        Boolean(action && !action.closest('[aria-disabled="true"], :disabled')),
      );
    }

    function move(event: PointerEvent) {
      if (
        !anchor ||
        event.pointerType !== "mouse" ||
        !fine.matches ||
        !(event.target instanceof Element)
      ) {
        hide();
        return;
      }
      // A coalesced pointermove can follow a newer raw sample. Never rewind the hotspot.
      const sample = event.getCoalescedEvents?.().at(-1) ?? event;
      if (sample.timeStamp < lastSample) return;
      lastSample = sample.timeStamp;
      const moved = sample.clientX !== x || sample.clientY !== y;
      x = sample.clientX;
      y = sample.clientY;
      if (!visible) {
        for (const point of trail) {
          point.x = x;
          point.y = y;
        }
      }
      // The dot and ring share this single transform, written directly from the native hotspot.
      anchor.style.transform = `translate3d(${x}px,${y}px,0)`;
      showAt(event.target);
      if (visible && moved && !frame)
        frame = requestAnimationFrame(settleTrail);
    }

    function rawMove(event: Event) {
      if (event instanceof PointerEvent) move(event);
    }
    function enter(event: PointerEvent) {
      if (
        visible &&
        event.pointerType === "mouse" &&
        event.target instanceof Element
      )
        showAt(event.target);
      else move(event);
    }
    function refreshHover() {
      if (!visible) return;
      const target = document.elementFromPoint(x, y);
      if (target) showAt(target);
      else hide();
    }
    function dialogChanged(event: Event) {
      if (event.target instanceof HTMLDialogElement) refreshHover();
    }

    const pointerOptions = { capture: true, passive: true };
    window.addEventListener("pointermove", move, pointerOptions);
    window.addEventListener("pointerrawupdate", rawMove, pointerOptions);
    document.addEventListener("pointerover", enter, { passive: true });
    document.addEventListener("scroll", refreshHover, {
      capture: true,
      passive: true,
    });
    document.addEventListener("toggle", dialogChanged, true);
    document.addEventListener("pointercancel", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    fine.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerrawupdate", rawMove, true);
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("scroll", refreshHover, true);
      document.removeEventListener("toggle", dialogChanged, true);
      document.removeEventListener("pointercancel", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      fine.removeEventListener("change", hide);
    };
  }, [enabled]);

  return (
    <div
      ref={overlay}
      popover="manual"
      inert
      className={styles.cursor}
      aria-hidden="true"
    >
      {trailSizes.map((size) => (
        <i
          key={size}
          data-trail
          className={styles.trail}
          style={{ width: size, height: size, opacity: size / 7 }}
        />
      ))}
      <div ref={hotspot} className={styles.hotspot}>
        <i className={styles.ring} />
        <i className={styles.dot} />
      </div>
    </div>
  );
}
