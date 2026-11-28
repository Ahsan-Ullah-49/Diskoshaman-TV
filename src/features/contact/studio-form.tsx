"use client";

import { useId, useRef, useState, type SubmitEvent } from "react";
import { PillButton } from "@/components/pill-button";
import { site } from "@/content/site";
import {
  formCopy,
  formFields,
  validateForm,
  type FormErrors,
  type FormField,
  type FormKind,
  type FormMode,
} from "./form-fields";
import { submitEnquiry } from "./web3forms";
import styles from "./studio-form.module.css";

function InputField({
  field,
  id,
  error,
}: {
  field: FormField;
  id: string;
  error: string | undefined;
}) {
  const shared = {
    name: field.name,
    required: !field.optional,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };

  return (
    <div
      className={styles.field}
      data-wide={field.fullWidth || field.type === "radio"}
    >
      {field.type === "radio" && field.options ? (
        <fieldset>
          <legend>{field.label}</legend>
          <div className={styles.options}>
            {field.options.map((option) => (
              <label key={option} className={styles.option}>
                <input {...shared} type="radio" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <>
          <label htmlFor={id}>{field.label}</label>
          {field.type === "select" ? (
            <select {...shared} id={id} defaultValue="">
              <option value="">{field.placeholder}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              {...shared}
              id={id}
              rows={4}
              maxLength={field.maxLength}
            />
          ) : (
            <input
              {...shared}
              id={id}
              type={field.type === "website" ? "text" : field.type}
              inputMode={field.type === "website" ? "url" : undefined}
              autoComplete={field.autoComplete}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
            />
          )}
        </>
      )}
      {error && (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function submissionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function StudioForm({ kind, mode }: { kind: FormKind; mode: FormMode }) {
  const id = useId();
  const pending = useRef(false);
  const attempt = useRef<{ id: string; values: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "preview" | "error"
  >("idle");
  const copy = formCopy[kind];

  function showErrors(form: HTMLFormElement, fields: FormErrors) {
    setErrors(fields);
    const firstField = Object.keys(fields)[0];
    if (firstField)
      form
        .querySelector<HTMLElement>(`[name="${CSS.escape(firstField)}"]`)
        ?.focus();
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const { values, errors: invalid } = validateForm(
      kind,
      Object.fromEntries(data),
    );

    if (Object.keys(invalid).length) {
      setState("idle");
      showErrors(form, invalid);
      return;
    }

    setErrors({});
    // The enquiry goes straight to Web3Forms from the browser; previews stop here.
    if (kind === "enquiry") {
      if (mode === "preview") {
        setState("preview");
        form.reset();
        return;
      }
      pending.current = true;
      setState("sending");
      try {
        const accepted = await submitEnquiry(
          values,
          Boolean(data.get("websiteConfirm")),
        );
        setState(accepted ? "sent" : "error");
        if (accepted) form.reset();
      } catch {
        setState("error");
      } finally {
        pending.current = false;
      }
      return;
    }

    pending.current = true;
    setState("sending");
    const snapshot = JSON.stringify(values);
    // Keep the same delivery key when retrying an unchanged submission.
    if (attempt.current?.values !== snapshot)
      attempt.current = { id: submissionId(), values: snapshot };

    try {
      const response = await fetch(`/api/${kind}/`, {
        method: "POST",
        body: JSON.stringify({
          id: attempt.current.id,
          values,
          websiteConfirm: data.get("websiteConfirm"),
        }),
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(16000),
      });
      const result = await response.json();
      if (response.status === 422 && result.errors) {
        setState("idle");
        requestAnimationFrame(() => showErrors(form, result.errors));
      } else if (
        response.ok &&
        (result.status === "sent" || result.status === "preview")
      ) {
        setState(result.status);
        form.reset();
        attempt.current = null;
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  if (mode === "unavailable") {
    return (
      <p className={styles.status}>
        Online submission is temporarily unavailable.{" "}
        <a href={`mailto:${site.email}`}>Email the studio</a>.
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      data-kind={kind}
      method="post"
      action={`/api/${kind}/`}
      onSubmit={submit}
      noValidate
      aria-busy={state === "sending"}
    >
      <fieldset className={styles.fields} disabled={state === "sending"}>
        <legend className="visually-hidden">{copy.submit}</legend>
        {formFields[kind].map((field) => (
          <InputField
            key={field.name}
            field={field}
            id={`${id}-${field.name}`}
            error={errors[field.name]}
          />
        ))}
      </fieldset>
      <div hidden>
        <label>
          Leave this blank
          <input name="websiteConfirm" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <PillButton type="submit" disabled={state === "sending"}>
        {state === "sending"
          ? "Sending…"
          : state === "error"
            ? "Try again"
            : copy.submit}
      </PillButton>
      <div className={styles.feedback} aria-live="polite">
        {state === "sent" && <p className={styles.status}>{copy.success}</p>}
        {state === "preview" && (
          <p className={styles.status}>Preview submission complete.</p>
        )}
        {state === "error" && (
          <p className={styles.error}>
            Submission failed. Try again or{" "}
            <a href={`mailto:${site.email}`}>email the studio</a>.
          </p>
        )}
      </div>
    </form>
  );
}
