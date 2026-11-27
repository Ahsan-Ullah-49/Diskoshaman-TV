"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import type { Project } from "@/content/projects";
import { useVisible } from "@/lib/use-visible";
import { WatchDialog } from "./watch-dialog";
import styles from "./poster-ring.module.css";

// One revolution every 70 seconds while nobody is dragging it.
const idleSpeed = (Math.PI * 2) / 70;

/**
 * A slowly turning cylinder of film posters. Drag to spin it; click a poster
 * to play that film in the on-site player. The posters are a visual way in:
 * every film is also reachable as a button in the archive below.
 */
export function PosterRing({ films }: { films: readonly Project[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const velocity = useRef(0);
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  const visible = useVisible(stage);
  const { enabled } = useStudioMotion();
  const step = (Math.PI * 2) / films.length;

  useEffect(() => {
    const host = stage.current;
    const cylinder = ring.current;
    if (!host || !cylinder) return;
    const cards = Array.from(cylinder.children) as HTMLElement[];
    let radius = 0;
    let frame = 0;
    let previous = performance.now();

    function measure() {
      const width = cards[0]?.offsetWidth ?? 0;
      // Space the posters edge to edge around the cylinder, with a small gap.
      radius = (width / 2 / Math.tan(Math.PI / cards.length)) * 1.12;
      cards.forEach((card, index) => {
        card.style.transform = `rotateY(${index * step}rad) translateZ(${radius}px)`;
      });
    }

    function paint() {
      cylinder!.style.transform = `translateZ(${-radius}px) rotateX(-6deg) rotateY(${angle.current}rad)`;
      cards.forEach((card, index) => {
        // Posters facing the visitor are bright; those turning away fade back.
        const facing = Math.cos(index * step + angle.current);
        const light = Math.max(0, (facing + 0.35) / 1.35);
        card.style.opacity = String(0.12 + light * 0.88);
        card.style.setProperty("--light", light.toFixed(3));
      });
    }

    function tick(time: number) {
      const elapsed = Math.min(time - previous, 60) / 1000;
      previous = time;
      if (!drag.current) {
        // Momentum from a drag eases back into the idle turn.
        velocity.current += (-idleSpeed - velocity.current) * 0.04;
      }
      angle.current += velocity.current * elapsed;
      paint();
      frame = requestAnimationFrame(tick);
    }

    measure();
    paint();
    const observer = new ResizeObserver(() => {
      measure();
      paint();
    });
    observer.observe(host);
    if (enabled && visible) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled, visible, step]);

  function grab(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.button !== 0) return;
    drag.current = { x: event.clientX, moved: 0 };
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    const host = stage.current;
    if (!current || !host) return;
    const delta = event.clientX - current.x;
    current.x = event.clientX;
    current.moved += Math.abs(delta);
    if (current.moved > 4 && !host.hasPointerCapture(event.pointerId))
      host.setPointerCapture(event.pointerId);
    const turn = (delta / host.clientWidth) * Math.PI;
    angle.current += turn;
    velocity.current = turn * 60;
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    const host = stage.current;
    if (host?.hasPointerCapture(event.pointerId))
      host.releasePointerCapture(event.pointerId);
    // Keep the drag record briefly so the click that ends a drag is ignored.
    window.setTimeout(() => (drag.current = null), 0);
  }

  function open(film: Project) {
    if (drag.current && drag.current.moved > 6) return;
    setActive(film);
  }

  return (
    <>
      <div
        ref={stage}
        className={styles.stage}
        onPointerDown={grab}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        aria-hidden="true"
      >
        <div ref={ring} className={styles.ring}>
          {films.map((film) => (
            <button
              key={film.slug}
              type="button"
              tabIndex={-1}
              className={styles.card}
              onClick={() => open(film)}
            >
              <Image
                src={film.poster}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 60rem) 18rem, 40vw"
              />
              <span className={styles.caption}>{film.title}</span>
            </button>
          ))}
        </div>
        <div className={styles.floor} />
      </div>
      {active && (
        <WatchDialog
          key={active.slug}
          project={active}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
