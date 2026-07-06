"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearLocalAdminSession } from "@/lib/adminAuth";
import { hasActiveAdminBrowserSession } from "@/lib/supabase/sessionCookies";

export default function AdminBrowserSessionGate({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (hasActiveAdminBrowserSession()) {
      setIsVerified(true);
      return () => {
        isMounted = false;
      };
    }

    clearLocalAdminSession().finally(() => {
      if (!isMounted) {
        return;
      }

      router.replace("/?admin=login-required");
      router.refresh();
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!isVerified) {
    return (
      <main className="flex-1 bg-[#f7faf7] text-stone-950">
        <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:py-6">
          <div className="h-28 animate-pulse rounded-lg border border-stone-200 bg-white shadow-sm" />
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
