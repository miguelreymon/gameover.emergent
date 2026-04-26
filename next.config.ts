import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint config removed (Next 16 ya no lo soporta dentro de next.config)
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
  // Performance: compresión + formatos modernos de imagen
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 año cache para imágenes optimizadas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
