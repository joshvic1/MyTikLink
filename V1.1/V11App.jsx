import RedirectAdminPage from "./pages/RedirectAdminPage";
import RedirectPage from "./pages/RedirectPage";
import ErrorPage from "next/error";
import { isV11Enabled } from "./lib/release";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { InProgressPage } from "./pages/InProgressPage";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DM_Sans, Manrope } from "next/font/google";
import { Shell } from "./components/Shell";
import { CreateLinkModal } from "./components/CreateLinkModal";
import { LeadsModal } from "./components/LeadsModal";
import { PageTemplateModal } from "./components/PageTemplateModal";
import { ErrorState, LoadingState, Modal } from "./components/UI";
import { useV11Session } from "./lib/useV11Session";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { HomePage } from "./pages/HomePage";
import { LinksPage } from "./pages/LinksPage";
import { PagesPage } from "./pages/PagesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { StorePage } from "./pages/StorePage";
import { TrackingPage } from "./pages/TrackingPage";
import { AccountPage } from "./pages/AccountPage";
import { BillingPage } from "./pages/BillingPage";
import { HelpPage } from "./pages/HelpPage";
import { PublicLandingPreview, PublicProductPreview, PublicStorePreview, RedirectPreview } from "./pages/PublicPreviewPage";
import { v11Routes } from "./config/routes";
import styles from "./styles/v11.module.css";
import { ArrowRight } from "lucide-react";
import { creationFeatures } from "./config/features";
import { SubscriptionProvider } from "./components/SubscriptionModal";

const VersionedPublicPage = dynamic(() => import("./landing/PublicPage"), { ssr: false, loading: () => <LoadingState/> });
const TemplateEditor = dynamic(() => import("./landing/PageEditor"), { ssr: false, loading: () => <LoadingState label="Opening the page editor…"/> });
const CustomBuilder = dynamic(() => import("./landing/CustomBuilder"), { ssr: false, loading: () => <LoadingState label="Opening the custom builder…"/> });
const ProductsManager = dynamic(() => import("@/pages/store/products"), { ssr: false, loading: () => <LoadingState label="Opening products…"/> });
const OrdersManager = dynamic(() => import("@/pages/store/orders"), { ssr: false, loading: () => <LoadingState label="Opening orders…"/> });
const StoreSettings = dynamic(() => import("@/pages/store/settings"), { ssr: false, loading: () => <LoadingState label="Opening store settings…"/> });
const StoreDesign = dynamic(() => import("@/pages/store/editTemplate"), { ssr: false, loading: () => <LoadingState label="Opening store designer…"/> });
const StoreSetup = dynamic(() => import("@/pages/store"), { ssr: false, loading: () => <LoadingState label="Opening storefront setup…"/> });
const SecurityAndPlan = dynamic(() => import("@/pages/dashboard/settings"), { ssr: false, loading: () => <LoadingState label="Opening secure account controls…"/> });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-v11-body" });
const manrope = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-v11-heading" });

function CreateChooser({ onClose, choose }) {
  return <Modal title="What would you like to create?" onClose={onClose}><div className={styles.createChoices}>{creationFeatures.map(feature=>{const {id,action,title,shortDescription,Icon,modalClass}=feature;return <article key={id} className={`${styles.createChoiceCard} ${styles[modalClass]}`}><button className={styles.createChoiceMain} onClick={()=>choose(action)}><span><Icon/></span><div><b>{title}</b><p>{shortDescription}</p></div><ArrowRight/></button></article>;})}</div></Modal>;
}

function V11Content() {
  const router = useRouter();
  const path = router.asPath.split("?")[0].replace(/\/$/, "");
  const publicRoute = path === "/v1-1/admin/redirect-links" || /^\/v1-1\/(p|s|r)\//.test(path);
  const session = useV11Session({ required: !publicRoute });
  const isPagesList = path.endsWith("/pages") || path.endsWith("/pages/create");
  const isLinksList = path.endsWith("/links") || path.endsWith("/analytics") || path.endsWith("/insights");
  const [linkRevision,setLinkRevision] = useState(0);
  const workspace = useWorkspaceData(session.authenticated && !isPagesList && !isLinksList && !publicRoute);
  const [modal, setModal] = useState(null), [editingLink, setEditingLink] = useState(null), [leadPage, setLeadPage] = useState(null);
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    const start = () => setNavigating(true);
    const finish = () => setNavigating(false);
    const complete = () => { setNavigating(false); setModal(null); };
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", complete);
    router.events.on("routeChangeError", finish);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", complete);
      router.events.off("routeChangeError", finish);
    };
  }, [router.events]);
  if(path === "/v1-1/admin/redirect-links")return <RedirectAdminPage/>;
  const publicParts = path.split("/").filter(Boolean);
  if (publicParts[1] === "p" && publicParts[2]) return <VersionedPublicPage slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "s" && publicParts[2] && publicParts[3]) return <PublicProductPreview slug={decodeURIComponent(publicParts[2])} product={decodeURIComponent(publicParts[3])}/>;
  if (publicParts[1] === "s" && publicParts[2]) return <PublicStorePreview slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "r" && publicParts[2]) return <RedirectPage linkId={decodeURIComponent(publicParts[2])}/>;
  const editor = path.endsWith("/pages/editor"), builder = path.endsWith("/pages/builder");
  if (session.loading || navigating) return <LoadingState/>;
  if (session.error && !session.user) return <div className={styles.standaloneState}><ErrorState message={session.error.message} onRetry={session.refresh}/></div>;
  if (!session.user) return null;
  if (editor) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><TemplateEditor/></div>;
  if (builder) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><CustomBuilder/></div>;
  if (path.endsWith("/store/products")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><ProductsManager/></div>;
  if (path.endsWith("/store/orders")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><OrdersManager/></div>;
  if (path.endsWith("/store/settings")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><StoreSettings/></div>;
  if (path.endsWith("/store/design")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><StoreDesign/></div>;
  if (path.endsWith("/store/setup")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><StoreSetup/></div>;
  if (path.endsWith("/settings/security") || path.endsWith("/settings/plan")) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><SecurityAndPlan/></div>;
  if (!isPagesList && !isLinksList && workspace.loading) return <LoadingState label="Loading your real MyTikLink data…"/>;
  if (!isPagesList && !isLinksList && workspace.error) return <div className={styles.standaloneState}><ErrorState message={workspace.error.message} onRetry={workspace.refresh}/></div>;
  const choose = (type) => { setModal(null); if (type === "store") router.push(v11Routes.store); else setModal(type); };
  let content;
  if (path.endsWith("/links")) content = <LinksPage revision={linkRevision} onCreate={() => setModal("link")} onEdit={setEditingLink}/>;
  else if (path.endsWith("/pages") || path.endsWith("/pages/create")) content = <PagesPage onCreate={() => setModal("page")} onLeads={(page, refresh) => setLeadPage({ ...page, refresh })}/>;
  else if (path.endsWith("/analytics") || path.endsWith("/insights")) content = <AnalyticsPage links={workspace.links} history={workspace.clickHistory}/>;
  else if (path.endsWith("/store")) content = <StorePage data={workspace}/>;
  else if (path.endsWith("/settings/tracking")) content = <TrackingPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/settings/billing")) content = <BillingPage user={session.user}/>;
  else if (path.endsWith("/settings/profile")) content = <AccountPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/affiliate")) content = <InProgressPage title="Affiliate"/>;
  else if (path.endsWith("/integrations")) content = <InProgressPage title="Integrations"/>;
  else if (path.endsWith("/help")) content = <HelpPage/>;
  else content = <HomePage user={session.user} data={workspace} onCreate={setModal}/>;
  return <SubscriptionProvider user={session.user} refreshSession={session.refresh}><Head><title>MyTikLink V1.1</title></Head><Shell user={session.user} onLogout={session.logout} onCreate={() => setModal("chooser")}>{!isPagesList && !isLinksList && workspace.warnings.length > 0 && <div className={styles.dataWarning} role="status"><span>Could not load: {workspace.warnings.join(", ")}. Your other data is available.</span><button type="button" onClick={workspace.refresh}>Retry</button></div>}{content}</Shell>{modal === "chooser" && <CreateChooser onClose={() => setModal(null)} choose={choose}/>} {modal === "link" && <CreateLinkModal onClose={() => setModal(null)} onSaved={async()=>{setLinkRevision(n=>n+1);if(!isLinksList)await workspace.refresh();}}/>} {editingLink && <CreateLinkModal link={editingLink} onClose={() => setEditingLink(null)} onSaved={async()=>{setLinkRevision(n=>n+1);if(!isLinksList)await workspace.refresh();}}/>} {modal === "page" && <PageTemplateModal user={session.user} onClose={() => setModal(null)}/>} {leadPage && <LeadsModal page={leadPage} leads={workspace.leads} onClose={() => { leadPage.refresh?.(); setLeadPage(null); }}/>}</SubscriptionProvider>;
}

export default function V11App() {
  if (!isV11Enabled()) return <ErrorPage statusCode={404}/>;
  return <div className={`${styles.v11FontScope} ${dmSans.variable} ${manrope.variable}`}><Head><meta name="viewport" content="width=device-width, initial-scale=1" key="viewport"/></Head><V11Content/></div>;
}
