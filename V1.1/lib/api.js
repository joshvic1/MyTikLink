export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export async function apiRequest(path, options = {}) {
  const token = Object.prototype.hasOwnProperty.call(options, "token") ? options.token : getToken();
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const { timeoutMs = 0, ...requestOptions } = options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const timer = timeoutMs > 0 ? setTimeout(abort, timeoutMs) : null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : await response.text().catch(() => "");

    if (!response.ok) {
      const message = typeof data === "object" ? data.message || data.error : data;
      throw new ApiError(message || "Something went wrong. Please try again.", response.status, data);
    }
    return data;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}

export const v11Api = {
  dashboardV11: () => apiRequest("/v1-1/dashboard"),
  publicPage: (slug) => apiRequest(`/v1-1/pages/public/${encodeURIComponent(slug)}`, { token: null }),
  publicStore: (slug) => apiRequest(`/store/public/${encodeURIComponent(slug)}`, { token: null }),
  publicProducts: (slug) => apiRequest(`/products/public/${encodeURIComponent(slug)}`, { token: null }),
  publicProduct: (slug, product) => apiRequest(`/products/public/${encodeURIComponent(slug)}/${encodeURIComponent(product)}`, { token: null }),
  session: () => apiRequest("/auth/me"),
  plan: () => apiRequest("/users/plan"),
  pages: () => apiRequest("/v1-1/pages"),
  pageCollection: ({ page = 1, search = "" } = {}) => apiRequest(`/v1-1/pages?paged=1&limit=20&page=${page}&search=${encodeURIComponent(search)}`, { timeoutMs: 20000 }),
  pageDetail: (id) => apiRequest(`/v1-1/pages/${encodeURIComponent(id)}`, { timeoutMs: 20000 }),
  pageTemplates: () => apiRequest("/page-templates"),
  links: () => apiRequest("/v1-1/links"),
  linkCollection: ({page=1,search=""}={}) => apiRequest(`/v1-1/links?page=${page}&search=${encodeURIComponent(search)}`, {timeoutMs:20000}),
  linkTemplates: ({ page = 1, search = "", plan = "all" } = {}) => apiRequest(`/v1-1/links/templates?paged=1&limit=12&page=${page}&search=${encodeURIComponent(search)}&plan=${encodeURIComponent(plan)}`),
  store: () => apiRequest("/store/me"),
  storeStats: (range = "30d") => apiRequest(`/store/stats?range=${encodeURIComponent(range)}`),
  products: (page = 1) => apiRequest(`/products/me?page=${page}`),
  orders: (page = 1) => apiRequest(`/orders/me?page=${page}`),
  recentOrders: () => apiRequest("/orders/recent"),
  lowStock: () => apiRequest("/products/low-stock"),
  clickHistory: () => apiRequest("/history"),
  pageLeads: async pageId => {
    const data = await apiRequest(`/v1-1/pages/${pageId}/leads`, { timeoutMs: 20000 });
    if (!Array.isArray(data) && !Array.isArray(data?.leads)) throw new ApiError("Could not load leads. Please try again.", 502);
    return data;
  },
  createLink: (payload) => apiRequest("/v1-1/links", { method: "POST", body: JSON.stringify(payload) }),
  updateLink: (id, payload) => apiRequest(`/v1-1/links/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteLink: (id) => apiRequest(`/v1-1/links/${encodeURIComponent(id)}`, { method: "DELETE" }),
  deletePage: (id) => apiRequest(`/v1-1/pages/${id}`, { method: "DELETE" }),
  paymentHistory: () => apiRequest("/payments/history"),
  initiatePayment: (plan, cycle, keepExpiry = false) => apiRequest("/payments/initiate", { method: "POST", body: JSON.stringify({ plan, cycle, keepExpiry }) }),
  verifyPayment: (reference) => apiRequest(`/payments/verify/${encodeURIComponent(reference)}`),
  updateName: (name) => apiRequest("/users/update-name", { method: "PUT", body: JSON.stringify({ name }) }),
  updatePhone: (whatsappNumber) => apiRequest("/auth/update-whatsapp", { method: "PUT", body: JSON.stringify({ whatsappNumber }) }),
  saveTikTokPixel: (pixelId) => apiRequest("/users/tiktok-pixel", { method: "POST", body: JSON.stringify({ pixelId }) }),
  saveMetaPixel: (pixelId) => apiRequest("/users/meta-pixel", { method: "POST", body: JSON.stringify({ pixelId }) }),
  saveTikTokEvents: (enabled, accessToken) => apiRequest("/users/tiktok-events-api", { method: "POST", body: JSON.stringify({ enabled, accessToken }) }),
  saveMetaConversions: (enabled, accessToken) => apiRequest("/users/meta-conversions-api", { method: "POST", body: JSON.stringify({ enabled, accessToken }) }),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};

export function unwrapCollection(value, key) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  return [];
}
