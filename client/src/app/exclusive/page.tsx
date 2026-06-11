import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import ExclusiveAccessGate from "@/components/ExclusiveAccessGate";

export const metadata: Metadata = {
  title: "Exclusive Login | Locale Breeze Store",
  description:
    "Exclusive customer login for Locale Breeze Store demo access.",
};

export default function ExclusivePage() {
  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <ExclusiveAccessGate />
      </main>
    </>
  );
}
