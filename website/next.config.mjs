import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',

  // ESLint is run separately (npm run lint), not during the Next.js build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
