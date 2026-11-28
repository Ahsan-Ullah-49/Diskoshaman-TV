import { serviceNavigation } from "@/content/services";

export type FormKind = "enquiry" | "survey" | "newsletter";

export type FormField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel" | "website" | "radio" | "select";
  maxLength?: number;
  /** Optional fields may be left empty; an empty value is not sent. */
  optional?: boolean;
  options?: readonly string[];
  fullWidth?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

const name: FormField = {
  name: "name",
  label: "Name",
  type: "text",
  maxLength: 120,
  autoComplete: "name",
};
const email: FormField = {
  name: "email",
  label: "Email",
  type: "email",
  maxLength: 254,
  autoComplete: "email",
};
const phone: FormField = {
  name: "phone",
  label: "Phone number",
  type: "tel",
  maxLength: 30,
  autoComplete: "tel",
};

// Sits beside the phone number; "Select service" shows until one is chosen.
const service: FormField = {
  name: "service",
  label: "Service",
  type: "select",
  optional: true,
  placeholder: "Select service",
  options: serviceNavigation.map(({ label }) => label),
};

export const formFields: Record<FormKind, readonly FormField[]> = {
  enquiry: [
    name,
    email,
    phone,
    service,
    {
      name: "message",
      label: "Tell us about your project",
      type: "textarea",
      maxLength: 3000,
      fullWidth: true,
    },
  ],
  survey: [
    {
      name: "importance",
      label: "How important is video production for your business?",
      type: "radio",
      options: [
        "It’s very important. We need to engage with our customers.",
        "We need our brand to be seen and recognised.",
        "We need to share our stories with our community and promote our products.",
        "All of the above.",
      ],
    },
    {
      name: "challenge",
      label: "What’s your biggest challenge in connecting with your audience?",
      type: "radio",
      options: [
        "Creating engaging content that grabs attention.",
        "Standing out from competitors in a crowded market.",
        "Building trust and credibility through storytelling.",
        "All of the above.",
      ],
    },
    {
      name: "reason",
      label: "Why should your brand invest in professional video production?",
      type: "radio",
      options: [
        "To create a powerful first impression.",
        "To effectively showcase your products or services.",
        "To drive more engagement and conversions.",
        "All of the above.",
      ],
    },
    {
      name: "goal",
      label: "What would you want a video to achieve for your business?",
      type: "radio",
      options: [
        "Build a stronger connection with customers.",
        "Highlight the unique value of our products or services.",
        "Tell our brand story in a way that inspires and resonates.",
        "All of the above.",
      ],
    },
    {
      name: "audience",
      label:
        "Tell us about your business, your audience and what you want video to achieve.",
      type: "textarea",
      maxLength: 2000,
      fullWidth: true,
    },
    {
      name: "website",
      label: "Website URL",
      type: "website",
      maxLength: 400,
      autoComplete: "url",
    },
    name,
    email,
    phone,
  ],
  newsletter: [{ ...email, placeholder: "Your email address" }],
};

export const formCopy = {
  enquiry: {
    submit: "Submit form",
    success: "Enquiry sent. We’ll be in touch about your project.",
  },
  survey: {
    submit: "Submit survey",
    success: "Thanks for sharing your answers.",
  },
  newsletter: {
    submit: "Sign up",
    success: "Thanks for signing up for studio updates.",
  },
} as const;

export type FormMode = "live" | "preview" | "unavailable";
export type FormErrors = Record<string, string>;

export function isFormKind(form: string): form is FormKind {
  return Object.hasOwn(formFields, form);
}

function isWebsite(value: string) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      url.hostname.includes(".") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function fieldError(field: FormField, value: string) {
  if (!value && field.optional) return null;
  if (!value) {
    if (field.options) return "Choose an answer.";
    if (field.type === "email") return "Enter your email address.";
    if (field.type === "tel") return "Enter your phone number.";
    if (field.type === "website") return "Enter your website URL.";
    if (field.type === "textarea") return "Enter a short description.";
    return "Enter your name.";
  }
  if (value.length > (field.maxLength ?? 300)) return "Shorten your answer.";
  if (field.options && !field.options.includes(value))
    return "Choose one of the listed answers.";
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address.";
  if (
    field.type === "tel" &&
    (!/^[\d+()\s.-]+$/.test(value) || value.replace(/\D/g, "").length < 7)
  )
    return "Enter a valid phone number.";
  if (field.type === "website" && !isWebsite(value))
    return "Enter a valid website URL.";
  return null;
}

/** Shared field rules keep the browser and delivery endpoint in agreement. */
export function validateForm(kind: FormKind, input: Record<string, unknown>) {
  const values: Record<string, string> = {};
  const errors: FormErrors = {};

  for (const field of formFields[kind]) {
    const rawValue = input[field.name];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";
    const error = fieldError(field, value);
    if (error) errors[field.name] = error;
    values[field.name] = value;
  }

  return { values, errors };
}
