/** @type {import('next').NextConfig} */
const nextConfig = {
  // Consume the shared package from source-friendly dist (CJS) — workspace symlink.
  transpilePackages: ['@copperkitchen/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  }
};

export default nextConfig;
