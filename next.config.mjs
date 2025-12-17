/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {        // Exclude NextAuth routes from being proxied to backend
        source: "/api/((?!auth).*)",
        destination: "https://uncircuitously-spathic-mignon.ngrok-free.dev/api/:match*",
      },
    ];
  },
};

export default nextConfig;
