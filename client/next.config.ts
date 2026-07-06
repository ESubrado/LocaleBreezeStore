import type { NextConfig } from "next";

const fallbackSupabaseHostname = "qzibfiwzfbibthxfhyvr.supabase.co";

function getSupabaseImageHostnames() {
  const hostnames = new Set([fallbackSupabaseHostname]);
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return [...hostnames];
  }

  try {
    hostnames.add(new URL(supabaseUrl).hostname);
  } catch {
    return [...hostnames];
  }

  return [...hostnames];
}

const supabaseImageBuckets = ["product-images", "catalog-images"];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: getSupabaseImageHostnames().flatMap((hostname) =>
      supabaseImageBuckets.map((bucket) => ({
        protocol: "https",
        hostname,
        pathname: `/storage/v1/object/public/${bucket}/**`,
        search: "",
      })),
    ),
  },
};

export default nextConfig;
