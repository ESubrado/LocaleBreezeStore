import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import AdminAccessGate from "@/components/AdminAccessGate";

export const metadata: Metadata = {
  title: "Admin | Locale Breeze Store",
  description: "Admin access for Locale Breeze Store.",
};

export default function AdminPage() {
  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <AdminAccessGate />
      </main>
    </>
  );
}
