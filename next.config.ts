import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile the AEGIS design system (published as ESM) so Next.js can process it
  transpilePackages: ['@azelenets/aegis-design-system'],
};

export default nextConfig;
