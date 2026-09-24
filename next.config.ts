import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ai-training-web-portal.vercel.app',
          },
        ],
        destination: 'https://academy.waynautic.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
