"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import type { StudioCameraScene } from "./studio-camera-scene";
import styles from "./studio-camera.module.css";

const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;
// After a tap on a touch screen the camera stays "focused" this long.
const touchFocusMs = 1400;

/**
 * The production camera. It arrives in pieces and assembles, then the studio
 * emblem rises out of its lens and turns. Lower on a page it assembles with
 * scroll; at the top of a page ("load") it assembles by itself once ready.
 * With motion on, hover focuses the lens and a click or tap takes a picture.
 * Without WebGL the studio logo stands in, with the same copy and links around it.
 */
export function StudioCamera({
  assemble = "scroll",
}: {
  assemble?: "scroll" | "load";
}) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<StudioCameraScene | null>(null);
  const assembly = useRef(0);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const enabledRef = useRef(enabled);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shots, setShots] = useState(0);

  // Scroll drives the assembly. With motion paused the camera is shown whole.
  useEffect(() => {
    enabledRef.current = enabled;
    const host = stage.current;
    if (!host) return;
    if (!enabled) {
      assembly.current = 1;
      scene.current?.setAssembly(1);
      scene.current?.setRunning(false);
      return;
    }
    scene.current?.setRunning(visible);
    const update = (progress: number) => {
      assembly.current = progress;
      scene.current?.setAssembly(progress);
    };

    if (assemble === "load") {
      // Wait for the scene so the visitor actually sees the parts come together.
      if (!mounted) return;
      const proxy = { progress: assembly.current };
      const tween = gsap.to(proxy, {
        progress: 1,
        duration: 2.4,
        delay: 0.3,
        ease: "power2.inOut",
        onUpdate: () => update(proxy.progress),
      });
      return () => {
        tween.kill();
      };
    }

    // The camera waits in pieces until the visitor has arrived, then holds
    // still on screen while the next stretch of scrolling builds it, so the
    // whole assembly is seen before the page moves on. On wide screens the
    // parent marked data-camera-track is held, keeping the list beside it;
    // on phones only the camera's own frame is held, centred.
    const track = host.closest<HTMLElement>("[data-camera-track]");
    const frame = host.parentElement ?? host;
    const screens = gsap.matchMedia();
    screens.add(
      { wide: "(min-width: 51rem)", narrow: "(max-width: 50.99rem)" },
      ({ conditions }) => {
        const held = conditions?.wide && track ? track : frame;
        const headerOffset = () =>
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--header-height",
            ),
          ) * 16 || 80;
        ScrollTrigger.create({
          trigger: held,
          // Centre the held block, or keep it just under the header when it is taller than the space left.
          start: () =>
            held.offsetHeight + headerOffset() < window.innerHeight
              ? "center center+=" + headerOffset() / 2
              : "top top+=" + headerOffset(),
          end: () => "+=" + Math.round(window.innerHeight * 0.8),
          pin: held,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => update(progress),
          onRefresh: ({ progress }) => update(progress),
        });
      },
    );
    return () => screens.revert();
  }, [assemble, enabled, mounted, visible]);

  // Pointer and tap interaction. Only wired while motion is on, so a paused
  // or reduced-motion page keeps a still camera.
  useEffect(() => {
    const host = stage.current;
    if (!host || !enabled || !mounted) return;
    let release = 0;

    const aim = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = host.getBoundingClientRect();
      scene.current?.aim(
        (event.clientX - bounds.left) / bounds.width - 0.5,
        (event.clientY - bounds.top) / bounds.height - 0.5,
      );
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      scene.current?.setHover(true);
      setFocused(true);
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      scene.current?.setHover(false);
      setFocused(false);
    };
    // Click rather than pointerdown, so a touch that starts a scroll never fires.
    const shoot = (event: MouseEvent) => {
      const touch =
        event instanceof PointerEvent && event.pointerType !== "mouse";
      if (touch) {
        scene.current?.setHover(true);
        setFocused(true);
        window.clearTimeout(release);
        release = window.setTimeout(() => {
          scene.current?.setHover(false);
          setFocused(false);
        }, touchFocusMs);
      }
      scene.current?.fire();
      setShots((count) => count + 1);
    };

    host.addEventListener("pointermove", aim);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("click", shoot);
    return () => {
      window.clearTimeout(release);
      host.removeEventListener("pointermove", aim);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("click", shoot);
      scene.current?.setHover(false);
      setFocused(false);
    };
  }, [enabled, mounted]);

  // Mount the scene once the camera is first near the viewport.
  useEffect(() => {
    const host = stage.current;
    const surface = canvas.current;
    if (!host || !surface || !visible || scene.current) return;
    const controller = new AbortController();
    void import("./studio-camera-scene")
      .then(({ mountStudioCamera }) =>
        mountStudioCamera(host, surface, controller.signal),
      )
      .then((mounted) => {
        if (controller.signal.aborted) {
          mounted.dispose();
          return;
        }
        scene.current = mounted;
        mounted.setAssembly(enabledRef.current ? assembly.current : 1);
        mounted.setRunning(enabledRef.current);
        setMounted(true);
      })
      .catch(() => {
        // The logo fallback stays in place when WebGL is unavailable.
      });
    return () => controller.abort();
  }, [visible]);

  useEffect(
    () => () => {
      scene.current?.dispose();
      scene.current = null;
    },
    [],
  );

  const interactive = enabled && mounted;

  return (
    <div
      className={styles.stage}
      ref={stage}
      aria-hidden="true"
      data-interactive={interactive ? "" : undefined}
      data-focused={interactive && focused ? "" : undefined}
    >
      <div className={styles.fallback}>
        <Image
          src="/brand/studio-logo.png"
          alt=""
          width={600}
          height={600}
          sizes="(min-width: 51rem) 28rem, 70vw"
        />
      </div>
      <canvas className={styles.canvas} ref={canvas} />

      {/* Viewfinder overlay: AF brackets close in and lock while focused. */}
      <div className={styles.viewfinder}>
        {corners.map((corner) => (
          <span
            key={corner}
            className={`${styles.bracket} ${styles[corner]}`}
          />
        ))}
        <span className={styles.afPoint} />
        <span className={styles.readout}>
          <span>1/125</span>
          <span>F4.0</span>
          <span>ISO 200</span>
          <span className={styles.count}>[{999 - (shots % 1000)}]</span>
        </span>
      </div>
      {shots > 0 && <span key={shots} className={styles.flash} />}
      <span className={styles.hint}>
        <span className={styles.hintPointer}>Click to take a shot</span>
        <span className={styles.hintTouch}>Tap the camera to take a shot</span>
      </span>
    </div>
  );
}
