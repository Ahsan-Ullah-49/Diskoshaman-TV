"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import { brandLogoSource, brandLogos } from "@/content/brand-logos";
import { useVisible } from "@/lib/use-visible";
import type { BrandReelScene } from "./brand-reel-scene";
import styles from "./brand-logo-section.module.css";

const logoCount = brandLogos.length;

function reelIndex(step: number) {
  return ((step % logoCount) + logoCount) % logoCount;
}

export function BrandReel() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<BrandReelScene>(null);
  const drag = useRef<{ id: number; startX: number; startY: number }>(null);
  const [step, setStep] = useState(0);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const renderScene = visible && enabled;
  const current = reelIndex(step);

  useEffect(() => {
    const host = stage.current;
    const surface = canvas.current;
    if (!host || !surface || !renderScene) return;
    let cancelled = false;

    void import("./brand-reel-scene")
      .then(({ mountBrandReel }) => {
        if (cancelled) return;
        scene.current = mountBrandReel(
          host,
          surface,
          Number(host.dataset.step),
        );
      })
      .catch(() => {
        // The still stage and the brand controls also work without WebGL.
      });

    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, [renderScene]);

  useEffect(() => {
    scene.current?.select(step);
  }, [step]);

  function turn(direction: number) {
    setStep((previous) => previous + direction);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "";
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    scene.current?.drag(event.clientX - drag.current.startX);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>, advance: boolean) {
    const gesture = drag.current;
    if (gesture?.id !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    scene.current?.drag(0);

    const x = event.clientX - gesture.startX;
    const y = event.clientY - gesture.startY;
    if (advance && Math.abs(x) > 32 && Math.abs(x) > Math.abs(y)) {
      turn(x < 0 ? 1 : -1);
    }
  }

  return (
    <>
      <div
        className={styles.stage}
        ref={stage}
        data-brand-reel
        data-step={step}
        aria-hidden="true"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={(event) => finishDrag(event, true)}
        onPointerCancel={(event) => finishDrag(event, false)}
        onLostPointerCapture={(event) => finishDrag(event, false)}
      >
        <div className={styles.still}>
          <div className={styles.stillRim} />
          <Image
            className={styles.stillEmblem}
            src="/brand/studio-logo.png"
            alt=""
            width={128}
            height={128}
            sizes="(min-width: 52rem) 128px, 20vw"
            draggable={false}
          />
          {[-1, 0, 1].map((offset) => {
            const logo = brandLogos[reelIndex(step + offset)];
            return (
              <div
                key={offset}
                className={styles.stillSlide}
                data-offset={offset}
              >
                <div className={styles.matte} data-dark={logo.darkBackground}>
                  <Image
                    src={brandLogoSource(logo)}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    unoptimized
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {renderScene && <canvas className={styles.canvas} ref={canvas} />}
      </div>
      <div
        className={styles.controls}
        role="group"
        aria-label="Browse brand logos"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            turn(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <button
          className={styles.previous}
          type="button"
          aria-label="Previous logo"
          onClick={() => turn(-1)}
        />
        <div className={styles.credit} role="status">
          <span className={styles.position}>
            {String(current + 1).padStart(2, "0")} / {logoCount}
          </span>{" "}
          <span className={styles.name}>{brandLogos[current].name}</span>
        </div>
        <button
          className={styles.next}
          type="button"
          aria-label="Next logo"
          onClick={() => turn(1)}
        />
      </div>
    </>
  );
}
