export const exclusiveAuthChangedEvent =
  "locale-breeze-exclusive-auth-changed";

export const exclusiveDemoCredential = {
  email: "exclusive@localebreeze.test",
  password: "BreezeAccess2026",
};

export const exclusiveTokenStorageKey = "locale-breeze-exclusive-token";
const exclusiveSessionStorageKey = "locale-breeze-exclusive-session";

export type ExclusiveSession = {
  email: string;
  issuedAt: string;
  role: "exclusive_customer";
  token: string;
};

const hasBrowserStorage = () => typeof window !== "undefined";

const publishAuthChange = () => {
  if (hasBrowserStorage()) {
    window.dispatchEvent(new Event(exclusiveAuthChangedEvent));
  }
};

export function getExclusiveSession(): ExclusiveSession | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  const token = localStorage.getItem(exclusiveTokenStorageKey);
  const savedSession = localStorage.getItem(exclusiveSessionStorageKey);

  if (!token || !savedSession) {
    return null;
  }

  try {
    const session = JSON.parse(savedSession) as Omit<ExclusiveSession, "token">;

    return {
      ...session,
      token,
    };
  } catch {
    localStorage.removeItem(exclusiveTokenStorageKey);
    localStorage.removeItem(exclusiveSessionStorageKey);
    return null;
  }
}

export function signInExclusiveCustomer(email: string, password: string) {
  if (!hasBrowserStorage()) {
    return {
      error: "Browser storage is not available.",
      session: null,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const matchesDemoCredential =
    normalizedEmail === exclusiveDemoCredential.email &&
    password === exclusiveDemoCredential.password;

  if (!matchesDemoCredential) {
    return {
      error: "The email or password does not match the demo credential.",
      session: null,
    };
  }

  const token = `demo-exclusive-token-${Date.now()}`;
  const session: ExclusiveSession = {
    email: normalizedEmail,
    issuedAt: new Date().toISOString(),
    role: "exclusive_customer",
    token,
  };

  localStorage.setItem(exclusiveTokenStorageKey, token);
  localStorage.setItem(
    exclusiveSessionStorageKey,
    JSON.stringify({
      email: session.email,
      issuedAt: session.issuedAt,
      role: session.role,
    }),
  );
  publishAuthChange();

  return {
    error: "",
    session,
  };
}

export function signOutExclusiveCustomer() {
  if (!hasBrowserStorage()) {
    return;
  }

  localStorage.removeItem(exclusiveTokenStorageKey);
  localStorage.removeItem(exclusiveSessionStorageKey);
  publishAuthChange();
}
