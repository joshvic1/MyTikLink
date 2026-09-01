import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
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

const TemplateEditor = dynamic(() => import("@/pages/dashboard/page/create/edit"), { ssr: false, loading: () => <LoadingState label="Opening the page editor…"/> });
const CustomBuilder = dynamic(() => import("@/pages/dashboard/page/create/custom"), { ssr: false, loading: () => <LoadingState label="Opening the custom builder…"/> });
const ProductsManager = dynamic(() => import("@/pages/store/products"), { ssr: false, loading: () => <LoadingState label="Opening products…"/> });
const OrdersManager = dynamic(() => import("@/pages/store/orders"), { ssr: false, loading: () => <LoadingState label="Opening orders…"/> });
const StoreSettings = dynamic(() => import("@/pages/store/settings"), { ssr: false, loading: () => <LoadingState label="Opening store settings…"/> });
const StoreDesign = dynamic(() => import("@/pages/store/editTemplate"), { ssr: false, loading: () => <LoadingState label="Opening store designer…"/> });
const StoreSetup = dynamic(() => import("@/pages/store"), { ssr: false, loading: () => <LoadingState label="Opening storefront setup…"/> });
const SecurityAndPlan = dynamic(() => import("@/pages/dashboard/settings"), { ssr: false, loading: () => <LoadingState label="Opening secure account controls…"/> });

function CreateChooser({ onClose, choose }) {
  return <Modal title="What would you like to create?" description="Choose the tool that matches what you want to accomplish." onClose={onClose}><div className={styles.createChoices}>{creationFeatures.map(({ id, action, title, shortDescription, Icon, modalClass }) => <button key={id} className={styles[modalClass]} onClick={() => choose(action)}><span><Icon/></span><div><b>{title}</b><p>{shortDescription}</p></div><strong><ArrowRight/></strong></button>)}</div></Modal>;
}

export default function V11App() {
  const router = useRouter();
  const session = useV11Session();
  const workspace = useWorkspaceData(session.authenticated);
  const [modal, setModal] = useState(null), [editingLink, setEditingLink] = useState(null), [leadPage, setLeadPage] = useState(null);
  const path = router.asPath.split("?")[0].replace(/\/$/, "");
  const publicParts = path.split("/").filter(Boolean);
  if (publicParts[1] === "p" && publicParts[2]) return <PublicLandingPreview slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "s" && publicParts[2] && publicParts[3]) return <PublicProductPreview slug={decodeURIComponent(publicParts[2])} product={decodeURIComponent(publicParts[3])}/>;
  if (publicParts[1] === "s" && publicParts[2]) return <PublicStorePreview slug={decodeURIComponent(publicParts[2])}/>;
  if (publicParts[1] === "r" && publicParts[2]) return <RedirectPreview linkId={decodeURIComponent(publicParts[2])}/>;
  const editor = path.endsWith("/pages/editor"), builder = path.endsWith("/pages/builder");
  if (session.loading) return <LoadingState/>;
  if (session.error && !session.user) return <div className={styles.standaloneState}><ErrorState message={session.error.message} onRetry={session.refresh}/></div>;
  if (!session.user) return null;
  if (editor) return <div className={styles.editorIsolation}><TemplateEditor/></div>;
  if (builder) return <div className={styles.editorIsolation}><CustomBuilder/></div>;
  if (path.endsWith("/store/products")) return <div className={styles.editorIsolation}><ProductsManager/></div>;
  if (path.endsWith("/store/orders")) return <div className={styles.editorIsolation}><OrdersManager/></div>;
  if (path.endsWith("/store/settings")) return <div className={styles.editorIsolation}><StoreSettings/></div>;
  if (path.endsWith("/store/design")) return <div className={styles.editorIsolation}><StoreDesign/></div>;
  if (path.endsWith("/store/setup")) return <div className={styles.editorIsolation}><StoreSetup/></div>;
  if (path.endsWith("/settings/security") || path.endsWith("/settings/plan")) return <div className={styles.editorIsolation}><SecurityAndPlan/></div>;
  if (workspace.loading) return <LoadingState label="Loading your real MyTikLink data…"/>;
  if (workspace.error) return <div className={styles.standaloneState}><ErrorState message={workspace.error.message} onRetry={workspace.refresh}/></div>;
  const choose = (type) => { setModal(null); if (type === "store") router.push(v11Routes.store); else setModal(type); };
  let content;
  if (path.endsWith("/links")) content = <LinksPage links={workspace.links} history={workspace.clickHistory} refresh={workspace.refresh} onCreate={() => setModal("link")} onEdit={setEditingLink}/>;
  else if (path.endsWith("/pages") || path.endsWith("/pages/create")) content = <PagesPage pages={workspace.pages} leads={workspace.leads} refresh={workspace.refresh} onCreate={() => setModal("page")} onLeads={setLeadPage}/>;
  else if (path.endsWith("/analytics") || path.endsWith("/insights")) content = <AnalyticsPage links={workspace.links} history={workspace.clickHistory}/>;
  else if (path.endsWith("/store")) content = <StorePage data={workspace}/>;
  else if (path.endsWith("/settings/tracking")) content = <TrackingPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/settings/billing")) content = <BillingPage user={session.user}/>;
  else if (path.endsWith("/settings/profile")) content = <AccountPage user={session.user} refreshSession={session.refresh}/>;
  else if (path.endsWith("/help")) content = <HelpPage/>;
  else content = <HomePage user={session.user} data={workspace} onCreate={setModal}/>;
  return <SubscriptionProvider user={session.user} refreshSession={session.refresh}><Head><title>MyTikLink V1.1</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head><Shell user={session.user} onLogout={session.logout} onCreate={() => setModal("chooser")}>{workspace.warnings.length > 0 && <div className={styles.dataWarning}>Some account data could not be loaded. Available information is still shown.</div>}{content}</Shell>{modal === "chooser" && <CreateChooser onClose={() => setModal(null)} choose={choose}/>} {modal === "link" && <CreateLinkModal onClose={() => setModal(null)} onSaved={workspace.refresh}/>} {editingLink && <CreateLinkModal link={editingLink} onClose={() => setEditingLink(null)} onSaved={workspace.refresh}/>} {modal === "page" && <PageTemplateModal onClose={() => setModal(null)}/>} {leadPage && <LeadsModal page={leadPage} leads={workspace.leads} onClose={() => setLeadPage(null)}/>}</SubscriptionProvider>;
}
