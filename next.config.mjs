/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify, Vercel, Cloudflare, and any Node host run /api/* as serverless
  // functions out of the box. Re-enable `output: "export"` if you switch to
  // GitHub Pages or another purely-static host — but the AI Coach API route
  // will not function in that mode.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
};

export default nextConfig;
