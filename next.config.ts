import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 año cache para imágenes optimizadas
    qualities: [60, 70, 75, 80, 90],
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1536, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Imágenes estáticas en /public/images: cache inmutable durante 1 año
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cualquier respuesta del optimizador de imágenes de Next
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
