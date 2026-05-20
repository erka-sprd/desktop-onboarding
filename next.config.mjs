/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
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
