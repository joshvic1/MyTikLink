export default function Sitemap() {
  return null;
}
export async function getServerSideProps({ params, query, res }) {
  const base = (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_V11_API_URL
      ? process.env.NEXT_PUBLIC_V11_API_URL
      : process.env.NEXT_PUBLIC_API_URL
  )?.replace(/\/$/, "");
  const page = Math.max(1, Math.min(1000, parseInt(query.page) || 1));
  const response = await fetch(
    `${base}/v1-1/store-studio/commerce/public/${encodeURIComponent(params.slug)}/sitemap?page=${page}`,
    { signal: AbortSignal.timeout(10000) },
  ).catch(() => null);
  if (!response?.ok) {
    res.statusCode = response?.status === 404 ? 404 : 503;
    res.end();
    return { props: {} };
  }
  const data = await response.json();
  const escape = (v) =>
    String(v).replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300");
  if (!query.page && data.totalPages > 1) {
    const root = `https://mytiklink.com/v1-1/s/${encodeURIComponent(params.slug)}/sitemap.xml`;
    res.write(
      `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Array.from({ length: Math.min(data.totalPages, 1000) }, (_, i) => `<sitemap><loc>${escape(root + "?page=" + (i + 1))}</loc></sitemap>`).join("")}</sitemapindex>`,
    );
    res.end();
    return { props: {} };
  }
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${data.urls.map((u) => `<url><loc>${escape(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}</url>`).join("")}</urlset>`,
  );
  res.end();
  return { props: {} };
}
