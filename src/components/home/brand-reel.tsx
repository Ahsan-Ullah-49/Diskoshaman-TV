"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import cinema from "@/components/cinema/cinema.module.css";
import { useStudioMotion } from "@/components/studio-motion";
import { brandLogoSource, brandLogos } from "@/content/brand-logos";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { useVisible } from "@/lib/use-visible";
import type { BrandReelScene } from "./brand-reel-scene";
import styles from "./brand-logo-section.module.css";

const logoCount = brandLogos.length;
const finishHold = 0.7;
const scrollViewport = "(min-height: 31rem)";
const reelDistance = {
  "--reel-count": String(logoCount + finishHold),
} as CSSProperties;

function reelIndex(step: number) {
  return ((step % logoCount) + logoCount) % logoCount;
}

function scrollTurn(progress: number) {
  const position = Math.min(progress * (logoCount + finishHold), logoCount);
  const stop = Math.floor(position);
  // Hold each logo face-on for part of its scroll segment.
  const fraction = gsap.utils.clamp(0, 1, (position - stop - 0.16) / 0.68);
  return stop + fraction ** 2 * (3 - 2 * fraction);
}

export function BrandReel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<BrandReelScene>(null);
  const drag = useRef<{ id: number; startX: number; startY: number }>(null);
  const activeStep = useRef(0);
  const scrollPosition = useRef<{ turn: number; finished: boolean }>(null);
  const autoRotation = useRef(true);
  const [step, setStep] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [autoPlaying, setAutoPlaying] = useState(true);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();

  const current = reelIndex(step);

  function showStep(next: number) {
    if (next === activeStep.current) return;
    activeStep.current = next;
    setStep(next);
  }

  useGSAP(
    () => {
      const section = track.current;
      const panel = room.current;
      if (!enabled || !section || !panel) return;
      const media = gsap.matchMedia(section);

      media.add(scrollViewport, () => {
        section.dataset.scrub = "";
        section.style.setProperty(
          "--reel-count",
          String(logoCount + finishHold),
        );

        function followScroll({ progress }: ScrollTrigger) {
          const turn = scrollTurn(progress);
          const finished = turn === logoCount;
          scrollPosition.current = { turn, finished };
          scene.current?.followScroll(turn, finished);
          if (!stage.current?.hasAttribute("data-reel-ready")) {
            showStep(Math.round(turn));
          }
        }

        // CSS keeps the stage in view. ScrollTrigger reads the native distance
        // so touch, keyboard and Lenis all drive the same reel.
        const driver = ScrollTrigger.create({
          trigger: section,
          start: () => `top top+=${getComputedStyle(panel).top}`,
          end: () => `+=${section.offsetHeight - panel.offsetHeight}`,
          onRefresh: followScroll,
          onUpdate: followScroll,
        });
        followScroll(driver);

        return () => {
          driver.kill();
          scrollPosition.current = null;
          scene.current?.followScroll(activeStep.current, false);
          delete section.dataset.scrub;
          section.style.removeProperty("--reel-count");
        };
      });

      return () => media.revert();
    },
    { scope: track, dependencies: [enabled], revertOnUpdate: true },
  );

  // Build the reel the first time it comes into view, then only pause and
  // resume it. Rebuilding it on every visit made the section stall.
  useEffect(() => {
    const panel = room.current;
    const host = stage.current;
    const surface = canvas.current;
    if (!enabled) {
      scene.current?.dispose();
      scene.current = null;
      return;
    }
    if (scene.current) {
      scene.current.setRunning(visible);
      return;
    }
    if (!panel || !host || !surface || !visible) return;
    let cancelled = false;

    void import("./brand-reel-scene")
      .then(({ mountBrandReel }) => {
        if (cancelled || scene.current) return;
        const player = mountBrandReel(
          panel,
          host,
          surface,
          activeStep.current,
          showStep,
        );
        scene.current = player;
        player.setAutoRotation(autoRotation.current);
        if (scrollPosition.current) {
          const { turn, finished } = scrollPosition.current;
          player.followScroll(turn, finished);
        }
      })
      .catch(() => {
        // The still stage and the brand controls also work without WebGL.
      });

    return () => {
      cancelled = true;
    };
  }, [visible, enabled]);

  useEffect(
    () => () => {
      scene.current?.dispose();
      scene.current = null;
    },
    [],
  );

  function turn(direction: number) {
    const next =
      scene.current?.turnBy(direction) ?? activeStep.current + direction;
    if (!stage.current?.hasAttribute("data-reel-ready")) showStep(next);
    const index = reelIndex(next);
    setAnnouncement(`${brandLogos[index].name}, ${index + 1} of ${logoCount}`);
  }

  function toggleAutoRotation() {
    const playing = !autoRotation.current;
    autoRotation.current = playing;
    setAutoPlaying(playing);
    scene.current?.setAutoRotation(playing);
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
    scene.current?.drag(0);
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
    <section
      ref={track}
      className={`${cinema.litSet} ${styles.section}`}
      id="brands"
      aria-labelledby="brand-logos-title"
      // The reel's scroll distance is reserved in CSS from the first paint.
      style={reelDistance}
    >
      <div className={styles.room} ref={room}>
        {enabled && (
          <canvas className={styles.canvas} ref={canvas} aria-hidden="true" />
        )}
        <div className={`container ${styles.layout}`}>
          {children}
          <div
            className={styles.stage}
            ref={stage}
            data-brand-reel
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
                    <div
                      className={styles.matte}
                      data-dark={logo.darkBackground}
                    >
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
          </div>
          <div className={styles.navigation}>
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
              <div className={styles.credit}>
                <div className={styles.counter}>
                  <span className={styles.position}>
                    {String(current + 1).padStart(2, "0")} / {logoCount}
                  </span>
                  {enabled && (
                    <button
                      className={styles.autoRotation}
                      type="button"
                      data-playing={autoPlaying}
                      aria-label={
                        autoPlaying
                          ? "Pause reel rotation"
                          : "Play reel rotation"
                      }
                      onClick={toggleAutoRotation}
                    />
                  )}
                </div>
                <span className={styles.name}>{brandLogos[current].name}</span>
              </div>
              <button
                className={styles.next}
                type="button"
                aria-label="Next logo"
                onClick={() => turn(1)}
              />
            </div>
            <span className="visually-hidden" role="status">
              {announcement}
            </span>
          </div>
        </div>
        <ul
          className="visually-hidden"
          aria-label="Brands in the reel"
          role="list"
        >
          {brandLogos.map(({ name, slug }) => (
            <li key={slug}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
