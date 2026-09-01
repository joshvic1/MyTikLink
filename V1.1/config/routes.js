export const V11_ROOT = "/v1-1";

export const v11Routes = {
  home: `${V11_ROOT}/dashboard`,
  links: `${V11_ROOT}/links`,
  linkAnalytics: `${V11_ROOT}/analytics`,
  pages: `${V11_ROOT}/pages`,
  pageCreate: `${V11_ROOT}/pages/create`,
  pageEditor: `${V11_ROOT}/pages/editor`,
  pageBuilder: `${V11_ROOT}/pages/builder`,
  store: `${V11_ROOT}/store`,
  products: `${V11_ROOT}/store/products`,
  orders: `${V11_ROOT}/store/orders`,
  storeSettings: `${V11_ROOT}/store/settings`,
  storeDesign: `${V11_ROOT}/store/design`,
  insights: `${V11_ROOT}/insights`,
  tracking: `${V11_ROOT}/settings/tracking`,
  billing: `${V11_ROOT}/settings/billing`,
  profile: `${V11_ROOT}/settings/profile`,
  help: `${V11_ROOT}/help`,
  login: `${V11_ROOT}/login`,
};

export const navigation = [
  { key: "home", label: "Home", href: v11Routes.home, icon: "home" },
  { key: "pages", label: "Landing pages", href: v11Routes.pages, icon: "pages" },
  { key: "store", label: "Storefront", href: v11Routes.store, icon: "store" },
  { key: "links", label: "Smart links", href: v11Routes.links, icon: "links" },
  { key: "insights", label: "Insights", href: v11Routes.insights, icon: "insights" },
];

export function activeRoute(pathname = "") {
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/store")) return "store";
  if (pathname.includes("/pages")) return "pages";
  if (pathname.includes("/links")) return "links";
  if (pathname.includes("/analytics") || pathname.includes("/insights")) return "insights";
  return "home";
}
