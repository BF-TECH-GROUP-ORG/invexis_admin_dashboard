/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://190c75c48d76.ngrok-free.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
