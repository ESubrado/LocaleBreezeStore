import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qzibfiwzfbibthxfhyvr.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "qzibfiwzfbibthxfhyvr.supabase.co",
        pathname: "/storage/v1/object/public/catalog-images/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
