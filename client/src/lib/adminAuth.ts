export const adminAuthChangedEvent = "locale-breeze-admin-auth-changed";

export const adminDemoCredential = {
  email: "admin@localebreeze.test",
  password: "BreezeAdmin2026",
};

export const adminTokenStorageKey = "locale-breeze-admin-token";
const adminSessionStorageKey = "locale-breeze-admin-session";

export type AdminSession = {
  email: string;
  loggedInAt: string;
  role: "admin";
  token: string;
};

const hasBrowserStorage = () => typeof window !== "undefined";

const publishAuthChange = () => {
  if (hasBrowserStorage()) {
    window.dispatchEvent(new Event(adminAuthChangedEvent));
  }
};

export function getAdminSession(): AdminSession | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  const token = localStorage.getItem(adminTokenStorageKey);
  const savedSession = localStorage.getItem(adminSessionStorageKey);

  if (!token || !savedSession) {
    return null;
  }

  try {
    const session = JSON.parse(savedSession) as Omit<AdminSession, "token">;

    return {
      ...session,
      token,
    };
  } catch {
    localStorage.removeItem(adminTokenStorageKey);
    localStorage.removeItem(adminSessionStorageKey);
    return null;
  }
}

export function signInAdmin(email: string, password: string) {
  if (!hasBrowserStorage()) {
    return {
      error: "Browser storage is not available.",
      session: null,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const matchesDemoCredential =
    normalizedEmail === adminDemoCredential.email &&
    password === adminDemoCredential.password;

  if (!matchesDemoCredential) {
    return {
      error: "The email or password does not match the demo credential.",
      session: null,
    };
  }

  const token = `demo-admin-token-${Date.now()}`;
  const session: AdminSession = {
    email: normalizedEmail,
    loggedInAt: new Date().toISOString(),
    role: "admin",
    token,
  };

  localStorage.setItem(adminTokenStorageKey, token);
  localStorage.setItem(
    adminSessionStorageKey,
    JSON.stringify({
      email: session.email,
      loggedInAt: session.loggedInAt,
      role: session.role,
    }),
  );
  publishAuthChange();

  return {
    error: "",
    session,
  };
}

export function signOutAdmin() {
  if (!hasBrowserStorage()) {
    return;
  }

  localStorage.removeItem(adminTokenStorageKey);
  localStorage.removeItem(adminSessionStorageKey);
  publishAuthChange();
}
