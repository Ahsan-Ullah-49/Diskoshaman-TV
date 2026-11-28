import {
  deliverForm,
  formDelivery,
  formMode,
} from "@/features/contact/delivery";
import { isFormKind, validateForm } from "@/features/contact/form-fields";

const maxRequestBytes = 16 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

async function readPayload(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let length = 0;
  let body = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxRequestBytes) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ form: string }> },
) {
  const { form } = await params;
  // Enquiries go straight from the browser to Web3Forms.
  if (!isFormKind(form) || form === "enquiry")
    return Response.json({ status: "unavailable" }, { status: 404 });
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ status: "invalid" }, { status: 403 });
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return Response.json({ status: "invalid" }, { status: 415 });
  }

  const payload = await readPayload(request);
  if (
    !isRecord(payload) ||
    typeof payload.id !== "string" ||
    !/^[a-f0-9]{32}$/.test(payload.id) ||
    !isRecord(payload.values) ||
    payload.websiteConfirm
  ) {
    return Response.json({ status: "invalid" }, { status: 400 });
  }

  const { values, errors } = validateForm(form, payload.values);
  if (Object.keys(errors).length)
    return Response.json({ errors }, { status: 422 });

  const delivery = formDelivery(form);
  if (!delivery) {
    return formMode(form) === "preview"
      ? Response.json({ status: "preview" })
      : Response.json({ status: "unavailable" }, { status: 503 });
  }

  const id = payload.id;
  try {
    if (await deliverForm(delivery, id, values)) {
      return Response.json({ status: "sent" });
    }
  } catch {
    // The client retains the completed fields and retries with the same key.
  }
  return Response.json({ status: "retry" }, { status: 502 });
}
