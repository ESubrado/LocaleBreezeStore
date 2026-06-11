"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  exclusiveAuthChangedEvent,
  exclusiveDemoCredential,
  getExclusiveSession,
  signInExclusiveCustomer,
  signOutExclusiveCustomer,
  type ExclusiveSession,
} from "@/lib/exclusiveAuth";

export default function ExclusiveLoginDropdown() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState(exclusiveDemoCredential.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ExclusiveSession | null>(null);

  useEffect(() => {
    const syncSession = () => setSession(getExclusiveSession());

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener(exclusiveAuthChangedEvent, syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(exclusiveAuthChangedEvent, syncSession);
    };
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signInExclusiveCustomer(email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSession(result.session);
    setError("");
    setPassword("");
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOutExclusiveCustomer();
    setSession(null);
    setError("");
    setPassword("");
    setIsOpen(false);
  };

  if (session) {
    const isExclusiveActive = pathname === "/exclusive";

    return (
      <>
        <Link
          href="/exclusive"
          aria-current={isExclusiveActive ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isExclusiveActive
              ? "bg-stone-950 text-white"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
          }`}
        >
          Exclusive
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => {
          setIsOpen((current) => !current);
          setError("");
        }}
        className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
      >
        Login
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Exclusive customer login"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-stone-200 bg-white p-5 text-left shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-normal text-[#24786b]">
            Exclusive login
          </p>
          <h2 className="mt-2 text-lg font-bold text-stone-950">
            Sign in for customer-only access.
          </h2>
          <div className="mt-4 rounded-lg border border-dashed border-stone-300 bg-[#fbfcf8] p-3 text-xs leading-5 text-stone-700">
            <span className="block font-semibold text-stone-950">
              Demo credential
            </span>
            <span className="mt-1 block">Email: {exclusiveDemoCredential.email}</span>
            <span className="block">
              Password: {exclusiveDemoCredential.password}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="exclusive-nav-email"
                className="text-sm font-semibold text-stone-800"
              >
                Email
              </label>
              <input
                id="exclusive-nav-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#24786b] focus:ring-2 focus:ring-[#24786b]/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="exclusive-nav-password"
                className="text-sm font-semibold text-stone-800"
              >
                Password
              </label>
              <input
                id="exclusive-nav-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#24786b] focus:ring-2 focus:ring-[#24786b]/20"
                placeholder="Enter demo password"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
