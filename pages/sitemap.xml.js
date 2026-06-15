import { getBlogPosts } from "@/utils/blogApi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mytiklink.com";

function urlEntry(loc, lastmod) {
  return `
  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>${loc.endsWith("/blog") ? "0.8" : "0.7"}</priority>
  </url>`;
}

function sitemapXml(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntry(`${SITE_URL}/blog`)}
  ${posts
    .map((post) =>
      urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        post.updatedAt || post.publishedAt || post.createdAt,
      ),
    )
    .join("")}
</urlset>`;
}

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const posts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 20) {
    const data = await getBlogPosts({ page, limit: 30 });
    posts.push(...(data.posts || []));
    hasMore = Boolean(data.hasMore);
    page += 1;
  }

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemapXml(posts));
  res.end();

  return { props: {} };
}
