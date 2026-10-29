import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root to this folder. Otherwise a stray lockfile in a parent
  // directory (e.g. ~/package-lock.json) makes Next.js guess the wrong workspace root.
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
