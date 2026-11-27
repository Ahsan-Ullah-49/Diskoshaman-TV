"use client";

import { PillLink } from "@/components/pill-link";

export function BookingAction({ url }: { url: string }) {
  function track() {
    // Beacon delivery can continue as the browser follows the Calendly link.
    navigator.sendBeacon("/api/booking/");
  }

  return (
    <div
      onClick={track}
      onAuxClick={(event) => {
        if (event.button === 1) track();
      }}
    >
      <PillLink href={url} aria-label="Book a 20-minute discovery call">
        Choose a time
      </PillLink>
    </div>
  );
}
