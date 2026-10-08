import { webEnvironmentSchema } from '@mmm/contracts';

const environment = webEnvironmentSchema.safeParse({
  API_BASE_URL: process.env.API_BASE_URL,
});
if (!environment.success) {
  throw new Error('Invalid API_BASE_URL: use an HTTP or HTTPS API address.');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
