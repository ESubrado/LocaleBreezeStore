"use client";

import { useEffect, useState } from "react";
import {
  adminAuthChangedEvent,
  getAdminSession,
  type AdminSession,
} from "@/lib/adminAuth";

export default function AdminAccessGate() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const syncSession = () => {
      setSession(getAdminSession());
      setIsReady(true);
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener(adminAuthChangedEvent, syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(adminAuthChangedEvent, syncSession);
    };
  }, []);

  if (!isReady) {
    return (
      <section className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
            Checking access
          </p>
          <p className="mt-3 text-sm text-stone-600">
            Loading your admin session.
          </p>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl place-items-center px-5 py-12 sm:px-8 lg:py-16">
        <div className="w-full max-w-xl rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
            Login required
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">
            Admin access is locked.
          </h1>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Use the Login link in the navigation to sign in with the demo
            credential. The admin page appears after a local session is stored.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
            Welcome back, {session.email}.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-stone-700">
            This page is shown after a successful login and is ready to grow
            into the store management area.
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
            Current session
          </p>
          <h2 className="mt-3 text-2xl font-bold text-stone-950">
            Login details
          </h2>

          <div className="mt-6 grid gap-3">
            <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
              <span className="block text-sm font-semibold text-stone-950">
                Logged in
              </span>
              <span className="mt-1 block text-sm text-stone-600">
                {new Date(session.loggedInAt).toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
              <span className="block text-sm font-semibold text-stone-950">
                Role
              </span>
              <span className="mt-1 block text-sm capitalize text-stone-600">
                {session.role}
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
              <span className="block text-sm font-semibold text-stone-950">
                Demo token
              </span>
              <span className="mt-1 block break-all text-xs leading-5 text-stone-600">
                {session.token}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
