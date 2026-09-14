export const COOKIE_CONSENT_KEY = "molarmind-cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_EVENT = "molarmind-cookie-consent";

export type CookieConsent = {
  version: number;
  analytics: boolean;
  decidedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!isRecord(value)) {
    return false;
  }
  return (
    value.version === COOKIE_CONSENT_VERSION &&
    typeof value.analytics === "boolean" &&
    typeof value.decidedAt === "string" &&
    value.decidedAt.length > 0
  );
}

export function readCookieConsent(): CookieConsent | undefined {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isCookieConsent(parsed)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const record: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  return record;
}

export function clearCookieConsent(): void {
  window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
