"use client";

/** Return to the top of the page and hand keyboard focus back to the main content. */
export function BackToTop({ className }: { className?: string }) {
  function goToTop() {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }

  return (
    <button type="button" className={className} onClick={goToTop}>
      Back to top
      <span aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}
