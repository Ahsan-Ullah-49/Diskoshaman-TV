import { indexable } from "@/lib/metadata";
import type { FormKind, FormMode } from "./form-fields";
import { web3formsAccessKey } from "./web3forms";

/** Survey and newsletter answers go to the studio's existing providers. */
type Delivery = {
  kind: "survey" | "newsletter";
  endpoint: URL;
  token: string | undefined;
};

function httpsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

export function bookingUrl() {
  const url = httpsUrl(process.env.CALENDLY_EVENT_URL);
  if (!url || url.hostname !== "calendly.com") return null;
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[1].toLowerCase() === "30min")
    return null;
  return url.href;
}

/** The server delivery for a form, or null. Enquiries are sent from the browser. */
export function formDelivery(kind: FormKind): Delivery | null {
  if (kind === "enquiry") return null;

  const endpoint = httpsUrl(
    kind === "survey"
      ? process.env.SURVEY_ENDPOINT
      : process.env.NEWSLETTER_ENDPOINT,
  );
  const token =
    kind === "survey"
      ? process.env.SURVEY_ENDPOINT_TOKEN
      : process.env.NEWSLETTER_ENDPOINT_TOKEN;
  return endpoint ? { kind, endpoint, token } : null;
}

export function formMode(kind: FormKind): FormMode {
  const ready =
    kind === "enquiry" ? Boolean(web3formsAccessKey) : formDelivery(kind);
  if (ready) return "live";
  return indexable ? "unavailable" : "preview";
}

export async function deliverForm(
  delivery: Delivery,
  id: string,
  values: Record<string, string>,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": `${delivery.kind}/${id}`,
  };
  const signal = AbortSignal.timeout(9000);

  if (delivery.token) headers.Authorization = `Bearer ${delivery.token}`;
  const response = await fetch(delivery.endpoint, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({ id, form: delivery.kind, values }),
  });
  return response.ok;
}

export async function trackConversion(event: "booking_clicked", id: string) {
  const endpoint = httpsUrl(process.env.CONVERSION_ENDPOINT);
  if (!endpoint) return;
  const token = process.env.CONVERSION_ENDPOINT_TOKEN;
  const eventId = `${event}/${id}`;

  try {
    // The collector uses the stable key to count provider-accepted retries once.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": eventId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ event, id: eventId }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) console.error("Conversion collector rejected an event.");
  } catch {
    console.error("Conversion collector was unavailable.");
  }
}
