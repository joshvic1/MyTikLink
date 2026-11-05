import {apiRequest} from "../lib/api";
import StoreReadyPreview, {StoreReadyThumbnail} from "../components/StoreReadyPreview";
import {dashboardSuggestions} from "../lib/dashboardAccess";
import StarterPagePreview from "../components/StarterPagePreview";
import {useSubscription} from "../components/SubscriptionModal";
import {canUseLandingPages} from "../lib/pageAccess";
import { linkUrl, recordedClicks } from "../lib/linkPresentation";
import { notify } from "../components/Notifications";
import { FeatureHelp } from "../components/FeatureHelp";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Badge, Button, EmptyState, Modal } from "../components/UI";
import RecentEntityCard from "../components/RecentEntityCard";
import { UpNext } from "../components/UpNext";
import { OnboardingPanel } from "../components/OnboardingPanel";
import { SubscriptionAlert } from "../components/SubscriptionAlert";
import { PlanBadge } from "../components/PlanBadge";
import { creationFeatures } from "../config/features";
import { v11Routes } from "../config/routes";
import { createUpNextDismissal, decorateUpNext, getFallbackUpNext, normalizeUpNextDismissals } from "../config/upNextActions";
import { pageHasLeadForm, pageInitial, pageThumbnail } from "../lib/pagePresentation";
import styles from "../styles/v11.module.css";

const dateValue = (item) => new Date(item?.updatedAt || item?.createdAt || 0).getTime();
export function HomePage({ user, data, onCreate }) {
  const router = useRouter();
  const {openSubscription}=useSubscription();
  const [starterPreview,setStarterPreview]=useState(null);
  const [storePreview,setStorePreview]=useState(false),[storeDetail,setStoreDetail]=useState(null);
  const storeReady=Boolean(data.store);
  useEffect(()=>{if(!storeReady)return;let active=true;setStoreDetail(null);apiRequest('/v1-1/store-studio').then(result=>{if(active)setStoreDetail(result);}).catch(()=>{});return()=>{active=false;};},[storeReady,data.store?._id,user?.onboarding?.brand?.preferredColor]);
  const starter=data.pages.find(p=>p.onboardingStarter || String(p._id)===String(user?.onboarding?.firstResource?.id));
  const publishing=canUseLandingPages(user);
  const lockedStarter=starter && (starter.requiresUpgrade ?? !publishing);
  const [featureInfo, setFeatureInfo] = useState(null), [copiedId, setCopiedId] = useState(""), [showAllRecent, setShowAllRecent] = useState(false), [dismissedUpNext, setDismissedUpNext] = useState([]);
  const plan = String(user?.plan || "free").toLowerCase();
  const isFree = plan.startsWith("free");
  const firstName = user?.name?.trim().split(" ")[0];
  const pendingOrders = data.orders.filter((order) => ["new", "pending"].includes(String(order.status).toLowerCase()));
  const drafts = data.pages.filter((page) => !page.published && !page.slug);
  const published = data.pages.filter((page) => (page.published || page.slug) && page.isActive!==false && publishing);
  const chooseFeature = (action) => action === "store" ? router.push(v11Routes.store) : onCreate(action);
  const fallbackAttention = [
    pendingOrders.length && { kind: "orders", count: pendingOrders.length, title: `You have ${pendingOrders.length} order${pendingOrders.length === 1 ? "" : "s"} to review`, copy: "Check the orders and confirm them so your customers know what’s next.", action: "Review orders", href: v11Routes.orders, tone: "coral" },
    drafts.length && { kind: "drafts", count: drafts.length, title: "You have a landing page to finish", copy: "Complete your page and publish it when you’re ready.", action: "Continue editing", href: v11Routes.pages, tone: "violet" },
  ].filter(Boolean).slice(0, 3);
  const attention = (data.dashboard?.attention || fallbackAttention)
    .filter((item) => item.kind !== "leads" || item.attentionVerified === true)
    .map((item) => ({ ...item, copy: item.copy || item.description, tone: item.tone || (item.kind === "orders" ? "coral" : item.kind === "leads" ? "teal" : "violet") })).slice(0, 3);
  const recent = [
    ...data.pages.map((item) => ({ ...item, kind: "Landing page", thumbnail: pageThumbnail(item), fallback: pageInitial(item), publicUrl: item.slug ? `mytiklink.com/p/${item.slug}` : "", publicHref: item.slug ? `/p/${item.slug}` : "", status: item.slug ? "Active" : "Draft", tone: item.slug ? "success" : "warning", href: `/v1-1/pages/editor?pageId=${item._id}`, metrics: (item.hasLeadForm ?? pageHasLeadForm(item)) ? [{ label: "Leads", value: item.leadsCount ?? data.leads.filter((lead) => String(lead.pageId) === String(item._id)).length }] : [] })),
    ...data.links.map((item) => ({ ...item, kind: "Redirect link", fallback: "↗", publicUrl: item.linkId ? linkUrl(item).replace(/^https?:\/\//, "") : "", publicHref: item.linkId ? linkUrl(item) : "", status: item.status || "Active", tone: "purple", href: v11Routes.links, metrics: [{ label: "Clicks", value: recordedClicks(item,data.clickHistory) }] })),
    ...data.products.map((item) => ({ ...item, title: item.name, kind: "Product", thumbnail: item.imageUrl || item.image || item.images?.[0], fallback: String(item.name || "P").charAt(0).toUpperCase(), status: item.status || "Product", tone: "neutral", href: v11Routes.products, metrics: [{ label: "Price", value: item.price != null ? `₦${Number(item.price).toLocaleString()}` : "—" }] })),
  ].sort((a, b) => dateValue(b) - dateValue(a)).slice(0, 10);
  const isNewWorkspace = data.dashboard?.adaptive?.isNewWorkspace ?? recent.length === 0;
  const visibleRecent = showAllRecent ? recent : recent.slice(0, 4);
  const fallbackNextAction = getFallbackUpNext({ pendingOrders, drafts, store: data.store, products: data.products, links: data.links, publishedPages: published, routes: v11Routes });
  const backendNextAction = !publishing ? {kind:"starter-upgrade",title:starter?"Your landing page is ready":"Ready for your next step?",description:"Upgrade to Pro or above to go live and start getting leads.",action:"Upgrade to Pro",href:"/v1-1/pages"} : starter && publishing && starter.isActive!==false ? {kind:"share",title:"Your landing page is ready to share",description:"Copy your link and start sharing it with your audience.",action:"Get page link",href:"/v1-1/pages"} : data.dashboard?.nextBestAction;
  const nextAction = decorateUpNext(backendNextAction?.kind !== "leads" || backendNextAction?.attentionVerified === true ? backendNextAction || fallbackNextAction : fallbackNextAction);
  useEffect(() => {
    const cookieValue = document.cookie.split("; ").find((entry) => entry.startsWith("mytiklink_v11_dismissed_up_next="))?.split("=")[1];
    let storedValue = cookieValue ? decodeURIComponent(cookieValue) : "";
    try { storedValue = window.localStorage.getItem("mytiklink:v1-1:dismissed-up-next") || storedValue; } catch {}
    setDismissedUpNext(normalizeUpNextDismissals(storedValue));
  }, []);
  const dismissUpNext = (action, key) => {
    const active = dismissedUpNext.filter((item) => item.expiresAt > Date.now() && item.key !== key);
    const updated = [...active, createUpNextDismissal(action, key)];
    setDismissedUpNext(updated);
    const stored = JSON.stringify(updated);
    document.cookie = `mytiklink_v11_dismissed_up_next=${encodeURIComponent(stored)}; Max-Age=2592000; Path=/; SameSite=Lax`;
    try { window.localStorage.setItem("mytiklink:v1-1:dismissed-up-next", stored); } catch {}
  };
  const remainingAttention = attention.filter((item) => item.kind !== nextAction.kind);
  const hasPixel=[user.tiktokPixelId,user.metaPixelId,user.snapchatPixelId,user.googlePixelId,user.openaiPixelId].some(Boolean);
  const pixelSuggestion=!publishing||hasPixel?[]:[decorateUpNext({kind:"tracking",title:"Connect your tracking pixel",description:"Connect TikTok, Meta or another platform to measure visits and conversions from your ads.",action:"Connect a pixel",href:"/v1-1/settings/tracking"})];
  const upNextActions = dashboardSuggestions(user,starter,[nextAction, ...pixelSuggestion, ...(publishing?remainingAttention:[]).map(({ tone: _tone, ...item }) => decorateUpNext({ ...item, description: item.copy, ctaLabel: item.action }))],data.store,data.links).map(decorateUpNext)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.kind === item.kind) === index)
    .map((item) => ({ ...item, key: `${item.kind}|${item.title}` }))
    .filter((item) => !dismissedUpNext.some((dismissal) => dismissal.key === item.key && dismissal.expiresAt > Date.now()));
  const copyRecentUrl = async (item) => { try { await navigator.clipboard.writeText(new URL(item.publicHref, process.env.NEXT_PUBLIC_SITE_URL || "https://mytik.link").href); notify.success("Link copied"); setCopiedId(`${item.kind}-${item._id}`); window.setTimeout(() => setCopiedId(""), 1800); } catch { notify.error("Could not copy the link. Please try again."); } };
  const createSection = <section className={`${styles.section} ${styles.goalSection} ${!isNewWorkspace ? styles.goalSectionCompact : ""}`}><div className={styles.sectionTitle}><div><h2>What would you like to do?</h2></div></div><div className={styles.goalGrid}>{creationFeatures.map((feature) => { const { id, action, dashboardTitle, description, Icon, cardClass } = feature; return <article key={id} className={`${styles.goalCard} ${styles[cardClass]}`}><button className={styles.goalCardMain} onClick={() => chooseFeature(action)}><span className={styles.goalIcon}><Icon/></span><div><h3>{dashboardTitle}</h3><p>{description}</p></div><strong>{action === "store" && data.store ? "Manage storefront" : "Get started"} <ArrowRight/></strong></button>{id === "landing-page" && <Badge className={styles.goalRecommended}>RECOMMENDED</Badge>}<button className={`${styles.goalInfo} ${id === "landing-page" ? styles.goalInfoWithBadge : ""}`} aria-label={`More information about ${dashboardTitle}`} onClick={() => setFeatureInfo(feature)}><CircleHelp/></button></article>; })}</div></section>;
  const recentSection = recent.length > 0 && <section className={styles.section}><div className={styles.sectionTitle}><div><h2>Recent work</h2></div>{recent.length > 4 && <button className={styles.sectionLink} onClick={() => setShowAllRecent((value) => !value)}>{showAllRecent ? "Show less" : "View all activity"} <ArrowRight/></button>}</div><div className={`${styles.workspaceCardGrid} ${styles.recentWorkspaceGrid}`}>{visibleRecent.map((item,index)=><RecentEntityCard key={`${item.kind}-${item._id}`} item={item} kind={item.kind==='Landing page'?'page':item.kind==='Redirect link'?'link':'product'} index={index} refresh={data.refresh} store={data.store} user={user}/>)}</div></section>;
  return <div className={`${styles.page} ${styles.dashboardPage}`}>
    <section className={`${styles.homeHero} ${!isNewWorkspace ? styles.homeHeroReturning : ""}`}><div className={styles.workspaceKicker}><span className={styles.eyebrow}>Welcome back{firstName ? `, ${firstName}` : ""}</span><PlanBadge plan={plan}/></div></section>
    <SubscriptionAlert user={user} payments={data.payments}/>
    {upNextActions.length > 0 && <section className={styles.upNextRail} aria-label="Up next suggestions">{upNextActions.map((action) => <div className={styles.upNextSlide} key={action.key}><UpNext thumbnail={["store-upgrade","store-ready"].includes(action.kind)?<StoreReadyThumbnail detail={storeDetail} store={data.store}/>:undefined} secondaryLabel="Preview" page={action.kind==="starter-upgrade"?starter:null} action={action} onDismiss={() => dismissUpNext(action, action.key)} onSecondary={["store-upgrade","store-ready"].includes(action.kind)?()=>setStorePreview(true):action.kind==="starter-upgrade"&&starter?()=>setStarterPreview(starter):undefined} onAction={() => ["starter-upgrade","store-upgrade","redirect-upgrade"].includes(action.kind)?openSubscription({mode:"upgrade",preselected:"pro"}):action.kind === "create" ? onCreate("chooser") : router.push(action.href)}/></div>)}</section>}
    {isNewWorkspace ? <>{createSection}{isFree && <OnboardingPanel user={user} data={data} chooseFeature={chooseFeature}/>}</> : <>{recentSection}{createSection}{isFree && <OnboardingPanel user={user} data={data} chooseFeature={chooseFeature}/>}</>}
    {!recent.length && !isNewWorkspace && !isFree && <EmptyState title="Your workspace is ready" description="Create your first customer journey." action={<Button onClick={() => onCreate("page")}>Create a landing page</Button>}/>} 
    {storePreview&&<StoreReadyPreview detail={storeDetail} onClose={()=>setStorePreview(false)} onUpgrade={publishing?undefined:()=>{setStorePreview(false);openSubscription({mode:"upgrade",preselected:"pro"});}}/>}
    {starterPreview&&<StarterPagePreview page={starterPreview} onClose={()=>setStarterPreview(null)} onUpgrade={()=>{setStarterPreview(null);openSubscription({mode:"upgrade",preselected:"pro"});}}/>}
    {featureInfo && <FeatureHelp feature={featureInfo} onClose={()=>setFeatureInfo(null)} onStart={()=>{const action=featureInfo.action;setFeatureInfo(null);chooseFeature(action);}}/>}
  </div>;
}

