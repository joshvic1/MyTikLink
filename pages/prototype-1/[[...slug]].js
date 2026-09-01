import Head from "next/head";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const routes = {
  home: "/prototype-1/home",
  pages: "/prototype-1/pages",
  store: "/prototype-1/store",
  products: "/prototype-1/store/products",
  orders: "/prototype-1/store/orders",
  links: "/prototype-1/links",
  insights: "/prototype-1/insights",
  settings: "/prototype-1/settings",
};
const PrototypeData = createContext({});
const usePrototypeData = () => useContext(PrototypeData);
const location =
  typeof window !== "undefined"
    ? window.location
    : {
        host: "mytiklink.com",
        origin: "https://mytiklink.com",
        href: "",
        pathname: "/prototype-1/home",
      };
const apiRequest = async (path, options = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.message || "Something went wrong. Please try again.");
  return body;
};

const icons = {
  home: "⌂",
  pages: "◫",
  store: "◇",
  products: "▦",
  orders: "≡",
  links: "↗",
  insights: "⌁",
  settings: "⚙",
  plus: "+",
  spark: "✦",
};

const nav = [
  ["home", "Home"],
  ["pages", "Landing pages"],
  ["store", "Storefront"],
  ["links", "Smart links"],
  ["insights", "Insights"],
];

const mockPages = [
  {
    name: "Glow Serum Launch",
    meta: "TikTok campaign → WhatsApp",
    status: "Live",
    value: "1,284 visits",
    accent: "peach",
  },
  {
    name: "Weekend Masterclass",
    meta: "Lead capture • Published 2d ago",
    status: "Live",
    value: "82 leads",
    accent: "violet",
  },
  {
    name: "Summer Catering Offer",
    meta: "Draft • Last edited yesterday",
    status: "Finish setup",
    value: "3 steps left",
    accent: "lime",
  },
];
const mockProducts = [
  {
    name: "Linen two-piece set",
    price: "₦38,000",
    stock: "12 in stock",
    color: "#d8b8a0",
  },
  {
    name: "Everyday tote",
    price: "₦18,500",
    stock: "7 in stock",
    color: "#8fa58e",
  },
  {
    name: "Soft ribbed dress",
    price: "₦29,000",
    stock: "Low stock · 2",
    color: "#b69ab9",
  },
];
const mockOrders = [
  {
    id: "#1048",
    customer: "Ada Nwosu",
    item: "Linen two-piece set",
    total: "₦38,000",
    status: "New",
    time: "12 min ago",
  },
  {
    id: "#1047",
    customer: "Tomi Adeyemi",
    item: "Everyday tote",
    total: "₦18,500",
    status: "Confirmed",
    time: "1 hr ago",
  },
  {
    id: "#1046",
    customer: "Ruth Daniel",
    item: "Soft ribbed dress",
    total: "₦29,000",
    status: "Fulfilled",
    time: "Yesterday",
  },
];
const mockLinks = [
  {
    name: "WhatsApp orders",
    url: "mytik.link/go/order",
    destination: "WhatsApp",
    clicks: "438",
    status: "Active",
  },
  {
    name: "Telegram community",
    url: "mytik.link/go/community",
    destination: "Telegram",
    clicks: "196",
    status: "Active",
  },
  {
    name: "New catalogue",
    url: "mytik.link/go/catalogue",
    destination: "Website",
    clicks: "—",
    status: "Draft",
  },
];

function Icon({ name }) {
  return (
    <span className="icon" aria-hidden="true">
      {icons[name] || "•"}
    </span>
  );
}

function Shell({ active, children, onCreate, mode, setMode }) {
  const { user = {} } = usePrototypeData();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (key) => {
    window.history.pushState({}, "", routes[key]);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go("home")}>
          <span className="brandmark">m</span>
          <span>mytiklink</span>
        </button>
        <nav aria-label="Main navigation">
          {nav.map(([key, label]) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={active === key ? "active" : ""}
            >
              <Icon name={key} />
              <span>{label}</span>
              {key === "store" && <small>3</small>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button
            onClick={() => go("settings")}
            className={active === "settings" ? "active" : ""}
          >
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <button className="profile">
            <span className="avatar">
              {(user.name || "User")
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span>
              <b>{user.name || "MyTikLink user"}</b>
              <em>{(user.plan || "free").replaceAll("_", " ")} plan</em>
            </span>
            <span>⌄</span>
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="top-actions">
            <button
              className="mode-switch"
              onClick={() =>
                setMode(mode === "returning" ? "new" : "returning")
              }
            >
              {mode === "returning"
                ? "View new-user state"
                : "View returning state"}
            </button>
            <button className="icon-button" aria-label="Notifications">
              ●<span className="notification-dot" />
            </button>
            <button
              className="primary compact"
              onClick={() => onCreate("chooser")}
            >
              <Icon name="plus" /> Create
            </button>
          </div>
        </header>
        {menuOpen && (
          <div
            className="mobile-drawer-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setMenuOpen(false)
            }
          >
            <aside className="mobile-drawer">
              <div className="mobile-drawer-head">
                <span className="brand">
                  <span className="brandmark">m</span>
                  <span>mytiklink</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>
              <nav>
                {nav.map(([key, label]) => (
                  <button
                    key={key}
                    className={active === key ? "active" : ""}
                    onClick={() => {
                      go(key);
                      setMenuOpen(false);
                    }}
                  >
                    <Icon name={key} />
                    <span>{label}</span>
                    {key === "store" && <small>3</small>}
                  </button>
                ))}
              </nav>
              <div className="mobile-drawer-bottom">
                <button
                  onClick={() => {
                    go("settings");
                    setMenuOpen(false);
                  }}
                >
                  <Icon name="settings" /> Settings
                </button>
                <div>
                  <span className="avatar">AO</span>
                  <span>
                    <b>Amara Okafor</b>
                    <em>Starter plan</em>
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.slice(0, 4).map(([key, label]) => (
          <button
            key={key}
            onClick={() => go(key)}
            className={active === key ? "active" : ""}
          >
            <Icon name={key} />
            <span>{label.replace("Landing ", "")}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PageHeader({ eyebrow, title, copy, action, secondary }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action && (
        <div className="header-actions">
          {secondary && <button className="secondary">{secondary}</button>}
          <button className="primary" onClick={action.onClick}>
            <Icon name="plus" />
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
function Status({ children }) {
  return (
    <span className={"status " + children.toLowerCase().replace(" ", "-")}>
      {children}
    </span>
  );
}

function GoalCard({ kind, title, copy, cta, onClick, badge }) {
  return (
    <button className={"goal-card " + kind} onClick={onClick}>
      <div className="goal-top">
        <span className="goal-icon">
          <Icon
            name={
              kind === "landing" ? "pages" : kind === "shop" ? "store" : "links"
            }
          />
        </span>
        {badge && <span className="recommended">{badge}</span>}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      <span className="goal-cta">
        {cta}
        <b>→</b>
      </span>
    </button>
  );
}

function Home({ mode, onCreate }) {
  const { user = {}, pages = [], links = [], orders = [] } = usePrototypeData();
  const isNew = mode === "new";
  return (
    <div className="page home-page">
      <section className="welcome">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>
            {isNew
              ? "What would you like to do?"
              : `Good morning${user.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
          </h1>
          <p>
            {isNew
              ? "Choose a starting point. Each one works on its own, and you can explore the others whenever you need them."
              : "Here’s what needs your attention, plus a quick way to start something new."}
          </p>
        </div>
        <div className="plan-chip">
          <span>{(user.plan || "free").replaceAll("_", " ")}</span>
          <b>
            {pages.length} landing page{pages.length === 1 ? "" : "s"}
          </b>
          <button onClick={() => navigate("settings")}>View plan</button>
        </div>
      </section>
      {!isNew && (
        <section className="attention">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDLE SOMETHING</span>
              <h2>Worth your attention</h2>
            </div>
            <button className="text-button">View all activity →</button>
          </div>
          <div className="attention-grid">
            <button
              className="attention-card"
              onClick={() => navigate("orders")}
            >
              <span className="signal orange">
                {
                  orders.filter((o) =>
                    ["new", "pending"].includes((o.status || "").toLowerCase()),
                  ).length
                }
              </span>
              <div>
                <b>New store orders</b>
                <p>Orders waiting for your review</p>
              </div>
              <span>Review orders →</span>
            </button>
            <button
              className="attention-card"
              onClick={() => navigate("pages")}
            >
              <span className="signal violet">
                {pages.reduce((n, p) => n + (p.leadsCount || 0), 0)}
              </span>
              <div>
                <b>Landing-page leads</b>
                <p>People who submitted their details</p>
              </div>
              <span>View pages →</span>
            </button>
            <button
              className="attention-card"
              onClick={() => navigate("pages")}
            >
              <span className="signal lime">
                {pages.filter((p) => !p.published).length}
              </span>
              <div>
                <b>Landing-page drafts</b>
                <p>Continue editing before you publish</p>
              </div>
              <span>Continue →</span>
            </button>
          </div>
        </section>
      )}
      <section className="start-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {isNew ? "START HERE" : "START SOMETHING"}
            </span>
            <h2>
              {isNew ? "What are you here to do?" : "Create something new"}
            </h2>
          </div>
          {!isNew && (
            <span className="subtle">Each tool works independently.</span>
          )}
        </div>
        <div className="goal-grid">
          <GoalCard
            kind="landing"
            badge="MOST POPULAR"
            title="Promote an offer or campaign"
            copy="Build a focused page, explain your offer, collect details, or send interested people to WhatsApp."
            cta="Create a landing page"
            onClick={() => onCreate("page")}
          />
          <GoalCard
            kind="shop"
            title="Sell products online"
            copy="Create a storefront where customers can browse products and place orders—even while you’re offline."
            cta="Set up your storefront"
            onClick={() => onCreate("store")}
          />
          <GoalCard
            kind="link"
            title="Send people somewhere"
            copy="Create a simple smart link that takes visitors to WhatsApp, Telegram, or another destination."
            cta="Create a smart link"
            onClick={() => onCreate("link")}
          />
        </div>
      </section>
      {!isNew && (
        <section className="continue-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONTINUE SOMETHING</span>
              <h2>Recent work</h2>
            </div>
            <button className="text-button" onClick={() => navigate("pages")}>
              See everything →
            </button>
          </div>
          <div className="recent-list">
            {pages.slice(0, 2).map((p, i) => (
              <button
                className="recent-row"
                key={p._id}
                onClick={() =>
                  (location.href = `/dashboard/page/create/edit?pageId=${p._id}`)
                }
              >
                <span className={"thumb " + (i ? "violet" : "peach")}>
                  {(p.title || "Untitled page").slice(0, 18)}
                </span>
                <span className="recent-main">
                  <b>{p.title || "Untitled page"}</b>
                  <em>{p.slug ? `mytiklink.com/p/${p.slug}` : "Draft page"}</em>
                </span>
                <Status>{p.published ? "Live" : "Draft"}</Status>
                <span className="recent-value">
                  {p.clickCount || p.views || 0} visits
                </span>
                <span>•••</span>
              </button>
            ))}
            {!pages.length && (
              <div className="real-empty">
                No pages yet. Create your first landing page above.
              </div>
            )}
          </div>
        </section>
      )}
      {isNew && (
        <section className="guided">
          <span className="guided-icon">✦</span>
          <div>
            <b>Not sure where to begin?</b>
            <p>
              Tell us what you want customers to do, and we’ll point you to the
              right starting place.
            </p>
          </div>
          <button className="secondary" onClick={() => onCreate("guide")}>
            Help me choose
          </button>
        </section>
      )}
    </div>
  );
}

function PagesView({ onCreate }) {
  const { pages = [] } = usePrototypeData();
  const visits = pages.reduce((n, p) => n + (p.clickCount || p.views || 0), 0);
  return (
    <div className="page">
      <PageHeader
        eyebrow="LANDING PAGES"
        title="Turn interest into action."
        copy="Create focused pages for offers, campaigns, lead capture, WhatsApp conversations, and more."
        action={{
          label: "Create landing page",
          onClick: () => onCreate("page"),
        }}
      />
      <div className="summary-strip">
        <div>
          <span>Landing pages</span>
          <b>{pages.length}</b>
        </div>
        <div>
          <span>Total visits</span>
          <b>{visits.toLocaleString()}</b>
        </div>
        <div>
          <span>Published</span>
          <b>{pages.filter((p) => p.published || p.slug).length}</b>
        </div>
        <div>
          <span>Drafts</span>
          <b>{pages.filter((p) => !p.published).length}</b>
        </div>
      </div>
      <div className="filterbar">
        <div className="tabs">
          <button className="selected">
            All pages <span>3</span>
          </button>
          <button>
            Live <span>2</span>
          </button>
          <button>
            Drafts <span>1</span>
          </button>
        </div>
        <label className="search">
          ⌕<input placeholder="Search landing pages" />
        </label>
      </div>
      <div className="asset-grid">
        {pages.map((p, i) => (
          <article className="asset-card" key={p._id}>
            <div
              className={"page-preview " + ["peach", "violet", "lime"][i % 3]}
            >
              {p.templateId?.thumbnailUrl ? (
                <img src={p.templateId.thumbnailUrl} alt="" />
              ) : (
                <>
                  <span>mytiklink</span>
                  <strong>{p.title || "Untitled page"}</strong>
                  <i>View offer</i>
                </>
              )}
            </div>
            <div className="asset-body">
              <div>
                <h3>{p.title || "Untitled page"}</h3>
                <p>
                  {p.slug ? `mytiklink.com/p/${p.slug}` : "Not published yet"}
                </p>
              </div>
              <button className="dots">•••</button>
              <div className="asset-meta">
                <Status>{p.published || p.slug ? "Live" : "Draft"}</Status>
                <span>{p.clickCount || p.views || 0} visits</span>
              </div>
              <div className="asset-actions">
                <button
                  className="secondary"
                  onClick={() =>
                    p.slug && window.open(`/p/${p.slug}`, "_blank")
                  }
                >
                  Preview
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    (location.href = `/dashboard/page/create/edit?pageId=${p._id}`)
                  }
                >
                  {p.slug ? "Edit page" : "Continue setup"}
                </button>
              </div>
            </div>
          </article>
        ))}
        {!pages.length && (
          <div className="real-empty asset-empty">
            No landing pages yet. Create one from a professionally designed
            template.
          </div>
        )}
      </div>
    </div>
  );
}

function StoreView({ tab = "overview", onCreate }) {
  const { store, products = [], orders = [], stats = {} } = usePrototypeData();
  if (tab === "products") return <Products onCreate={onCreate} />;
  if (tab === "orders") return <Orders />;
  if (!store)
    return (
      <div className="page">
        <PageHeader
          eyebrow="STOREFRONT"
          title="Start selling online."
          copy="Create your storefront, add products, and receive customer orders in one place."
          action={{
            label: "Set up storefront",
            onClick: () => (location.href = "/store"),
          }}
        />
        <div className="real-empty asset-empty">
          You have not created a storefront yet. Set it up without needing
          Landing Pages or Smart Links.
        </div>
      </div>
    );
  const pending = orders.filter((o) =>
      ["new", "pending"].includes((o.status || "").toLowerCase()),
    ).length,
    low = products.filter((p) => (p.stock ?? p.quantity ?? 99) <= 3).length;
  return (
    <div className="page">
      <PageHeader
        eyebrow="STOREFRONT"
        title={store.businessName || store.name || "Your storefront"}
        copy="Your store is connected to your real products and orders."
        action={{
          label: "Add product",
          onClick: () => (location.href = "/store/products"),
        }}
        secondary="View live store"
      />
      <div className="store-nav">
        <button className="active">Overview</button>
        <button onClick={() => navigate("products")}>Products</button>
        <button onClick={() => navigate("orders")}>
          Orders <span>{pending}</span>
        </button>
        <button onClick={() => (location.href = "/store/editTemplate")}>
          Appearance
        </button>
        <button onClick={() => (location.href = "/store/settings")}>
          Store settings
        </button>
      </div>
      <section className="store-hero">
        <div>
          <span className="live-dot">
            ● {store.isPublished === false ? "DRAFT" : "LIVE"}
          </span>
          <h2>
            Your storefront is{" "}
            {store.isPublished === false ? "almost ready" : "open"}.
          </h2>
          <p>
            Customers can browse your products and place orders at{" "}
            <b>
              {location.host}/s/{store.slug}
            </b>
          </p>
          <div>
            <button
              className="primary"
              onClick={() =>
                navigator.clipboard.writeText(
                  `${location.origin}/s/${store.slug}`,
                )
              }
            >
              Copy store link
            </button>
            <button
              className="secondary"
              onClick={() => window.open(`/s/${store.slug}`, "_blank")}
            >
              Preview store
            </button>
          </div>
        </div>
        <div className="store-phone">
          <div className="phone-head">
            {(store.businessName || store.name || "YOUR STORE").toUpperCase()}
            <br />
            <small>{store.description || "Browse our latest products"}</small>
          </div>
          <div className="mini-products">
            {products.slice(0, 4).map((p) => (
              <i
                key={p._id}
                style={
                  p.images?.[0]
                    ? { backgroundImage: `url(${p.images[0]})` }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>
      <div className="store-columns">
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">NEXT STEPS</span>
              <h2>Keep your store moving</h2>
            </div>
          </div>
          <div className="task-list">
            <button onClick={() => navigate("orders")}>
              <span className="task-icon">{pending}</span>
              <div>
                <b>Review new orders</b>
                <p>Confirm payment and update customers.</p>
              </div>
              <strong>Review →</strong>
            </button>
            <button onClick={() => navigate("products")}>
              <span className="task-icon muted">{low}</span>
              <div>
                <b>Products low in stock</b>
                <p>Update inventory before customers order.</p>
              </div>
              <strong>Update →</strong>
            </button>
            <button>
              <span className="task-icon done">✓</span>
              <div>
                <b>Your store is connected</b>
                <p>Products and orders are live from your account.</p>
              </div>
            </button>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">THIS MONTH</span>
              <h2>Store activity</h2>
            </div>
          </div>
          <div className="store-stats">
            <div>
              <span>Orders</span>
              <b>{stats.totalOrders ?? orders.length}</b>
            </div>
            <div>
              <span>Order value</span>
              <b>
                ₦
                {Number(
                  stats.totalRevenue || stats.orderValue || 0,
                ).toLocaleString()}
              </b>
            </div>
            <div>
              <span>Store visits</span>
              <b>
                {Number(
                  stats.totalVisits || stats.visits || 0,
                ).toLocaleString()}
              </b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function navigate(key) {
  window.history.pushState({}, "", routes[key]);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function Products({ onCreate }) {
  const { products = [] } = usePrototypeData();
  return (
    <div className="page">
      <PageHeader
        eyebrow="STOREFRONT / PRODUCTS"
        title="Products"
        copy="Manage what customers can browse and order from your store."
        action={{
          label: "Add product",
          onClick: () => (location.href = "/store/products"),
        }}
      />
      <div className="store-nav">
        <button onClick={() => navigate("store")}>Overview</button>
        <button className="active">Products</button>
        <button onClick={() => navigate("orders")}>
          Orders <span>3</span>
        </button>
        <button>Appearance</button>
        <button>Store settings</button>
      </div>
      <div className="filterbar">
        <div className="tabs">
          <button className="selected">
            All <span>3</span>
          </button>
          <button>
            Published <span>3</span>
          </button>
          <button>
            Low stock <span>1</span>
          </button>
        </div>
        <label className="search">
          ⌕<input placeholder="Search products" />
        </label>
      </div>
      <div className="product-table">
        <div className="table-head">
          <span>Product</span>
          <span>Price</span>
          <span>Inventory</span>
          <span>Status</span>
          <span></span>
        </div>
        {products.map((p) => (
          <div className="product-row" key={p._id}>
            <span className="product-name">
              {p.images?.[0] || p.image ? (
                <img src={p.images?.[0] || p.image} alt="" />
              ) : (
                <i />
              )}
              <b>{p.name}</b>
            </span>
            <span>₦{Number(p.price || 0).toLocaleString()}</span>
            <span>{p.stock ?? p.quantity ?? 0} in stock</span>
            <Status>{p.isActive === false ? "Draft" : "Live"}</Status>
            <button onClick={() => (location.href = "/store/products")}>
              •••
            </button>
          </div>
        ))}
        {!products.length && (
          <div className="real-empty">
            No products yet. Add your first product to start selling.
          </div>
        )}
      </div>
    </div>
  );
}
function Orders() {
  const { orders = [], refresh } = usePrototypeData();
  const update = async (id, status) => {
    await apiRequest(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    refresh();
  };
  const pending = orders.filter((o) =>
    ["new", "pending"].includes((o.status || "").toLowerCase()),
  ).length;
  return (
    <div className="page">
      <PageHeader
        eyebrow="STOREFRONT / ORDERS"
        title="Orders"
        copy="Review customer orders and keep every delivery moving."
      />
      <div className="store-nav">
        <button onClick={() => navigate("store")}>Overview</button>
        <button onClick={() => navigate("products")}>Products</button>
        <button className="active">
          Orders <span>{pending}</span>
        </button>
        <button onClick={() => (location.href = "/store/editTemplate")}>
          Appearance
        </button>
        <button onClick={() => (location.href = "/store/settings")}>
          Store settings
        </button>
      </div>
      <div className="order-callout">
        <span>{pending}</span>
        <div>
          <b>New orders need your attention</b>
          <p>Review and confirm them so customers know what happens next.</p>
        </div>
        <button
          className="primary"
          onClick={() => orders[0] && update(orders[0]._id, "confirmed")}
        >
          Confirm newest order
        </button>
      </div>
      <div className="filterbar">
        <div className="tabs">
          <button className="selected">All orders</button>
          <button>
            New <span>{pending}</span>
          </button>
          <button>Confirmed</button>
          <button>Fulfilled</button>
        </div>
        <label className="search">
          ⌕<input placeholder="Search orders" />
        </label>
      </div>
      <div className="order-list">
        {orders.map((o) => (
          <button
            className="order-row"
            key={o._id}
            onClick={() =>
              ["new", "pending"].includes((o.status || "").toLowerCase()) &&
              update(o._id, "confirmed")
            }
          >
            <span>
              <b>#{String(o._id).slice(-6).toUpperCase()}</b>
              <em>{new Date(o.createdAt).toLocaleDateString()}</em>
            </span>
            <span>
              <b>{o.customer?.name || o.customerName || "Customer"}</b>
              <em>
                {o.items
                  ?.map((i) => i.name || i.product?.name)
                  .filter(Boolean)
                  .join(", ") || "Store order"}
              </em>
            </span>
            <strong>
              ₦{Number(o.totalAmount || o.total || 0).toLocaleString()}
            </strong>
            <Status>{o.status || "New"}</Status>
            <span>→</span>
          </button>
        ))}
        {!orders.length && (
          <div className="real-empty">
            No orders yet. New customer orders will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

function Links({ onCreate }) {
  const { links = [] } = usePrototypeData();
  const copy = async (l) =>
    navigator.clipboard.writeText(`${location.origin}/r/${l.slug || l._id}`);
  return (
    <div className="page">
      <PageHeader
        eyebrow="SMART LINKS"
        title="A shorter path to action."
        copy="Send people straight to WhatsApp with a simple, trackable link."
        action={{ label: "Create smart link", onClick: () => onCreate("link") }}
      />
      <section className="quick-link">
        <div>
          <span className="eyebrow">QUICK CREATE</span>
          <h2>Start a WhatsApp conversation</h2>
        </div>
        <div className="destination-row">
          <button onClick={() => onCreate("link")}>
            <span className="wa">◉</span>
            <b>WhatsApp chat</b>
            <em>Open a direct chat with an optional ready message</em>
          </button>
          <button onClick={() => onCreate("link")}>
            <span className="tg">➤</span>
            <b>WhatsApp group</b>
            <em>Share a trackable group invitation</em>
          </button>
          <button onClick={() => onCreate("link")}>
            <span className="web">↗</span>
            <b>WhatsApp channel</b>
            <em>Send visitors to your WhatsApp channel</em>
          </button>
        </div>
      </section>
      <div className="section-heading list-title">
        <div>
          <span className="eyebrow">YOUR LINKS</span>
          <h2>Ready to share</h2>
        </div>
      </div>
      <div className="link-list">
        {links.map((l) => (
          <article key={l._id}>
            <span className="link-symbol">↗</span>
            <div className="link-info">
              <b>{l.title || "Untitled link"}</b>
              <em>{`${location.host}/r/${l.slug || l._id}`}</em>
            </div>
            <span className="destination">WhatsApp {l.linkType || "chat"}</span>
            <span className="clicks">
              <b>{l.redirectCount || l.clicks || 0}</b>
              <em>clicks</em>
            </span>
            <Status>Active</Status>
            <button className="secondary" onClick={() => copy(l)}>
              Copy link
            </button>
            <button
              className="dots"
              onClick={() => (location.href = "/dashboard/links")}
            >
              •••
            </button>
          </article>
        ))}
        {!links.length && (
          <div className="real-empty">
            No smart links yet. Create one and share it anywhere.
          </div>
        )}
      </div>
    </div>
  );
}

function Insights() {
  const {
    pages = [],
    links = [],
    orders = [],
    stats = {},
  } = usePrototypeData();
  const pageVisits = pages.reduce(
      (n, p) => n + (p.clickCount || p.views || 0),
      0,
    ),
    linkClicks = links.reduce(
      (n, l) => n + (l.redirectCount || l.clicks || 0),
      0,
    ),
    storeVisits = stats.totalVisits || stats.visits || 0,
    total = pageVisits + linkClicks + storeVisits;
  return (
    <div className="page">
      <PageHeader
        eyebrow="INSIGHTS"
        title="See what’s working."
        copy="Live totals from your pages, store, and smart links."
      />
      <div className="insight-grid">
        <div>
          <span>Total measured visits</span>
          <b>{total.toLocaleString()}</b>
        </div>
        <div>
          <span>Smart-link clicks</span>
          <b>{linkClicks.toLocaleString()}</b>
        </div>
        <div>
          <span>Store orders</span>
          <b>{orders.length.toLocaleString()}</b>
        </div>
      </div>
      <section className="chart-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">REAL ACTIVITY</span>
            <h2>Activity by product area</h2>
          </div>
        </div>
        <div className="activity-breakdown">
          <div>
            <span>Landing pages</span>
            <b>{pageVisits.toLocaleString()} visits</b>
          </div>
          <div>
            <span>Storefront</span>
            <b>{Number(storeVisits).toLocaleString()} visits</b>
          </div>
          <div>
            <span>Smart links</span>
            <b>{linkClicks.toLocaleString()} clicks</b>
          </div>
        </div>
      </section>
      <section className="tracking-card">
        <span className="tracking-icon">⌁</span>
        <div>
          <b>Running TikTok or Meta ads?</b>
          <p>
            Connect tracking when you’re ready to measure campaign conversions.
          </p>
        </div>
        <button
          className="secondary"
          onClick={() => (location.href = "/dashboard/tiktok-pixel")}
        >
          Manage tracking
        </button>
      </section>
    </div>
  );
}
function Settings() {
  const { user = {}, store } = usePrototypeData();
  return (
    <div className="page">
      <PageHeader
        eyebrow="SETTINGS"
        title="Account settings"
        copy="Your real account and plan details."
      />
      <div className="settings-layout">
        <nav>
          <button className="active">Profile</button>
          <button onClick={() => (location.href = "/payment-history")}>
            Plan & billing
          </button>
          <button onClick={() => (location.href = "/dashboard/tiktok-pixel")}>
            Tracking connections
          </button>
          <button onClick={() => (location.href = "/dashboard/settings")}>
            All settings
          </button>
        </nav>
        <section className="settings-panel">
          <h2>Your profile</h2>
          <p>Manage these details in your existing account settings.</p>
          <div className="form-grid">
            <label>
              Full name
              <input value={user.name || ""} readOnly />
            </label>
            <label>
              Email address
              <input value={user.email || ""} readOnly />
            </label>
            <label>
              Business name
              <input
                value={store?.businessName || store?.name || ""}
                readOnly
              />
            </label>
            <label>
              Current plan
              <input
                value={(user.plan || "free").replaceAll("_", " ")}
                readOnly
              />
            </label>
          </div>
          <button
            className="primary"
            onClick={() => (location.href = "/dashboard/settings")}
          >
            Open account settings
          </button>
        </section>
      </div>
    </div>
  );
}

function Modal({ type, onClose }) {
  const { refresh } = usePrototypeData();
  const [templates, setTemplates] = useState([]),
    [loading, setLoading] = useState(type === "page" || type === "link"),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    linkType: "dm",
    whatsappCode: "",
    prefill: "",
  });
  useEffect(() => {
    if (type !== "page" && type !== "link") return;
    apiRequest(type === "page" ? "/page-templates" : "/templates")
      .then((x) => setTemplates(Array.isArray(x) ? x : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);
  const createLink = async () => {
    if (!form.title.trim() || !form.whatsappCode.trim() || !selected) {
      setError("Add a name, WhatsApp destination, and template.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest("/links", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          whatsappCode: form.whatsappCode.trim(),
          templateId: selected,
        }),
      });
      await refresh();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const choosePage = () => {
    if (!selected) {
      setError("Choose a template to continue.");
      return;
    }
    location.href = `/dashboard/page/create/edit?templateId=${selected}`;
  };
  if (type === "store") {
    location.href = "/store";
    return null;
  }
  if (type === "product") {
    location.href = "/store/products";
    return null;
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={"modal " + (type === "page" ? "template-modal" : "")}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {type === "chooser"
                ? "QUICK CREATE"
                : type === "page"
                  ? "LANDING PAGE TEMPLATES"
                  : "CREATE SMART LINK"}
            </span>
            <h2>
              {type === "chooser"
                ? "What would you like to create?"
                : type === "page"
                  ? "Choose a strong starting point"
                  : "Create a WhatsApp smart link"}
            </h2>
            <p>
              {type === "page"
                ? "Pick a design for your offer. You can customize its content, visitor action, and colors next."
                : type === "link"
                  ? "Set the destination, ready message, and transition style."
                  : "Choose the tool that matches your goal."}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {type === "chooser" || type === "guide" ? (
          <div className="chooser-list">
            <button
              onClick={() => {
                onClose();
                setTimeout(
                  () => document.querySelector("[data-open-page]")?.click(),
                  0,
                );
              }}
            >
              <span className="choice-icon landing">
                <Icon name="pages" />
              </span>
              <span>
                <b>Landing page</b>
                <em>
                  Promote an offer, collect details, or send people to WhatsApp.
                </em>
              </span>
              <strong>→</strong>
            </button>
            <button onClick={() => (location.href = "/store")}>
              <span className="choice-icon shop">
                <Icon name="store" />
              </span>
              <span>
                <b>Storefront</b>
                <em>Let customers browse your products and place orders.</em>
              </span>
              <strong>→</strong>
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("links");
              }}
            >
              <span className="choice-icon link">
                <Icon name="links" />
              </span>
              <span>
                <b>Smart link</b>
                <em>Send people directly to WhatsApp.</em>
              </span>
              <strong>→</strong>
            </button>
          </div>
        ) : type === "page" ? (
          <>
            <div className="modal-body template-body">
              {loading ? (
                <div className="prototype-loader">Loading templates…</div>
              ) : (
                <div className="template-grid">
                  <button
                    className="template-choice special"
                    onClick={() =>
                      (location.href = "/dashboard/page/create/custom")
                    }
                  >
                    <span>+</span>
                    <b>Design from scratch</b>
                    <em>Build your own layout</em>
                  </button>
                  {templates.map((t) => (
                    <button
                      key={t._id}
                      className={
                        "template-choice " +
                        (selected === t._id ? "selected" : "")
                      }
                      onClick={() => setSelected(t._id)}
                    >
                      {t.thumbnailUrl ? (
                        <img src={t.thumbnailUrl} alt="" />
                      ) : (
                        <span className="template-fallback">✦</span>
                      )}
                      <b>{t.name}</b>
                      <em>Preview and customize</em>
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="primary"
                disabled={!selected}
                onClick={choosePage}
              >
                Use this template →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              <div className="form-stack">
                <label>
                  Link name
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. WhatsApp orders"
                  />
                </label>
                <label>
                  WhatsApp destination
                  <select
                    value={form.linkType}
                    onChange={(e) =>
                      setForm({ ...form, linkType: e.target.value })
                    }
                  >
                    <option value="dm">Direct chat</option>
                    <option value="group">Group invitation</option>
                    <option value="channel">Channel</option>
                  </select>
                </label>
                <label>
                  {form.linkType === "dm"
                    ? "WhatsApp number"
                    : "WhatsApp invite link"}
                  <input
                    value={form.whatsappCode}
                    onChange={(e) =>
                      setForm({ ...form, whatsappCode: e.target.value })
                    }
                    placeholder={
                      form.linkType === "dm"
                        ? "+234 803 000 0000"
                        : "Paste the WhatsApp link"
                    }
                  />
                </label>
                {form.linkType === "dm" && (
                  <label>
                    Ready message <span>(optional)</span>
                    <textarea
                      value={form.prefill}
                      onChange={(e) =>
                        setForm({ ...form, prefill: e.target.value })
                      }
                      placeholder="Hello, I would like to know more…"
                    />
                  </label>
                )}
                <div>
                  <span className="form-label">Transition design</span>
                  <div className="link-template-row">
                    {loading ? (
                      <span>Loading…</span>
                    ) : (
                      templates.map((t) => (
                        <button
                          key={t._id}
                          className={selected === t._id ? "selected" : ""}
                          onClick={() => setSelected(t._id)}
                        >
                          {t.thumbnailUrl && (
                            <img src={t.thumbnailUrl} alt="" />
                          )}
                          <b>{t.name}</b>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                {error && <p className="form-error">{error}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="primary"
                disabled={saving}
                onClick={createLink}
              >
                {saving ? "Creating…" : "Create smart link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Prototype() {
  const [path, setPath] = useState("/prototype-1/home");
  const [modal, setModal] = useState(null);
  const [mode, setMode] = useState("returning");
  const [data, setData] = useState({
    user: {},
    pages: [],
    links: [],
    store: null,
    products: [],
    orders: [],
    stats: {},
    loading: true,
    error: "",
  });
  const refresh = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      location.href = "/?auth=login";
      return;
    }
    try {
      const results = await Promise.allSettled([
        apiRequest("/users/plan"),
        apiRequest("/pages"),
        apiRequest("/links"),
        apiRequest("/store/me"),
        apiRequest("/products/me?page=1"),
        apiRequest("/orders/me?page=1"),
        apiRequest("/store/stats?range=30d"),
      ]);
      const value = (i) =>
        results[i].status === "fulfilled" ? results[i].value : null;
      const products = value(4),
        orders = value(5);
      setData({
        user: value(0) || {},
        pages: Array.isArray(value(1)) ? value(1) : [],
        links: Array.isArray(value(2)) ? value(2) : [],
        store: value(3),
        products: Array.isArray(products) ? products : products?.products || [],
        orders: Array.isArray(orders) ? orders : orders?.orders || [],
        stats: value(6) || {},
        loading: false,
        error: "",
      });
    } catch (e) {
      setData((d) => ({ ...d, loading: false, error: e.message }));
    }
  };
  useEffect(() => {
    if (
      location.pathname === "/prototype-1" ||
      location.pathname === "/prototype-1/"
    )
      history.replaceState({}, "", routes.home);
    const sync = () => setPath(location.pathname);
    sync();
    addEventListener("popstate", sync);
    return () => removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    refresh();
  }, []);
  const active = path.includes("/store/products")
    ? "products"
    : path.includes("/store/orders")
      ? "orders"
      : path.includes("/store")
        ? "store"
        : path.includes("/pages")
          ? "pages"
          : path.includes("/links")
            ? "links"
            : path.includes("/insights")
              ? "insights"
              : path.includes("/settings")
                ? "settings"
                : "home";
  const view = useMemo(
    () =>
      active === "home" ? (
        <Home mode={mode} onCreate={setModal} />
      ) : active === "pages" ? (
        <PagesView onCreate={setModal} />
      ) : active === "store" ? (
        <StoreView onCreate={setModal} />
      ) : active === "products" ? (
        <StoreView tab="products" onCreate={setModal} />
      ) : active === "orders" ? (
        <StoreView tab="orders" onCreate={setModal} />
      ) : active === "links" ? (
        <Links onCreate={setModal} />
      ) : active === "insights" ? (
        <Insights />
      ) : (
        <Settings />
      ),
    [active, mode],
  );
  return (
    <PrototypeData.Provider value={{ ...data, refresh }}>
      <div id="prototype-one">
        <Head>
          <title>MyTikLink — Prototype 1.0</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/prototype-1/styles.css" />
        </Head>
        {data.loading ? (
          <div className="prototype-screen-loader">
            Loading your MyTikLink workspace…
          </div>
        ) : (
          <Shell
            active={
              active === "products" || active === "orders" ? "store" : active
            }
            onCreate={setModal}
            mode={mode}
            setMode={setMode}
          >
            {view}
          </Shell>
        )}
        {modal && <Modal type={modal} onClose={() => setModal(null)} />}
        <button hidden data-open-page onClick={() => setModal("page")} />
      </div>
    </PrototypeData.Provider>
  );
}
