"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { useStudioMotion } from "@/components/studio-motion";
import styles from "./cinema.module.css";

export function FocusFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const plane = useRef<HTMLDivElement>(null);
  const { enabled } = useStudioMotion();

  function aim(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.pointerType !== "mouse" || !plane.current) return;
    const frame = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - frame.left) / frame.width - 0.5;
    const y = (event.clientY - frame.top) / frame.height - 0.5;
    const style = plane.current.style;
    style.setProperty("--focus-pitch", `${-y * 8}deg`);
    style.setProperty("--focus-yaw", `${x * 10}deg`);
    style.setProperty("--focus-light", `${(x + 0.5) * 100}%`);
    plane.current.dataset.aimed = "";
  }

  function reset() {
    if (plane.current) delete plane.current.dataset.aimed;
  }

  return (
    <div
      className={className}
      onPointerMove={aim}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div
        ref={plane}
        className={styles.opticalPlane}
        data-interactive={enabled || undefined}
      >
        {children}
      </div>
    </div>
  );
}
