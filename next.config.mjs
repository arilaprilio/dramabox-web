import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.dramaboxdb.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
