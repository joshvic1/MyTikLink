import { useCallback, useEffect, useState, useRef } from "react";
import { unwrapCollection, v11Api, getToken, invalidateReads } from "../lib/api";

const warningFor = (result, label) => result.status === "rejected" ? `${label}${result.reason?.status ? ` (HTTP ${result.reason.status})` : " (connection error)"}` : null;
const optionalStore = () => v11Api.store().catch(error => {
  if (error.status === 404 && error.message === "Store not found") return null;
  throw error;
});

const initial = { pages: [], links: [], store: null, products: [], orders: [], leads: [], clickHistory: [], payments: [], storeStats: null, dashboard: null };

export function useWorkspaceData(enabled = true) {
  const [state, setState] = useState({ ...initial, loading: true, error: null, warnings: [] });
  const loaded=useRef(false),generation=useRef(0);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    const request=++generation.current,token=getToken();
    const current=()=>request===generation.current&&getToken()===token;
    setState((value) => ({ ...value, loading: !loaded.current, error: null }));
    const historyRequest=v11Api.clickHistory().then(value=>({status:"fulfilled",value}),reason=>({status:"rejected",reason}));
    const paymentsRequest=v11Api.paymentHistory().then(value=>({status:"fulfilled",value}),reason=>({status:"rejected",reason}));
    const dashboard = await v11Api.dashboardV11().catch(() => null);
    if(!current())return;
    if (dashboard) {
      loaded.current=true;
      setState(value=>({...value,pages:dashboard.pages||[],links:dashboard.links||[],store:dashboard.store||null,products:dashboard.products||[],orders:dashboard.orders||[],leads:dashboard.leads||[],dashboard,loading:false,error:null}));
      const [historyResult, paymentsResult, statsResult] = await Promise.all([
        historyRequest,paymentsRequest,
        (dashboard.store?v11Api.storeStats():Promise.resolve(null)).then(value=>({status:"fulfilled",value}),reason=>({status:"rejected",reason}))
      ]);
      if(!current())return;
      setState({
        pages: dashboard.pages || [], links: dashboard.links || [], store: dashboard.store || null,
        products: dashboard.products || [], orders: dashboard.orders || [], leads: dashboard.leads || [],
        clickHistory: historyResult.status === "fulfilled" ? unwrapCollection(historyResult.value, "history") : [],
        payments: paymentsResult.status === "fulfilled" ? unwrapCollection(paymentsResult.value, "payments") : [],
        storeStats: statsResult.status === "fulfilled" ? statsResult.value : null,
        dashboard, loading: false, error: null,
        warnings: [warningFor(historyResult,"Click history"), warningFor(paymentsResult,"Payment history"), warningFor(statsResult,"Store statistics")].filter(Boolean),
      });
      return;
    }
    const storeRequest = optionalStore();
    const requests = [v11Api.pages(), v11Api.links(), storeRequest,
      storeRequest.then(store => store ? v11Api.products() : []),
      storeRequest.then(store => store ? v11Api.orders() : []),
      historyRequest.then(r=>{if(r.status==="rejected")throw r.reason;return r.value}), paymentsRequest.then(r=>{if(r.status==="rejected")throw r.reason;return r.value})];
    const [pagesResult, linksResult, storeResult, productsResult, ordersResult, historyResult, paymentsResult] = await Promise.allSettled(requests);
    const listedPages = pagesResult.status === "fulfilled" ? unwrapCollection(pagesResult.value, "pages") : [];
    const pages = listedPages;
    const leadResults = await Promise.allSettled([v11Api.workspaceLeads()]);
    const leads = leadResults[0].status === "fulfilled" ? unwrapCollection(leadResults[0].value,"leads") : [];
    let storeStats = null;
    let statsWarning = null;
    if (storeResult.status === "fulfilled" && storeResult.value) storeStats = await v11Api.storeStats().catch(error => {statsWarning = warningFor({status:"rejected",reason:error},"Store statistics");return null;});
    const warnings = [warningFor(pagesResult,"Landing pages"), warningFor(linksResult,"Redirect links"), warningFor(storeResult,"Storefront"), ...(storeResult.status === "fulfilled" ? [warningFor(productsResult,"Products"), warningFor(ordersResult,"Orders")] : []), warningFor(historyResult,"Click history"), warningFor(paymentsResult,"Payment history"), statsWarning, ...(leadResults.some(result=>result.status === "rejected") ? ["Some page leads"] : [])].filter(Boolean);
    if(!current())return;
    loaded.current=true;
    setState({
      pages,
      links: linksResult.status === "fulfilled" ? unwrapCollection(linksResult.value, "links") : [],
      store: storeResult.status === "fulfilled" ? storeResult.value : null,
      products: productsResult.status === "fulfilled" ? unwrapCollection(productsResult.value, "products").filter(p=>!p.isDemo) : [],
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
  useEffect(() => { if(enabled)refresh();else{loaded.current=false;setState({...initial,loading:true,error:null,warnings:[]});}return()=>{generation.current++;}; }, [enabled, refresh]);
  return { ...state, refresh:useCallback(()=>{invalidateReads();return refresh();},[refresh]) };
}
