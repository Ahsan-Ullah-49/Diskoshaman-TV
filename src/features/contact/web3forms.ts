const endpoint = "https://api.web3forms.com/submit";

/**
 * The studio's Web3Forms access key. Web3Forms keys are made to be used in
 * the browser: the key only lets a form send mail to the inbox it was
 * created for, so the enquiry form needs no server of its own.
 */
export const web3formsAccessKey =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

/**
 * Send a validated project enquiry to the studio inbox through Web3Forms.
 * The service is included only when the visitor chose one. A filled
 * honeypot is passed on as `botcheck`, which Web3Forms discards. Resolves
 * true once Web3Forms accepts the message.
 */
export async function submitEnquiry(
  values: Record<string, string>,
  botcheck: boolean,
) {
  const { name, email, phone, service, message } = values;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: web3formsAccessKey,
      subject: "Diskoshaman TV project enquiry",
      from_name: "Diskoshaman TV website",
      name,
      email,
      phone,
      ...(service ? { service } : {}),
      message,
      botcheck,
    }),
    signal: AbortSignal.timeout(16000),
  });
  const result: unknown = await response.json().catch(() => null);
  return (
    response.ok &&
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === true
  );
}
