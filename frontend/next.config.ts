import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const LONG_CACHE = 'public, max-age=31536000, immutable';

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "three",
      "@mediapipe/tasks-vision",
      "qrcode.react",
    ],
  },
  allowedDevOrigins: ["192.168.0.103", "192.168.0.101", "192.168.1.5", "localhost", "127.0.0.1"],
  async headers() {
    return [
      {
        source: "/wasm/:path*",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/sample-images/:path*",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/:all*(svg|png|jpg|jpeg|webp|avif|ico|woff|woff2)",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    contentDispositionType: "inline",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
