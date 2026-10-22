/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // The portal renders avatars as initials and all icons inline, so the image
  // optimizer is left at its defaults — it will engage automatically if a raster
  // image is ever added via <Image />.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
