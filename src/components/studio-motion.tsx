"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToPreference(notify: () => void) {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
}

function prefersStillMedia() {
  const browser = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  return (
    window.matchMedia(reducedMotionQuery).matches ||
    Boolean(browser.connection?.saveData)
  );
}

const MotionContext = createContext<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
} | null>(null);

export function StudioMotionProvider({ children }: { children: ReactNode }) {
  const prefersStill = useSyncExternalStore(
    subscribeToPreference,
    prefersStillMedia,
    () => true,
  );
  const [choice, setEnabled] = useState<boolean | null>(null);
  const enabled = choice ?? !prefersStill;

  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? "running" : "paused";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [enabled]);

  return (
    <MotionContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useStudioMotion() {
  const context = useContext(MotionContext);
  if (!context)
    throw new Error("Studio motion controls require StudioMotionProvider.");
  return context;
}

export function MotionToggle({
  className,
  showLabel = false,
  onPlay,
}: {
  className: string;
  showLabel?: boolean;
  onPlay?: () => void;
}) {
  const { enabled, setEnabled } = useStudioMotion();
  const label = enabled ? "Pause motion" : "Play motion";

  function toggle() {
    // Browsers that block autoplay can start the reel within this user gesture.
    if (!enabled) onPlay?.();
    setEnabled(!enabled);
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path
          d={enabled ? "M7 5h3v14H7zm7 0h3v14h-3z" : "m8 4.8 11 7.2-11 7.2z"}
        />
      </svg>
      {showLabel && label}
    </button>
  );
}
