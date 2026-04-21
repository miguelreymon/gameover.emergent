
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.preview.emergentagent.com',
        '*.cluster-0.preview.emergentcf.cloud',
        '*.cluster-1.preview.emergentcf.cloud',
        '*.cluster-2.preview.emergentcf.cloud',
        '*.cluster-3.preview.emergentcf.cloud',
        '*.cluster-4.preview.emergentcf.cloud',
        '*.cluster-5.preview.emergentcf.cloud',
        '*.cluster-6.preview.emergentcf.cloud',
        '*.cluster-7.preview.emergentcf.cloud',
        '*.cluster-8.preview.emergentcf.cloud',
        '*.cluster-9.preview.emergentcf.cloud',
        '*.preview.emergentcf.cloud',
        'localhost:3000',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
