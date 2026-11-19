import overview from '../store/StoreOverviewStatus.module.css';
import ServiceOverview from '../services/ServiceOverview';
import {servicesEnabled} from '../services/shared';
import useStoreSetup from '../store/useStoreSetup';
import StoreSetupChecklist from '../store/StoreSetupChecklist';
import {deliveryAction} from '../store/setupProgress.mjs';
import {UpNext} from '../components/UpNext';
import StoreSetupPage from "./StoreSetupPage";
import StoreReadyPreview,{StoreReadyThumbnail} from "../components/StoreReadyPreview";
import {useSubscription} from "../components/SubscriptionModal";
import {canUseLandingPages} from "../lib/pageAccess";
import ready from "../components/StoreReadyPreview.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, BadgeCheck, Copy, ExternalLink, Package, Palette, ShoppingBag, WalletCards, Store, Link2 } from "lucide-react";
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

function StoreStatusCard({ live, url, onCopy, onDesign, onVisit, onPreview, onUpgrade, logo, image, checking, statusError }) {
  return <section className={overview.card} data-live={live} aria-busy={checking}>{image&&<img className={overview.art} src={image} alt=""/>}<div className={overview.symbol}>{logo?<img src={logo} alt="Brand logo" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>:null}<Store size={25} style={logo?{display:"none"}:undefined}/></div><div className={overview.content}><span className={overview.status}><i/>{checking?'Checking store status…':statusError?'Status unavailable':live?'Live storefront':'Unavailable'}</span><h2>{checking?'Getting your storefront ready':statusError?'Your storefront':live?'Your storefront is ready to share':'Your storefront is not published'}</h2><p>{checking?'Loading your current publication status.':statusError?'We could not check publication status. Please refresh to try again.':live?'Share your link and welcome your next customer.':'Your store is saved. Publish it when you’re ready for customers.'}</p><button type="button" className={overview.url} onClick={onCopy} title="Copy storefront link"><Link2 size={13}/><span>{url.replace("https://","")}</span><Copy size={12}/></button></div><div className={overview.actions}><button type="button" onClick={onPreview||onCopy}>{onPreview?<><ExternalLink size={15}/>Preview store</>:<><Copy size={15}/>Copy link</>}</button><button type="button" onClick={onUpgrade||onDesign}>{onUpgrade?<><ArrowRight size={15}/>Upgrade to Pro</>:<><Palette size={15}/>Edit design</>}</button>{live&&<button type="button" aria-label="View live store" onClick={onVisit}><ExternalLink size={15}/></button>}</div></section>;
}

export function StorePage({ data,user }) {
  const router = useRouter();
  const serviceBusiness=servicesEnabled&&['physical_services','digital_services'].includes(user?.onboarding?.businessFocus);
  const showProductOverview=!serviceBusiness;
  const setupProgress=useStoreSetup(data.store?._id);
  const [deliveryDismissed,setDeliveryDismissed]=useState(false);
  const [choosing,setChoosing]=useState(false);
  const {openSubscription}=useSubscription();
  const [preview,setPreview]=useState(false);
  const upgrade=()=>openSubscription({mode:"upgrade",preselected:"pro"});
  const [publication, setPublication] = useState(null),[publicationError,setPublicationError]=useState(false);
  useEffect(() => { let active = true;setPublicationError(false); apiRequest("/v1-1/store-studio").then(result => {if(active)setPublication(result);}).catch(() => {if(active)setPublicationError(true);}); return () => { active = false; }; }, [data.products]);
  useEffect(()=>{if(!router.isReady||router.query.action!=="preview-store"||!publication||!data.store)return;setPreview(true);const {action,...query}=router.query;router.replace({pathname:router.pathname,query},undefined,{shallow:true});},[router.isReady,router.query.action,publication,data.store]);
  if (!data.store) return <div className={`${styles.page} ${ready.emptyStorePage}`}><PageHeader title="Storefront"/><section className={ready.createCard}><div className={ready.createArt} aria-hidden="true"><i/><i/><i/></div><h2>Create an online store{user?.onboarding?.publicName ? ` for ${user.onboarding.publicName}` : " for your brand"}</h2><p>Choose a template, and we’ll build {user?.onboarding?.publicName ? `${user.onboarding.publicName}’s storefront` : "your storefront"} so you can upload products and start {user?.onboarding?.businessFocus==="physical_products"?"getting orders":"making sales"}.</p><Button onClick={()=>setChoosing(true)}>Select a template <ArrowRight size={16}/></Button></section>{choosing&&<StoreSetupPage user={user} onClose={()=>setChoosing(false)} onCreated={data.refresh}/>}</div>;

  const store = data.store, stats = data.storeStats || {};
  const pending = data.orders.filter(order => ["new", "pending"].includes(String(order.status).toLowerCase()));
  const lowStock = data.products.filter(product => !product.isDemo && product.trackStock !== false && Number(product.stock ?? product.quantity ?? 99) <= 3);
  const storePath = `/s/${store.slug}`;
  const storeUrl = `https://mytiklink.com${storePath}`;
  const hasStudioStatus = publication && (typeof publication.published === "boolean" || typeof publication.enabled === "boolean");
  const live = hasStudioStatus ? Boolean(publication.published && publication.enabled && publication.available!==false) : false;
  const recentOrders = [...data.orders].slice(0, 4);
  const copyStoreUrl = async () => { try { await navigator.clipboard.writeText(storeUrl); notify.success("Link copied"); } catch { notify.error("Couldn’t copy link"); } };
  const sellsPhysicalProducts = user?.onboarding?.businessFocus === "physical_products";
  const salesOutcome = sellsPhysicalProducts ? "getting orders" : "making sales";
  const storeName = store.businessName || store.name || "Your storefront";

  return <div className={`${styles.page} ${styles.storefrontOverview}`}>
    <StorefrontHeader name={storeName}/>

    {preview&&<StoreReadyPreview detail={publication} onClose={()=>setPreview(false)} onUpgrade={()=>{setPreview(false);upgrade();}}/>}
    <StoreStatusCard checking={!publication&&!publicationError} statusError={publicationError&&!publication} logo={[publication?.design?.brand?.logo,user?.onboarding?.brand?.imageUrl,store.logo].find(value=>typeof value==="string"&&value&&!value.includes("/category-covers/"))} image={publication?.design?.sections?.find(s=>s.type==="hero")?.image||store.cover||store.coverImage||"/v1-1/up-next/up-next-share-storefront.webp"} live={canUseLandingPages(user)&&live} url={storeUrl} onCopy={copyStoreUrl} onDesign={() => router.push(v11Routes.storeDesign)} onVisit={() => window.open(storePath, "_blank")} onPreview={!canUseLandingPages(user)?()=>setPreview(true):undefined} onUpgrade={!canUseLandingPages(user)?upgrade:undefined}/>
    {serviceBusiness&&<ServiceOverview/>}
    {showProductOverview&&<section className={styles.storeOverviewMetrics}>
      <article><span><WalletCards/></span><div><small>Confirmed sales</small><b>₦{Number(stats.totalRevenue || stats.orderValue || 0).toLocaleString()}</b></div></article>
      <article><span><ShoppingBag/></span><div><small>Total orders</small><b>{stats.totalOrders ?? data.orders.length}</b></div></article>
      <article><span><Package/></span><div><small>Products</small><b>{data.products.filter(p=>!p.isDemo).length}</b></div></article>
      <article><span><ArrowRight/></span><div><small>Pending orders</small><b>{pending.length}</b></div></article>
    </section>}
    <StoreSetupChecklist progress={setupProgress?{...setupProgress,serviceBusiness,physicalBusiness:["physical_products","physical_services"].includes(user?.onboarding?.businessFocus)}:null}/>

    {setupProgress?.physicalProducts&&!setupProgress.delivery&&!deliveryDismissed&&<div style={{marginBottom:20}}><UpNext action={deliveryAction} onAction={()=>router.push(deliveryAction.href)} onDismiss={()=>setDeliveryDismissed(true)}/></div>}
    {showProductOverview&&<div className={styles.storeOverviewGrid}>
      <section className={styles.storeOverviewSection}><div className={styles.sectionTitle}><h2>Needs attention</h2><button type="button" onClick={() => router.push(v11Routes.orders)}>View orders <ArrowRight/></button></div><div className={styles.taskList}>{pending.length > 0 && <button onClick={() => router.push(v11Routes.orders)}><span>{pending.length}</span><div><b>Orders waiting for review</b><p>Check payment and keep customers updated.</p></div><strong>Review <ArrowRight/></strong></button>}{lowStock.length > 0 && <button onClick={() => router.push(v11Routes.products)}><span>{lowStock.length}</span><div><b>Products low in stock</b><p>Update inventory before customers order.</p></div><strong>Update <ArrowRight/></strong></button>}{!pending.length && !lowStock.length && <div className={styles.quietTask}>Everything is up to date. Your store has no urgent tasks.</div>}</div></section>
      <section className={styles.storeOverviewSection}><div className={styles.sectionTitle}><h2>Recent orders</h2><button type="button" onClick={() => router.push(v11Routes.orders)}>View all <ArrowRight/></button></div>{recentOrders.length ? <div className={styles.storeRecentOrders}>{recentOrders.map(order => <button key={order._id} onClick={() => router.push(v11Routes.orders)}><span>{order.reference || order.orderNumber || "Order"}</span><small>{order.customer?.name || order.customerName || "Customer"} · ₦{Number(order.total || order.amount || 0).toLocaleString()}</small><Badge tone={String(order.status).toLowerCase() === "completed" ? "success" : "warning"}>{order.status || "Pending"}</Badge></button>)}</div> : <div className={styles.quietTask}>Orders will appear here when customers start purchasing.</div>}</section>
    </div>}
  </div>;
}
