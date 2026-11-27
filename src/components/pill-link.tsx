import Link from "next/link";
import type { ReactNode } from "react";

const arrowPaths = {
  "up-right": "M7 17 17 7M9 7h8v8",
  right: "M5 12h14m-6-6 6 6-6 6",
} as const;

type PillLinkProps = {
  href: string;
  children: ReactNode;
  /** Primary is the gold call to action; secondary is the smoked-glass alternative. */
  variant?: "primary" | "secondary";
  arrow?: keyof typeof arrowPaths;
  className?: string;
  "aria-label"?: string;
  onNavigate?: () => void;
};

/** The studio's pill-shaped call-to-action link. Styles live in globals.css under `.pill`. */
export function PillLink({
  href,
  children,
  variant = "primary",
  arrow = "up-right",
  className,
  "aria-label": ariaLabel,
  onNavigate,
}: PillLinkProps) {
  return (
    <Link
      href={href}
      className={["pill", `pill-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      onNavigate={onNavigate}
    >
      <span className="pill-fill" aria-hidden="true" />
      <span className="pill-label">{children}</span>
      <span className="pill-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d={arrowPaths[arrow]} />
        </svg>
      </span>
    </Link>
  );
}
