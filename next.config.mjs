/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["cloudfront-ap-northeast-1.images.arcpublishing.com"],
  },
};

export default nextConfig;
