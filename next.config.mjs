import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.EXPORT_STATIC === 'true';

const config = {
  reactStrictMode: true,
  output: isStaticExport ? 'export' : undefined,
  // Use trailing slash for static export to ensure proper paths
  trailingSlash: isStaticExport,
  // Ensure assetPrefix is empty for relative paths in static export
  assetPrefix: isStaticExport ? '' : undefined,
  images: {
    unoptimized: isStaticExport,
  },
  // Rewrites are disabled for static export (they don't work in static mode)
  async rewrites() {
    if (isStaticExport) {
      return [];
    }
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ];
  },
};

export default withMDX(config);
