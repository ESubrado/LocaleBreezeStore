import type { CookieOptions } from "@supabase/ssr";

export const ADMIN_BROWSER_SESSION_COOKIE = "locale-breeze-admin-session";
export const ADMIN_BROWSER_SESSION_COOKIE_VALUE = "active";
export const ADMIN_BROWSER_SESSION_STORAGE_KEY =
  "locale-breeze-admin-session";

type BrowserCookie = {
  name: string;
  value: string;
};

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

type BrowserCookieOptions = CookieOptions & {
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
};

const adminBrowserSessionCookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
};

function safeDecodeCookiePart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSameSite(value: CookieOptions["sameSite"]) {
  if (value === true) {
    return "Strict";
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function serializeBrowserCookie(
  name: string,
  value: string,
  options: CookieOptions,
) {
  const normalizedOptions = options as BrowserCookieOptions;
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (typeof normalizedOptions.maxAge === "number") {
    parts.push(`Max-Age=${Math.floor(normalizedOptions.maxAge)}`);
  }

  if (normalizedOptions.domain) {
    parts.push(`Domain=${normalizedOptions.domain}`);
  }

  if (normalizedOptions.path) {
    parts.push(`Path=${normalizedOptions.path}`);
  }

  if (normalizedOptions.expires instanceof Date) {
    parts.push(`Expires=${normalizedOptions.expires.toUTCString()}`);
  }

  if (normalizedOptions.secure) {
    parts.push("Secure");
  }

  const sameSite = normalizeSameSite(normalizedOptions.sameSite);
  if (sameSite) {
    parts.push(`SameSite=${sameSite}`);
  }

  if (normalizedOptions.priority) {
    parts.push(
      `Priority=${
        normalizedOptions.priority.charAt(0).toUpperCase() +
        normalizedOptions.priority.slice(1).toLowerCase()
      }`,
    );
  }

  if (normalizedOptions.partitioned) {
    parts.push("Partitioned");
  }

  return parts.join("; ");
}

function writeBrowserCookie(
  name: string,
  value: string,
  options: CookieOptions,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = serializeBrowserCookie(name, value, options);
}

export function toBrowserSessionCookieOptions(
  value: string,
  options: CookieOptions,
) {
  if (!value) {
    return options;
  }

  const { expires: _expires, maxAge: _maxAge, ...sessionOptions } = options;

  return sessionOptions;
}

export function getBrowserSupabaseCookies(): BrowserCookie[] {
  if (typeof document === "undefined" || !document.cookie) {
    return [];
  }

  return document.cookie.split("; ").flatMap((cookie) => {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex < 0) {
      return [];
    }

    return [
      {
        name: safeDecodeCookiePart(cookie.slice(0, separatorIndex)),
        value: safeDecodeCookiePart(cookie.slice(separatorIndex + 1)),
      },
    ];
  });
}

export function setBrowserSupabaseCookies(cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    writeBrowserCookie(
      name,
      value,
      toBrowserSessionCookieOptions(value, options),
    );
  });
}

export function isAdminBrowserSessionCookieValue(value?: string | null) {
  return value === ADMIN_BROWSER_SESSION_COOKIE_VALUE;
}

export function hasAdminBrowserSessionCookie() {
  return getBrowserSupabaseCookies().some(
    ({ name, value }) =>
      name === ADMIN_BROWSER_SESSION_COOKIE &&
      isAdminBrowserSessionCookieValue(value),
  );
}

export function hasAdminBrowserSessionStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(ADMIN_BROWSER_SESSION_STORAGE_KEY) ===
      ADMIN_BROWSER_SESSION_COOKIE_VALUE
    );
  } catch {
    return false;
  }
}

function setAdminBrowserSessionStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      ADMIN_BROWSER_SESSION_STORAGE_KEY,
      ADMIN_BROWSER_SESSION_COOKIE_VALUE,
    );
  } catch {
    // Private browsing and strict storage settings can block sessionStorage.
  }
}

function clearAdminBrowserSessionStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(ADMIN_BROWSER_SESSION_STORAGE_KEY);
  } catch {
    // Private browsing and strict storage settings can block sessionStorage.
  }
}

export function hasActiveAdminBrowserSession() {
  return hasAdminBrowserSessionCookie() && hasAdminBrowserSessionStorage();
}

function setAdminBrowserSessionCookie() {
  writeBrowserCookie(
    ADMIN_BROWSER_SESSION_COOKIE,
    ADMIN_BROWSER_SESSION_COOKIE_VALUE,
    adminBrowserSessionCookieOptions,
  );
}

function clearAdminBrowserSessionCookie() {
  writeBrowserCookie(ADMIN_BROWSER_SESSION_COOKIE, "", {
    ...adminBrowserSessionCookieOptions,
    maxAge: 0,
  });
}

export function setAdminBrowserSession() {
  setAdminBrowserSessionCookie();
  setAdminBrowserSessionStorage();
}

export function clearAdminBrowserSession() {
  clearAdminBrowserSessionCookie();
  clearAdminBrowserSessionStorage();
}
