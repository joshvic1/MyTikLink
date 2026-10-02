const visuals = {
  leads: { image: "/v1-1/up-next/up-next-leads.webp", tone: "leads", productType: "leads", dismissalType: "attention" },
  "new-orders": { image: "/v1-1/up-next/up-next-new-orders.webp", tone: "orders", productType: "storefront", dismissalType: "attention" },
  orders: { image: "/v1-1/up-next/up-next-review-orders.webp", tone: "orders", productType: "storefront", dismissalType: "attention" },
  draft: { image: "/v1-1/up-next/up-next-landing-draft.webp", tone: "landing", productType: "landing-page", dismissalType: "suggestion" },
  drafts: { image: "/v1-1/up-next/up-next-landing-draft.webp", tone: "landing", productType: "landing-page", dismissalType: "suggestion" },
  store: { image: "/v1-1/up-next/up-next-storefront-draft.webp", tone: "store", productType: "storefront", dismissalType: "suggestion" },
  product: { image: "/v1-1/up-next/up-next-add-product.webp", tone: "store", productType: "storefront", dismissalType: "suggestion" },
  "link-draft": { image: "/v1-1/up-next/up-next-smartlink-draft.webp", tone: "link", productType: "smart-link", dismissalType: "suggestion" },
  share: { image: "/v1-1/up-next/up-next-share-landing.webp", tone: "landing", productType: "landing-page", dismissalType: "suggestion" },
  "store-share": { image: "/v1-1/up-next/up-next-share-storefront.webp", tone: "store", productType: "storefront", dismissalType: "suggestion" },
  "link-share": { image: "/v1-1/up-next/up-next-share-smartlink.webp", tone: "link", productType: "smart-link", dismissalType: "suggestion" },
  insights: { image: "/v1-1/up-next/up-next-insights.webp", tone: "insights", productType: "insights", dismissalType: "suggestion" },
  promote: { image: "/v1-1/up-next/up-next-get-traffic.webp", tone: "promote", productType: "landing-page", dismissalType: "suggestion" },
  create: { image: "/v1-1/up-next/up-next-create.webp", tone: "create", productType: "workspace", dismissalType: "suggestion" },
};

export const upNextStateCatalog = Object.freeze(visuals);
export const UP_NEXT_DISMISSAL_TTL = Object.freeze({ attention: 24 * 60 * 60 * 1000, suggestion: 30 * 24 * 60 * 60 * 1000 });

export function normalizeUpNextDismissals(raw, now = Date.now()) {
  if (!raw) return [];
  let parsed;
  try { parsed = JSON.parse(raw); } catch { parsed = []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item) => item && typeof item === "object" && typeof item.key === "string" && Number(item.expiresAt) > now);
}

export function createUpNextDismissal(action, key, now = Date.now()) {
  const dismissalType = action?.dismissalType === "attention" ? "attention" : "suggestion";
  return { key, dismissalType, dismissedAt: now, expiresAt: now + UP_NEXT_DISMISSAL_TTL[dismissalType] };
}

export function decorateUpNext(action) {
  return { ...(visuals[action?.kind] || visuals.create), ...action };
}

export function getFallbackUpNext({ pendingOrders, drafts, store, products, links, publishedPages, routes }) {
  if (pendingOrders.length) return decorateUpNext({ kind: "orders", title: `You have ${pendingOrders.length} order${pendingOrders.length === 1 ? "" : "s"} to review`, description: "Check the orders and confirm them so your customers know what’s next.", ctaLabel: "Review orders", href: routes.orders });
  if (drafts.length) return decorateUpNext({ kind: "draft", title: "You have a landing page to finish", description: "Complete your page and publish it when you’re ready.", ctaLabel: "Continue editing", href: routes.pages });
  if (store && !store.onboardingCompleted) return decorateUpNext({ kind: "store", title: "Your storefront isn’t ready yet", description: "Add the remaining details and get your store ready to share.", ctaLabel: "Continue setup", href: routes.store });
  if (store && products.length === 0) return decorateUpNext({ kind: "product", title: "Add your first product", description: "Add a product to your storefront so people can start ordering from you.", ctaLabel: "Add product", href: routes.products });
  if (store?.isPublished) return decorateUpNext({ kind: "store-share", title: "Your storefront is ready to share", description: "Get your store link and start sharing it with your customers.", ctaLabel: "Get store link", href: routes.store });
  if (links.length) return decorateUpNext({ kind: "link-share", title: "Your smart link is ready", description: "Copy your link and start using it anywhere you need it.", ctaLabel: "Get link", href: routes.links });
  if (publishedPages.length) return decorateUpNext({ kind: "share", title: "Your page is ready to share", description: "Get your link and start sharing it with your audience.", ctaLabel: "View your pages", href: routes.pages });
  return decorateUpNext({ kind: "create", title: "Create something to share", description: "Start with a landing page, storefront or smart link.", ctaLabel: "Create now", href: routes.home });
}
