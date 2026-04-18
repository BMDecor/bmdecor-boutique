import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Benjamin Moore CDN domains
      {
        protocol: 'https',
        hostname: '*.benjaminmoore.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'benjaminmoore.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.benjaminmoore.com',
        pathname: '/**',
      },
      // BM API and media CDN
      {
        protocol: 'https',
        hostname: 'api.benjaminmoore.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.benjaminmoore.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bmdecor-images.s3.eu-west-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bmdecor.es',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/:slug*',
        destination: '/journal/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
