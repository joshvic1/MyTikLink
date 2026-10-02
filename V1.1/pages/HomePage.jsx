import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Badge, Button, EmptyState, Modal } from "../components/UI";
import { WorkspaceCard } from "../components/WorkspaceCard";
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
  const [featureInfo, setFeatureInfo] = useState(null), [copiedId, setCopiedId] = useState(""), [showAllRecent, setShowAllRecent] = useState(false), [dismissedUpNext, setDismissedUpNext] = useState([]);
  const plan = String(user?.plan || "free").toLowerCase();
  const isFree = plan.startsWith("free");
  const firstName = user?.name?.trim().split(" ")[0];
  const pendingOrders = data.orders.filter((order) => ["new", "pending"].includes(String(order.status).toLowerCase()));
  const drafts = data.pages.filter((page) => !page.published && !page.slug);
  const published = data.pages.filter((page) => page.published || page.slug);
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
    ...data.links.map((item) => ({ ...item, kind: "Redirect link", fallback: "↗", publicUrl: item.linkId ? `mytiklink.com/r/${item.linkId}` : "", publicHref: item.linkId ? `/r/${item.linkId}` : "", status: "Active", tone: "purple", href: v11Routes.links, metrics: [{ label: "Clicks", value: item.redirectCount || 0 }] })),
    ...data.products.map((item) => ({ ...item, title: item.name, kind: "Product", thumbnail: item.imageUrl || item.image || item.images?.[0], fallback: String(item.name || "P").charAt(0).toUpperCase(), status: item.status || "Product", tone: "neutral", href: v11Routes.products, metrics: [{ label: "Price", value: item.price != null ? `₦${Number(item.price).toLocaleString()}` : "—" }] })),
  ].sort((a, b) => dateValue(b) - dateValue(a)).slice(0, 10);
  const isNewWorkspace = data.dashboard?.adaptive?.isNewWorkspace ?? recent.length === 0;
  const visibleRecent = showAllRecent ? recent : recent.slice(0, 4);
  const fallbackNextAction = getFallbackUpNext({ pendingOrders, drafts, store: data.store, products: data.products, links: data.links, publishedPages: published, routes: v11Routes });
  const backendNextAction = data.dashboard?.nextBestAction;
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
  const upNextActions = [nextAction, ...remainingAttention.map(({ tone: _tone, ...item }) => decorateUpNext({ ...item, description: item.copy, ctaLabel: item.action }))]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.kind === item.kind) === index)
    .map((item) => ({ ...item, key: `${item.kind}|${item.title}` }))
    .filter((item) => !dismissedUpNext.some((dismissal) => dismissal.key === item.key && dismissal.expiresAt > Date.now()));
  const copyRecentUrl = async (item) => { await navigator.clipboard.writeText(`${window.location.origin}${item.publicHref}`); setCopiedId(`${item.kind}-${item._id}`); window.setTimeout(() => setCopiedId(""), 1800); };
  const createSection = <section className={`${styles.section} ${styles.goalSection} ${!isNewWorkspace ? styles.goalSectionCompact : ""}`}><div className={styles.sectionTitle}><div><h2>What would you like to do?</h2></div></div><div className={styles.goalGrid}>{creationFeatures.map((feature) => { const { id, action, dashboardTitle, description, Icon, cardClass } = feature; return <article key={id} className={`${styles.goalCard} ${styles[cardClass]}`}><button className={styles.goalCardMain} onClick={() => chooseFeature(action)}><span className={styles.goalIcon}><Icon/></span><div><h3>{dashboardTitle}</h3><p>{description}</p></div><strong>{action === "store" && data.store ? "Manage storefront" : "Get started"} <ArrowRight/></strong></button>{id === "landing-page" && <Badge className={styles.goalRecommended}>RECOMMENDED</Badge>}<button className={`${styles.goalInfo} ${id === "landing-page" ? styles.goalInfoWithBadge : ""}`} aria-label={`More information about ${dashboardTitle}`} onClick={() => setFeatureInfo(feature)}><CircleHelp/></button></article>; })}</div></section>;
  const recentSection = recent.length > 0 && <section className={styles.section}><div className={styles.sectionTitle}><div><h2>Recent work</h2></div>{recent.length > 4 && <button className={styles.sectionLink} onClick={() => setShowAllRecent((value) => !value)}>{showAllRecent ? "Show less" : "View all activity"} <ArrowRight/></button>}</div><div className={`${styles.workspaceCardGrid} ${styles.recentWorkspaceGrid}`}>{visibleRecent.map((item) => { const key = `${item.kind}-${item._id}`; return <WorkspaceCard key={key} thumbnail={item.thumbnail} fallback={item.fallback} eyebrow={item.kind} title={item.title || "Untitled"} status={item.status} statusTone={item.tone} url={item.publicUrl} href={item.publicHref} copied={copiedId === key} onCopy={item.publicHref ? () => copyRecentUrl(item) : undefined} metrics={item.metrics} primaryLabel="Edit" onPrimary={() => router.push(item.href)}/>; })}</div></section>;
  return <div className={`${styles.page} ${styles.dashboardPage}`}>
    <section className={`${styles.homeHero} ${!isNewWorkspace ? styles.homeHeroReturning : ""}`}><div className={styles.workspaceKicker}><span className={styles.eyebrow}>Welcome back{firstName ? `, ${firstName}` : ""}</span><PlanBadge plan={plan}/></div></section>
    <SubscriptionAlert user={user} payments={data.payments}/>
    {upNextActions.length > 0 && <section className={styles.upNextRail} aria-label="Up next suggestions">{upNextActions.map((action) => <div className={styles.upNextSlide} key={action.key}><UpNext action={action} onDismiss={() => dismissUpNext(action, action.key)} onAction={() => action.kind === "create" ? onCreate("chooser") : router.push(action.href)}/></div>)}</section>}
    {isNewWorkspace ? <>{createSection}{isFree && <OnboardingPanel user={user} data={data} chooseFeature={chooseFeature}/>}</> : <>{recentSection}{createSection}{isFree && <OnboardingPanel user={user} data={data} chooseFeature={chooseFeature}/>}</>}
    {!recent.length && !isNewWorkspace && !isFree && <EmptyState title="Your workspace is ready" description="Create your first customer journey." action={<Button onClick={() => onCreate("page")}>Create a landing page</Button>}/>} 
    {featureInfo && <Modal title={featureInfo.dashboardTitle} description={featureInfo.description} onClose={() => setFeatureInfo(null)} footer={<Button onClick={() => { const action = featureInfo.action; setFeatureInfo(null); chooseFeature(action); }}>Get started</Button>}><div className={styles.featureExplainer}><section><b>When to use it</b><p>{featureInfo.helpDescription}</p></section><section><b>How it works</b><p>{featureInfo.example}</p></section><aside>You can return to your dashboard to edit, review performance, or create another tool at any time.</aside></div></Modal>}
  </div>;
}
