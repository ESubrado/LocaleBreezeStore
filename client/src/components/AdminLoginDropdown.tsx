"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAdminSession,
  onAdminAuthStateChange,
  signInAdmin,
  signOutAdmin,
  type AdminSession,
} from "@/lib/adminAuth";

export default function AdminLoginDropdown() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    getAdminSession()
      .then((currentSession) => {
        if (isMounted) {
          setSession(currentSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      });

    // Supabase emits auth changes after sign-in, sign-out, refresh, and tab
    // sync events, so the nav stays aligned with the cookie-backed session.
    const unsubscribe = onAdminAuthStateChange((currentSession) => {
      if (isMounted) {
        setSession(currentSession);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const resolvedResult = await signInAdmin(email, password);

    if (resolvedResult.error) {
      setError(resolvedResult.error);
      setIsSubmitting(false);
      return;
    }

    setSession(resolvedResult.session);
    setError("");
    setPassword("");
    setIsOpen(false);
    setIsSubmitting(false);
    toast.success(
      `You are now logged in as ${resolvedResult.session?.email ?? email.trim()}`,
    );
    router.push("/admin");
    router.refresh();
  };

  const handleSignOut = async () => {
    const result = await signOutAdmin();

    if (result.error) {
      setError(result.error);
      return;
    }

    setSession(null);
    setError("");
    setPassword("");
    setIsOpen(false);
    toast.success("You have logged out of the site.");

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      router.push("/");
    }

    router.refresh();
  };

  if (session) {
    const isAdminActive = pathname === "/admin" || pathname.startsWith("/admin/");

    return (
      <>
        <Link
          href="/admin"
          aria-current={isAdminActive ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isAdminActive
              ? "bg-stone-950 text-white"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
          }`}
        >
          Admin
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
          aria-label="Admin login"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-stone-200 bg-white p-5 text-left shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-normal text-[#24786b]">
            Admin login
          </p>
          <h2 className="mt-2 text-lg font-bold text-stone-950">
            Sign in with your Supabase admin account.
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="admin-nav-email"
                className="text-sm font-semibold text-stone-800"
              >
                Email
              </label>
              <input
                id="admin-nav-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#24786b] focus:ring-2 focus:ring-[#24786b]/20"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-nav-password"
                className="text-sm font-semibold text-stone-800"
              >
                Password
              </label>
              <input
                id="admin-nav-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#24786b] focus:ring-2 focus:ring-[#24786b]/20"
                placeholder="Enter password"
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
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
