import {adoptionEvent} from './lib/dashboardPreference';
import PageSkeleton from './components/PageSkeleton';
import SecurityPage from "./pages/SecurityPage";
import PublicStore from "./store/PublicStore";
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

import { Shell } from "./components/Shell";
import { CreateLinkModal } from "./components/CreateLinkModal";
import { LeadsModal } from "./components/LeadsModal";
import { PageTemplateModal } from "./components/PageTemplateModal";
import { ErrorState, LoadingState, Modal } from "./components/UI";
import { useV11Session } from "./lib/useV11Session";
import { useOnboarding } from "./hooks/useOnboarding";
const OnboardingWizard = dynamic(() => import("./components/onboarding/OnboardingWizard").then(module => module.OnboardingWizard), {loading: () => <PageSkeleton/>});
import { V11AuthPage } from "./components/auth/V11AuthPage";
import { V11PasswordPage } from "./components/auth/V11PasswordPage";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { HomePage } from "./pages/HomePage";
import { LinksPage } from "./pages/LinksPage";
import { PagesPage } from "./pages/PagesPage";
const AnalyticsPage = dynamic(() => import("./pages/AnalyticsPage").then(module => module.AnalyticsPage), {loading: () => <PageSkeleton/>});
import { StorePage } from "./pages/StorePage";
import { TrackingPage } from "./pages/TrackingPage";
const AccountPage = dynamic(() => import("./pages/AccountPage").then(module => module.AccountPage), {loading: () => <PageSkeleton/>});
const BillingPage = dynamic(() => import("./pages/BillingPage").then(module => module.BillingPage), {loading: () => <PageSkeleton/>});
import { HelpPage } from "./pages/HelpPage";
import { PublicLandingPreview, PublicProductPreview, PublicStorePreview, RedirectPreview } from "./pages/PublicPreviewPage";
import { v11Routes } from "./config/routes";
import styles from "./styles/v11.module.css";
import { ArrowRight, PackagePlus } from "lucide-react";
import { v11Api } from "./lib/api";
import { creationFeatures } from "./config/features";
import { SubscriptionProvider } from "./components/SubscriptionModal";
import { notify } from "./components/Notifications";

const VersionedPublicPage = dynamic(() => import("./landing/PublicPage"), { ssr: false, loading: () => <LoadingState/> });
const TemplateEditor = dynamic(() => import("./landing/PageEditor"), { ssr: false, loading: () => <PageSkeleton/> });
const CustomBuilder = dynamic(() => import("./landing/CustomBuilder"), { ssr: false, loading: () => <PageSkeleton/> });
const ProductsManager = dynamic(() => import("./store/ProductsManager"), { ssr: false, loading: () => <PageSkeleton/> });
const OrdersManager = dynamic(() => import("./store/OrdersManager"), { ssr: false, loading: () => <PageSkeleton/> });
const StoreSettings = dynamic(() => import("./store/StoreSettings"), { ssr: false, loading: () => <PageSkeleton/> });
const StoreDesign = dynamic(() => import("./store/StoreStudio"), { ssr: false, loading: () => <PageSkeleton/> });
const StoreSetup = dynamic(() => import("./pages/StoreSetupPage"), { ssr: false, loading: () => <PageSkeleton/> });
const dmSans = {variable:"bundled-dm-sans"};
const manrope = {variable:"bundled-manrope"};
const preparingLabel = (path) => {
  if (path.endsWith("/pages") || path.includes("/pages/")) return "Preparing landing pages…";
  if (path.endsWith("/links") || path.endsWith("/analytics") || path.endsWith("/insights")) return "Preparing redirect links…";
  if (path.includes("/store")) return "Preparing storefront…";
  if (path.includes("/settings")) return "Preparing settings…";
  if (path.includes("/affiliate")) return "Preparing affiliate…";
  if (path.includes("/integrations")) return "Preparing integrations…";
  return "Preparing dashboard…";
};

function CreateChooser({ onClose, choose }) {
  const [hasStore,setHasStore]=useState(null);
  const [storeError,setStoreError]=useState(false);
  useEffect(()=>{let live=true;v11Api.store().then(store=>{if(live)setHasStore(Boolean(store));}).catch(error=>{if(!live)return;if(error.status===404)setHasStore(false);else setStoreError(true);});return()=>{live=false;};},[]);

  return <Modal title="What would you like to create?" onClose={onClose}><div className={styles.createChoices}>{creationFeatures.map(feature=>{const {id,action,title,shortDescription,Icon,modalClass}=feature.id==="storefront"&&hasStore?{...feature,action:"product",title:"Add new product",shortDescription:"Add a product to your existing storefront.",Icon:PackagePlus}:feature;return <article key={id} className={`${styles.createChoiceCard} ${styles[modalClass]}`}><button className={styles.createChoiceMain} disabled={id==="storefront"&&hasStore===null} onClick={()=>choose(action)}><span><Icon/></span><div><b>{title}</b><p>{id==="storefront"&&hasStore===null?(storeError?"Could not check your store. Close and try again.":"Checking your storefront…"):shortDescription}</p></div><ArrowRight/></button></article>;})}</div></Modal>;
}

function V11Content() {
  const router = useRouter();
  const path = router.asPath.split("?")[0].replace(/\/$/, "");
  const authRoute = ["/v1-1/login", "/v1-1/register", "/v1-1/forgot-password", "/v1-1/reset-password"].includes(path);
  const publicRoute = authRoute || path === "/v1-1/admin/redirect-links" || /^\/v1-1\/(p|s|r)\//.test(path);
  // Catch-all routes initially expose /v1-1/[[...slug]]. Wait for the real URL
  // before checking authentication, and never load an owner session for visitors.
  const session = useV11Session({ required: !publicRoute, enabled: router.isReady && !publicRoute });
  const onboarding = useOnboarding(session.authenticated && !publicRoute);
  useEffect(()=>{if(session.authenticated&&!publicRoute)adoptionEvent('access');},[session.authenticated,publicRoute]);

  const isPagesList = path.endsWith("/pages") || path.endsWith("/pages/create");
  const isLinksList = path.endsWith("/links") || path.endsWith("/analytics") || path.endsWith("/insights");
  const [linkRevision,setLinkRevision] = useState(0);
  const workspace = useWorkspaceData(session.authenticated && !publicRoute);
  const [modal, setModal] = useState(null), [editingLink, setEditingLink] = useState(null), [leadPage, setLeadPage] = useState(null), [productComposer, setProductComposer] = useState(false);
  const [navigating, setNavigating] = useState(false), [loadingPath, setLoadingPath] = useState("");
  const loadingLabel = preparingLabel(loadingPath || path);
  useEffect(() => { const message = sessionStorage.getItem("v11-auth-notice"); if (message) { sessionStorage.removeItem("v11-auth-notice"); notify.success(message); } }, [path]);
  useEffect(() => {
    const start = (url, {shallow} = {}) => { if(shallow)return;setLoadingPath(String(url).split("?")[0]); setNavigating(true); };
    const finish = () => { setNavigating(false); setLoadingPath(""); };
    const complete = (url,{shallow}={}) => { if(shallow)return;setNavigating(false); setLoadingPath(""); setModal(null); };
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
  if (path === "/v1-1/login") return <V11AuthPage mode="login"/>;
  if (path === "/v1-1/register") return <V11AuthPage mode="register"/>;
  if (path === "/v1-1/forgot-password") return <V11PasswordPage/>;
  if (path === "/v1-1/reset-password") return <V11PasswordPage reset/>;
  const publicParts = path.split("/").filter(Boolean);
  if (publicParts[1] === "p" && publicParts[2]) return <VersionedPublicPage slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "s" && publicParts[2] && publicParts[3]) return <PublicProductPreview slug={decodeURIComponent(publicParts[2])} product={decodeURIComponent(publicParts[3])}/>;
  if (publicParts[1] === "s" && publicParts[2]) return <PublicStore slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "r" && publicParts[2]) return <RedirectPage linkId={decodeURIComponent(publicParts[2])}/>;
  const editor = path.endsWith("/pages/editor"), builder = path.endsWith("/pages/builder");
  if ((session.loading && !session.user)) return <LoadingState label={loadingLabel} progress={session.loading && !session.user ? 32 : 62}/>;
  if (session.error && !session.user) return <div className={styles.standaloneState}><ErrorState message={session.error.message} onRetry={session.refresh}/></div>;
  if (!session.user) return null;
  if (!publicRoute && onboarding.loading) return <LoadingState label="Preparing your setup…" progress={58}/>;
  if (!publicRoute && onboarding.error) return <div className={styles.standaloneState}><ErrorState message="We could not check your account setup. Please try again." onRetry={onboarding.refresh}/></div>;
  if (!publicRoute && onboarding.required) return <><div className={styles.onboardingWorkspaceBackdrop} aria-hidden="true"><SubscriptionProvider user={session.user} refreshSession={session.refresh}><Shell payments={workspace.payments} hasStore={Boolean(workspace.store)} user={session.user} onLogout={session.logout} onCreate={() => {}}><HomePage user={session.user} data={workspace} onCreate={() => {}}/></Shell></SubscriptionProvider></div><OnboardingWizard state={onboarding.data} onLogout={session.logout} onComplete={async () => { await router.replace("/v1-1/dashboard"); await onboarding.refresh(); await session.refresh(); await workspace.refresh(); }}/></>
  if (editor) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><TemplateEditor/></div>;
  if (builder) return <div className={styles.editorIsolation}><div className={styles.editorBreadcrumbBar}><Breadcrumbs/></div><CustomBuilder/></div>;

  const needsWorkspace=path===v11Routes.home || path===v11Routes.store;

  const choose = (type) => { setModal(null); if(type === "product"){setProductComposer(true);if(path!==v11Routes.products)router.push(v11Routes.products);} else if (type === "store") router.push(v11Routes.store); else setModal(type); };
  let content;
  if (path.endsWith("/store/settings")) content = <StoreSettings/>;
  else if (path.endsWith("/store/design")) content = <StoreDesign/>;
  else if (path.endsWith("/store/setup")) content = <StoreSetup user={session.user} refreshSession={session.refresh} onCreated={workspace.refresh}/>;
  else if (path.endsWith("/links")) content = <LinksPage revision={linkRevision} onCreate={() => setModal("link")} onEdit={setEditingLink}/>;
  else if (path.endsWith("/pages") || path.endsWith("/pages/create")) content = <PagesPage onCreate={() => setModal("page")} onLeads={(page, refresh) => setLeadPage({ ...page, refresh })}/>;
  else if (path.endsWith("/analytics") || path.endsWith("/insights")) content = <AnalyticsPage user={session.user} payments={workspace.payments}/>;
  else if (path.endsWith("/store/products")) content = <ProductsManager user={session.user} onDataChange={workspace.refresh} openRequested={productComposer} onOpenHandled={() => setProductComposer(false)}/>;
  else if (path.endsWith("/store/orders")) content = <OrdersManager onDataChange={workspace.refresh}/>;
  else if (path.endsWith("/store")) content = <StorePage data={workspace} user={session.user}/>;
  else if (path.endsWith("/settings/tracking")) content = <TrackingPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/settings/billing")) content = <BillingPage user={session.user}/>;
  else if (path.endsWith("/settings/security")) content = <SecurityPage user={session.user}/>;
  else if (path.endsWith("/settings/plan")) content = <BillingPage user={session.user}/>;
  else if (path.endsWith("/settings/profile") || path.endsWith("/settings")) content = <AccountPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/affiliate")) content = <InProgressPage title="Affiliate"/>;
  else if (path.endsWith("/integrations")) content = <InProgressPage title="Integrations"/>;
  else if (path.endsWith("/help")) content = <HelpPage/>;
  else content = <HomePage user={session.user} data={workspace} onCreate={setModal}/>;
  return <SubscriptionProvider user={session.user} refreshSession={session.refresh}><Head><title>MyTikLink V1.1</title></Head><Shell payments={workspace.payments} hasStore={Boolean(workspace.store)} user={session.user} onLogout={session.logout} onCreate={() => setModal("chooser")} onAddProduct={() => { setProductComposer(true); if(path !== v11Routes.products)router.push(v11Routes.products); }}>{!isPagesList && !isLinksList && workspace.warnings.length > 0 && <div className={styles.dataWarning} role="status"><span>Could not load: {workspace.warnings.join(", ")}. Your other data is available.</span><button type="button" onClick={workspace.refresh}>Retry</button></div>}{navigating&&<div className={styles.routeProgress} role="status" aria-label="Opening page"/>}{needsWorkspace&&workspace.loading?<PageSkeleton/>:needsWorkspace&&workspace.error?<ErrorState message={workspace.error.message} onRetry={workspace.refresh}/>:content}</Shell>{modal === "chooser" && <CreateChooser onClose={() => setModal(null)} choose={choose}/>} {modal === "link" && <CreateLinkModal onClose={() => setModal(null)} onSaved={async()=>{setLinkRevision(n=>n+1);if(!isLinksList)await workspace.refresh();}}/>} {editingLink && <CreateLinkModal link={editingLink} onClose={() => setEditingLink(null)} onSaved={async()=>{setLinkRevision(n=>n+1);if(!isLinksList)await workspace.refresh();}}/>} {modal === "page" && <PageTemplateModal user={session.user} onClose={() => setModal(null)}/>} {leadPage && <LeadsModal page={leadPage} leads={workspace.leads} onClose={() => { leadPage.refresh?.(); setLeadPage(null); }}/>}</SubscriptionProvider>;
}

export default function V11App() {
  if (!isV11Enabled()) return <ErrorPage statusCode={404}/>;
  return <div className={`${styles.v11FontScope} ${dmSans.variable} ${manrope.variable}`}><Head><meta name="viewport" content="width=device-width, initial-scale=1" key="viewport"/></Head><V11Content/></div>;
}
