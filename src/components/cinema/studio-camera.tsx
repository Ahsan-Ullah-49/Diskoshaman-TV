"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import type { StudioCameraScene } from "./studio-camera-scene";
import styles from "./studio-camera.module.css";

/**
 * The production camera. It arrives in pieces and assembles, then the studio
 * emblem turns inside its lens. Lower on a page it assembles with scroll; at
 * the top of a page ("load") it assembles by itself once it is ready. Without
 * WebGL the studio logo stands in, with the same copy and links around it.
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

    const trigger = ScrollTrigger.create({
      trigger: host,
      start: "top 92%",
      end: "center 52%",
      scrub: 0.8,
      onUpdate: ({ progress }) => update(progress),
      onRefresh: ({ progress }) => update(progress),
    });
    return () => trigger.kill();
  }, [assemble, enabled, mounted, visible]);

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

  return (
    <div className={styles.stage} ref={stage} aria-hidden="true">
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
    </div>
  );
}
