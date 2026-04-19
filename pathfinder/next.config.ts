import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Next app lives in this folder; avoids picking the monorepo parent when multiple lockfiles exist.
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
