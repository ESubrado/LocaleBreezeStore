"use client";
import { useRouter } from "next/navigation";

export default function ProductsRouterButton() {
  const router = useRouter();
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => router.push("/products")}
    >
      Go to Products
    </button>
  );
}
