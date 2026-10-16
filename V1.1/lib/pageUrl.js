export function pageUrl(page) {
  if (page.publicUrl) return page.publicUrl;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://mytik.link").replace(/\/$/, "");
  return `${origin}/v1-1/p/${encodeURIComponent(page.slug)}`;
}
