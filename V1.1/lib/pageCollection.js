import { pageHasLeadForm, pageThumbnail } from "./pagePresentation.js";

export async function loadPageCollection(api, { search = "", page = 1 } = {}) {
  const result = await api.pageCollection({ search, page });
  if (result?.summary && Array.isArray(result.pages)) return result;
  if (!Array.isArray(result)) throw new Error("Page collection unavailable");
  // Compatibility during a staged backend rollout: use owner-only detail routes,
  // never public routes, to identify the correct editor and existing lead forms.
  const all = [...result].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const matches = all.filter(item => `${item.title} ${item.slug}`.toLowerCase().includes(search.toLowerCase()));
  const limit = 20;
  const current = Math.min(page, Math.max(1, Math.ceil(matches.length / limit)));
  const pages = await Promise.all(matches.slice((current - 1) * limit, current * limit).map(async item => {
    const detail = item.builderType ? item : await api.pageDetail(item._id);
    const merged = { ...item, ...detail, leadsCount: item.leadsCount };
    return { ...merged, thumbnailUrl: pageThumbnail(merged), hasLeadForm: merged.hasLeadForm ?? pageHasLeadForm(merged), availability: merged.availability || "unverified" };
  }));
  return { pages, page: current, total: matches.length, limit,
    summary: { pages: all.length, leads: all.every(item => Number.isFinite(item.leadsCount)) ? all.reduce((sum, item) => sum + item.leadsCount, 0) : null } };
}
