/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://granitic-jule-haunting.ngrok-free.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
