"use client";

import { useEffect, useState } from "react";
import {
  exclusiveAuthChangedEvent,
  getExclusiveSession,
  type ExclusiveSession,
} from "@/lib/exclusiveAuth";

export default function ExclusiveAccessGate() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<ExclusiveSession | null>(null);

  useEffect(() => {
    const syncSession = () => {
      setSession(getExclusiveSession());
      setIsReady(true);
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener(exclusiveAuthChangedEvent, syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(exclusiveAuthChangedEvent, syncSession);
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
            Loading your exclusive customer session.
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
            Exclusive access is locked.
          </h1>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Use the Login link in the navigation to sign in with the demo
            credential. This page will reveal the exclusive customer area after
            a local token is stored.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
          Exclusive customers
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
          Private access for selected Locale Breeze customers.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-stone-700">
          Signed in as {session.email}. This area is using a local demo token
          now and is ready to be backed by server-issued JWTs later.
        </p>

        <div className="mt-8 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <span className="block font-semibold text-stone-950">
              Private releases
            </span>
            <span className="mt-1 block">
              Early previews for digital and print bundles.
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <span className="block font-semibold text-stone-950">
              Customer resources
            </span>
            <span className="mt-1 block">
              Simple space for member files and offers later.
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
          Member area
        </p>
        <h2 className="mt-3 text-2xl font-bold text-stone-950">
          Welcome back.
        </h2>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          This customer-only panel can later display orders, downloads,
          exclusive catalogs, saved bundles, and JWT-backed profile data.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
            <span className="block text-sm font-semibold text-stone-950">
              Demo token
            </span>
            <span className="mt-1 block break-all text-xs leading-5 text-stone-600">
              {session.token}
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
            <span className="block text-sm font-semibold text-stone-950">
              Issued
            </span>
            <span className="mt-1 block text-sm text-stone-600">
              {new Date(session.issuedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
