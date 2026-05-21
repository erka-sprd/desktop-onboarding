/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/designer/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/designer',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
