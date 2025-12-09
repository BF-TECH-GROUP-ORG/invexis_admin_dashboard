/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Exclude NextAuth routes from being proxied to backend
        source: "/api/((?!auth).*)",
        destination:
          "https://190c75c48d76.ngrok-free.app/api/:match*",
      },
    ];
  },
};

export default nextConfig;
