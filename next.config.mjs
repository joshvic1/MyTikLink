/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const { readFile } = await import('node:fs/promises');
    const manifest = JSON.parse(await readFile(new URL('./V1.1/media/category-covers.generated.json', import.meta.url), 'utf8'));
    return manifest.baseUrl ? [{ source: '/category-covers/:path*', destination: manifest.baseUrl + '/category-covers/:path*', permanent: false }] : [];
  },
  async headers() {
    return [{ source: "/category-covers/:category/:revision/:file", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
};

export default nextConfig;
