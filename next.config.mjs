/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow isolated verification builds without disturbing the running dev server.
  distDir: process.env.TIKLINK_BUILD_DIR || ".next",
  async redirects() {
    const { readFile } = await import('node:fs/promises');
    const manifest = JSON.parse(await readFile(new URL('./V1.1/media/category-covers.generated.json', import.meta.url), 'utf8'));
    return manifest.baseUrl ? [{ source: '/category-covers/:path*', destination: manifest.baseUrl + '/category-covers/:path*', permanent: false }] : [];
  },
  async rewrites() {
    return {beforeFiles: [
      {source:'/s/:slug/categories/:category*',destination:'/v1-1/s/:slug/categories/:category*'},
      {source:'/s/:slug/shop',destination:'/v1-1/s/:slug/shop'},
      {source:'/s/:slug/products/:product',destination:'/v1-1/s/:slug/products/:product'},
    ]};
  },
  async headers() {
    return [{ source: "/category-covers/:category/:revision/:file", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
};

export default nextConfig;
