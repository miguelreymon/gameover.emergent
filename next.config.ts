import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.preview.emergentagent.com',
        '*.preview.emergentcf.cloud',
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
        '*.cluster-10.preview.emergentcf.cloud',
        '*.cluster-11.preview.emergentcf.cloud',
        '*.cluster-12.preview.emergentcf.cloud',
        '*.cluster-13.preview.emergentcf.cloud',
        '*.cluster-14.preview.emergentcf.cloud',
        '*.cluster-15.preview.emergentcf.cloud',
        '*.cluster-16.preview.emergentcf.cloud',
        '*.cluster-17.preview.emergentcf.cloud',
        '*.cluster-18.preview.emergentcf.cloud',
        '*.cluster-19.preview.emergentcf.cloud',
        '*.cluster-20.preview.emergentcf.cloud',
        'localhost:3000',
      ],
    },
    optimizePackageImports: [
      'lucide-react',
      'embla-carousel-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'date-fns',
      'recharts',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
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
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
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
