/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "cdn.shopify.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "**.myshopify.com" },
        ],
    },
    // Don't fail the Vercel build on lint/type warnings — the app is type-checked
    // separately via `tsc --noEmit`. This keeps deployments resilient.
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "4mb",
        },
    },
};

export default nextConfig;
