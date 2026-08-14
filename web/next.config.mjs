import path from 'path';
import { fileURLToPath } from 'url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(configDir, '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
  async headers() {
    return [
      {
        source: '/.well-known/agent-skills/index.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'public, max-age=300',
          },
        ],
      },
      {
        source: '/.well-known/agent-skills/artifacts/:path*',
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
