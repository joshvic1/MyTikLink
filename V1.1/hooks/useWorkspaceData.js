import { useCallback, useEffect, useState } from "react";
import { unwrapCollection, v11Api } from "../lib/api";

const initial = { pages: [], links: [], store: null, products: [], orders: [], leads: [], clickHistory: [], payments: [], storeStats: null, dashboard: null };

export function useWorkspaceData(enabled = true) {
  const [state, setState] = useState({ ...initial, loading: true, error: null, warnings: [] });
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    const dashboard = await v11Api.dashboardV11().catch(() => null);
    if (dashboard) {
      const [historyResult, paymentsResult, statsResult] = await Promise.allSettled([
        v11Api.clickHistory(),
        v11Api.paymentHistory(),
        dashboard.store ? v11Api.storeStats() : Promise.resolve(null),
      ]);
      setState({
        pages: dashboard.pages || [], links: dashboard.links || [], store: dashboard.store || null,
        products: dashboard.products || [], orders: dashboard.orders || [], leads: dashboard.leads || [],
        clickHistory: historyResult.status === "fulfilled" ? unwrapCollection(historyResult.value, "history") : [],
        payments: paymentsResult.status === "fulfilled" ? unwrapCollection(paymentsResult.value, "payments") : [],
        storeStats: statsResult.status === "fulfilled" ? statsResult.value : null,
        dashboard, loading: false, error: null,
        warnings: [historyResult, paymentsResult, statsResult].filter((result) => result.status === "rejected").map((result) => result.reason?.message || "A secondary data source was unavailable."),
      });
      return;
    }
    const requests = [v11Api.pages(), v11Api.links(), v11Api.store(), v11Api.products(), v11Api.orders(), v11Api.clickHistory(), v11Api.paymentHistory()];
    const [pagesResult, linksResult, storeResult, productsResult, ordersResult, historyResult, paymentsResult] = await Promise.allSettled(requests);
    const listedPages = pagesResult.status === "fulfilled" ? unwrapCollection(pagesResult.value, "pages") : [];
    const [detailResults, leadResults] = await Promise.all([
      Promise.allSettled(listedPages.map((page) => page.slug ? v11Api.publicPage(page.slug) : Promise.resolve(null))),
      Promise.allSettled(listedPages.map((page) => v11Api.pageLeads(page._id))),
    ]);
    const pages = listedPages.map((page, index) => detailResults[index]?.status === "fulfilled" && detailResults[index].value ? { ...page, ...detailResults[index].value, _id: page._id, leadsCount: page.leadsCount } : page);
    const leads = leadResults.flatMap((result, index) => result.status === "fulfilled" ? unwrapCollection(result.value, "leads").map((lead) => ({ ...lead, pageId: pages[index]._id, pageTitle: pages[index].title })) : []);
    let storeStats = null;
    if (storeResult.status === "fulfilled" && storeResult.value) storeStats = await v11Api.storeStats().catch(() => null);
    const warnings = [pagesResult, linksResult, storeResult, productsResult, ordersResult, historyResult, paymentsResult].filter((result) => result.status === "rejected").map((result) => result.reason?.message || "A data source was unavailable.");
    setState({
      pages,
      links: linksResult.status === "fulfilled" ? unwrapCollection(linksResult.value, "links") : [],
      store: storeResult.status === "fulfilled" ? storeResult.value : null,
      products: productsResult.status === "fulfilled" ? unwrapCollection(productsResult.value, "products") : [],
      orders: ordersResult.status === "fulfilled" ? unwrapCollection(ordersResult.value, "orders") : [],
      clickHistory: historyResult.status === "fulfilled" ? unwrapCollection(historyResult.value, "history") : [],
      payments: paymentsResult.status === "fulfilled" ? unwrapCollection(paymentsResult.value, "payments") : [],
      storeStats,
      dashboard: null,
      leads,
      loading: false,
      error: pagesResult.status === "rejected" && linksResult.status === "rejected" ? pagesResult.reason : null,
      warnings,
    });
  }, [enabled]);
  useEffect(() => { if (enabled) refresh(); }, [enabled, refresh]);
  return { ...state, refresh };
}
