import { useRouter } from "next/router";
import { ArrowRight, BarChart3, ExternalLink, FileText, Link2, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { Badge, Button, EmptyState } from "../components/UI";
import { OnboardingPanel } from "../components/OnboardingPanel";
import { SubscriptionAlert } from "../components/SubscriptionAlert";
import { PlanBadge } from "../components/PlanBadge";
import { creationFeatures } from "../config/features";
import { v11Routes } from "../config/routes";
import styles from "../styles/v11.module.css";

const dateValue = (item) => new Date(item?.updatedAt || item?.createdAt || 0).getTime();
export function HomePage({ user, data, onCreate }) {
  const router = useRouter();
  const plan = String(user?.plan || "free").toLowerCase();
  const isFree = plan.startsWith("free");
  const firstName = user?.name?.trim().split(" ")[0];
  const pendingOrders = data.orders.filter((order) => ["new", "pending"].includes(String(order.status).toLowerCase()));
  const drafts = data.pages.filter((page) => !page.published && !page.slug);
  const published = data.pages.filter((page) => page.published || page.slug);
  const pageViews = data.pages.reduce((sum, page) => sum + Number(page.views || page.viewCount || page.clickCount || 0), 0);
  const hasActivity = Boolean(data.pages.length || data.links.length || data.store || data.products.length);
  const chooseFeature = (action) => action === "store" ? router.push(v11Routes.store) : onCreate(action);
  const attention = [
    pendingOrders.length && { count: pendingOrders.length, title: "Orders waiting for review", copy: "Confirm them so customers know what happens next.", action: "Review orders", href: v11Routes.orders, tone: "coral" },
    data.leads.length && { count: data.leads.length, title: "New landing-page leads", copy: "People have submitted their details.", action: "Review leads", href: v11Routes.pages, tone: "teal" },
    drafts.length && { count: drafts.length, title: "Unfinished landing pages", copy: "Continue editing before you publish.", action: "Continue editing", href: v11Routes.pages, tone: "violet" },
  ].filter(Boolean).slice(0, 3);
  const recent = [
    ...data.pages.map((item) => ({ ...item, kind: "Landing page", Icon: FileText, detail: item.slug ? `mytiklink.com/p/${item.slug}` : "Draft landing page", status: item.slug ? "Published" : "Draft", tone: item.slug ? "success" : "warning", href: `/v1-1/pages/editor?pageId=${item._id}` })),
    ...data.links.map((item) => ({ ...item, kind: "Smart link", Icon: Link2, detail: item.linkId ? `mytiklink.com/r/${item.linkId}` : "WhatsApp smart link", status: "Active", tone: "purple", href: v11Routes.links })),
    ...data.products.map((item) => ({ ...item, title: item.name, kind: "Product", Icon: Package, detail: item.price != null ? `₦${Number(item.price).toLocaleString()}` : "Store product", status: item.status || "Product", tone: "neutral", href: v11Routes.products })),
  ].sort((a, b) => dateValue(b) - dateValue(a)).slice(0, 5);
  const summary = [
    { label: "Published pages", value: published.length, Icon: FileText, href: v11Routes.pages },
    { label: "Views", value: pageViews, Icon: BarChart3, href: v11Routes.pages },
    { label: "Clicks", value: data.clickHistory.length, Icon: Link2, href: v11Routes.insights },
    { label: "Leads", value: data.leads.length, Icon: MessageCircle, href: v11Routes.pages },
    { label: "Orders", value: data.orders.length, Icon: ShoppingBag, href: v11Routes.orders },
  ];
  return <div className={styles.page}>
    <section className={styles.homeHero}><div className={styles.workspaceKicker}><span className={styles.eyebrow}>YOUR WORKSPACE</span><PlanBadge plan={plan}/></div><div className={styles.homeHeading}><div><h1>{hasActivity ? `Welcome back${firstName ? `, ${firstName}` : ""}.` : `Let’s build something${firstName ? `, ${firstName}` : ""}.`}</h1><p>{hasActivity ? "What needs attention and the clearest next step for your workspace." : "Start with one useful customer journey and build from there."}</p></div></div></section>
    <SubscriptionAlert user={user} payments={data.payments}/>
    {isFree && <OnboardingPanel user={user} data={data} chooseFeature={chooseFeature}/>} 
    <section className={styles.section}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>CREATE</span><h2>What do you want to accomplish?</h2></div><span>Choose by outcome.</span></div><div className={styles.goalGrid}>{creationFeatures.map(({ id, action, dashboardTitle, description, Icon, cardClass }) => <button key={id} className={styles[cardClass]} onClick={() => chooseFeature(action)}><span><Icon/></span><div>{id === "landing-page" && <Badge>RECOMMENDED</Badge>}<h3>{dashboardTitle}</h3><p>{description}</p></div><strong>{action === "store" && data.store ? "Manage storefront" : `Create ${id === "landing-page" ? "a landing page" : id === "storefront" ? "a storefront" : "a smart link"}`} <ArrowRight/></strong></button>)}</div></section>
    <section className={`${styles.section} ${styles.summarySection}`}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>PERFORMANCE</span><h2>Summary</h2></div></div><div className={styles.workspaceMetrics}>{summary.map(({ label, value, Icon, href }) => <button key={label} onClick={() => router.push(href)}><Icon/><span>{label}</span><b>{Number(value).toLocaleString()}</b></button>)}</div></section>
    {attention.length > 0 && <section className={styles.section}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>PRIORITY</span><h2>Needs your attention</h2></div></div><div className={styles.attentionGrid}>{attention.map((item) => <button key={item.title} className={styles[`attention_${item.tone}`]} onClick={() => router.push(item.href)}><span className={styles.attentionNumber}>{item.count}</span><div className={styles.attentionCopy}><b>{item.title}</b><p>{item.copy}</p><strong>{item.action} <ArrowRight/></strong></div></button>)}</div></section>}
    {recent.length > 0 ? <section className={styles.section}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>RESUME</span><h2>Recent work</h2></div></div><div className={styles.recentList}>{recent.map(({ Icon, ...item }) => <button key={`${item.kind}-${item._id}`} onClick={() => router.push(item.href)}><span className={styles.assetIcon}><Icon/></span><span><small className={styles.itemKind}>{item.kind}</small><b>{item.title || "Untitled"}</b><small>{item.detail}</small></span><Badge tone={item.tone}>{item.status}</Badge><strong>Open <ExternalLink/></strong></button>)}</div></section> : !isFree && <EmptyState title="Your workspace is ready" description="Create your first customer journey." action={<Button onClick={() => onCreate("page")}>Create a landing page</Button>}/>} 
  </div>;
}
