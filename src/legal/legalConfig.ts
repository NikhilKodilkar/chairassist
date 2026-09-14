import {
  accessibilityPath,
  cookiesPath,
  disclaimerPath,
  hipaaPath,
  nppPath,
  privacyChoicesPath,
  privacyPath,
  termsPath,
} from "../config/paths";

export type LegalPageId =
  | "privacy"
  | "npp"
  | "terms"
  | "cookies"
  | "accessibility"
  | "disclaimer"
  | "hipaa"
  | "choices";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function envText(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return fallback;
}

export function legalEntity(): string {
  return envText(import.meta.env.VITE_LEGAL_ENTITY, "MolarMind");
}

export function privacyEmail(): string | undefined {
  const value = envText(import.meta.env.VITE_PRIVACY_EMAIL, "");
  if (value.length === 0) {
    return undefined;
  }
  return value;
}

export function legalJurisdiction(): string {
  return envText(import.meta.env.VITE_LEGAL_JURISDICTION, "the United States");
}

export function legalEffectiveIso(): string {
  return envText(import.meta.env.VITE_LEGAL_EFFECTIVE_DATE, "2026-09-14");
}

export function formatLegalDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) {
    return iso;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return iso;
  }
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function privacyContactLine(): string {
  const email = privacyEmail();
  if (email) {
    return email;
  }
  return "the privacy officer email configured for this deployment";
}

export const legalNav: { id: LegalPageId; label: string; path: string }[] = [
  { id: "privacy", label: "Privacy Policy", path: privacyPath },
  { id: "npp", label: "HIPAA Notice", path: nppPath },
  { id: "terms", label: "Terms of Use", path: termsPath },
  { id: "cookies", label: "Cookie Policy", path: cookiesPath },
  { id: "accessibility", label: "Accessibility", path: accessibilityPath },
  { id: "disclaimer", label: "Dental Disclaimer", path: disclaimerPath },
  { id: "hipaa", label: "HIPAA & BAA", path: hipaaPath },
  { id: "choices", label: "Your Privacy Choices", path: privacyChoicesPath },
];
