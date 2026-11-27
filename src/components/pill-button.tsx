import type { ComponentProps } from "react";

export function PillButton({
  children,
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type={type}
      className={["pill", "pill-primary", className].filter(Boolean).join(" ")}
      style={{ border: 0, cursor: props.disabled ? "default" : "pointer" }}
    >
      <span className="pill-fill" aria-hidden="true" />
      <span className="pill-label">{children}</span>
      <span className="pill-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </button>
  );
}
