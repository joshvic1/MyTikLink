import { useCallback, useEffect, useState } from "react";
import { unwrapCollection, v11Api } from "../lib/api";

const initial = { pages: [], links: [], store: null, products: [], orders: [], leads: [], clickHistory: [], payments: [], storeStats: null };

export function useWorkspaceData(enabled = true) {
  const [state, setState] = useState({ ...initial, loading: true, error: null, warnings: [] });
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    const requests = [v11Api.pages(), v11Api.links(), v11Api.store(), v11Api.products(), v11Api.orders(), v11Api.clickHistory(), v11Api.paymentHistory()];
    const [pagesResult, linksResult, storeResult, productsResult, ordersResult, historyResult, paymentsResult] = await Promise.allSettled(requests);
    const pages = pagesResult.status === "fulfilled" ? unwrapCollection(pagesResult.value, "pages") : [];
    const leadResults = await Promise.allSettled(pages.map((page) => v11Api.pageLeads(page._id)));
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
      leads,
      loading: false,
      error: pagesResult.status === "rejected" && linksResult.status === "rejected" ? pagesResult.reason : null,
      warnings,
    });
  }, [enabled]);
  useEffect(() => { if (enabled) refresh(); }, [enabled, refresh]);
  return { ...state, refresh };
}
