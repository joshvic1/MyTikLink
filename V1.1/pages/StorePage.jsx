import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, BadgeCheck, Copy, ExternalLink, Package, Palette, ShoppingBag, WalletCards } from "lucide-react";
import { apiRequest } from "../lib/api";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Badge, Button, EmptyState, IconButton, PageHeader } from "../components/UI";
import { notify } from "../components/Notifications";
import { v11Routes } from "../config/routes";
import styles from "../styles/v11.module.css";

function StorefrontHeader({ name }) {
  return <header className={styles.storefrontHeader}>
    <div><Breadcrumbs/><h1 title={name}>{name}</h1></div>
  </header>;
}

function StoreStatusCard({ live, url, onCopy, onDesign, onVisit }) {
  return <section className={`${styles.storeStatusCard} ${live ? styles.storeStatusCardLive : ""}`}>
    {live && <span className={styles.storeStatusImage} aria-hidden="true"/>}
    <div className={styles.storePreviewContent}>
      <div className={styles.storeStatusTop}>
        <Badge tone={live ? "success" : "warning"}><i/>{live ? "Live" : "Unavailable"}</Badge>
        {live && <IconButton label="View live store" className={styles.storeVisitButton} onClick={onVisit}><ExternalLink/></IconButton>}
      </div>
      <div className={styles.storePreviewTitle}><span><BadgeCheck/></span><b className={styles.storePreviewHeading}>{live ? "Your storefront is ready to share" : "Your storefront is not published"}</b></div>
      <div className={styles.storeUrlRow}><span title={url}>{url}</span></div>
    </div>
    <div className={styles.storeStatusActions}>
      <Button variant="secondary" onClick={onCopy}><Copy/> Copy link</Button>
      <Button variant="secondary" onClick={onDesign}><Palette/> Edit design</Button>
    </div>
  </section>;
}

export function StorePage({ data }) {
  const router = useRouter();
  const [publication, setPublication] = useState(null);
  useEffect(() => { let active = true; apiRequest("/v1-1/store-studio").then(result => active && setPublication(result)).catch(() => {}); return () => { active = false; }; }, []);
  if (!data.store) return <div className={styles.page}><PageHeader eyebrow="STOREFRONT" title="Start selling online." description="Create a store where customers can browse your products and place orders—even while you’re offline."/><EmptyState icon="◇" title="Set up your storefront" description="Your Storefront is an independent product. You do not need a Landing Page or Redirect Link to use it." action={<Button onClick={() => router.push("/v1-1/store/setup")}>Set up storefront</Button>}/></div>;

  const store = data.store, stats = data.storeStats || {};
  const pending = data.orders.filter(order => ["new", "pending"].includes(String(order.status).toLowerCase()));
  const lowStock = data.products.filter(product => Number(product.stock ?? product.quantity ?? 99) <= 3);
  const storePath = `/v1-1/s/${store.slug}`;
  const storeUrl = `https://mytiklink.com${storePath}`;
  const hasStudioStatus = publication && (typeof publication.published === "boolean" || typeof publication.enabled === "boolean");
  const live = hasStudioStatus ? Boolean(publication.published && publication.enabled) : store.isPublished !== false;
  const recentOrders = [...data.orders].slice(0, 4);
  const copyStoreUrl = async () => { try { await navigator.clipboard.writeText(storeUrl); notify.success("Link copied"); } catch { notify.error("Couldn’t copy link"); } };
  const storeName = store.businessName || store.name || "Your storefront";

  return <div className={`${styles.page} ${styles.storefrontOverview}`}>
    <StorefrontHeader name={storeName}/>
    <StoreStatusCard live={live} url={storeUrl} onCopy={copyStoreUrl} onDesign={() => router.push(v11Routes.storeDesign)} onVisit={() => window.open(storePath, "_blank")}/>
    <section className={styles.storeOverviewMetrics}>
      <article><span><WalletCards/></span><div><small>Confirmed sales</small><b>₦{Number(stats.totalRevenue || stats.orderValue || 0).toLocaleString()}</b></div></article>
      <article><span><ShoppingBag/></span><div><small>Total orders</small><b>{stats.totalOrders ?? data.orders.length}</b></div></article>
      <article><span><Package/></span><div><small>Products</small><b>{data.products.length}</b></div></article>
      <article><span><ArrowRight/></span><div><small>Pending orders</small><b>{pending.length}</b></div></article>
    </section>
    <div className={styles.storeOverviewGrid}>
      <section className={styles.storeOverviewSection}><div className={styles.sectionTitle}><h2>Needs attention</h2><button type="button" onClick={() => router.push(v11Routes.orders)}>View orders <ArrowRight/></button></div><div className={styles.taskList}>{pending.length > 0 && <button onClick={() => router.push(v11Routes.orders)}><span>{pending.length}</span><div><b>Orders waiting for review</b><p>Check payment and keep customers updated.</p></div><strong>Review <ArrowRight/></strong></button>}{lowStock.length > 0 && <button onClick={() => router.push(v11Routes.products)}><span>{lowStock.length}</span><div><b>Products low in stock</b><p>Update inventory before customers order.</p></div><strong>Update <ArrowRight/></strong></button>}{!pending.length && !lowStock.length && <div className={styles.quietTask}>Everything is up to date. Your store has no urgent tasks.</div>}</div></section>
      <section className={styles.storeOverviewSection}><div className={styles.sectionTitle}><h2>Recent orders</h2><button type="button" onClick={() => router.push(v11Routes.orders)}>View all <ArrowRight/></button></div>{recentOrders.length ? <div className={styles.storeRecentOrders}>{recentOrders.map(order => <button key={order._id} onClick={() => router.push(v11Routes.orders)}><span>{order.reference || order.orderNumber || "Order"}</span><small>{order.customer?.name || order.customerName || "Customer"} · ₦{Number(order.total || order.amount || 0).toLocaleString()}</small><Badge tone={String(order.status).toLowerCase() === "completed" ? "success" : "warning"}>{order.status || "Pending"}</Badge></button>)}</div> : <div className={styles.quietTask}>Orders will appear here when customers start purchasing.</div>}</section>
    </div>
  </div>;
}
