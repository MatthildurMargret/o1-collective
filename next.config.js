/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/apply', destination: '/apply/general', permanent: true },
    ]
  },
}

module.exports = nextConfig
