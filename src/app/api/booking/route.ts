import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { bookingUrl, trackConversion } from "@/features/contact/delivery";

export function POST(request: Request) {
  if (
    request.headers.get("sec-fetch-site") !== "same-origin" ||
    !bookingUrl()
  ) {
    return new Response(null, { status: 400 });
  }
  after(() => trackConversion("booking_clicked", randomUUID()));
  return new Response(null, { status: 204 });
}
