import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Cloudflare Workers/Edge deploy sering bermasalah saat Next Image Optimization
    // mencoba fetch gambar remote (kadang diblokir/hotlink protection) sehingga muncul:
    // "url parameter is valid but upstream response is invalid".
    // Dengan unoptimized, browser akan mengambil gambar langsung dari src.
    unoptimized: true,
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
