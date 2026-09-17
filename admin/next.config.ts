import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.49",
    "192.168.1.49:3000",
    "192.168.1.49:3001",
    "localhost",
    "localhost:3000",
    "localhost:3001",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
