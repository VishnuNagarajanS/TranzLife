import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Lets the dev server be opened through a Cloudflare quick tunnel (otherwise its JS is blocked with 403).
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
