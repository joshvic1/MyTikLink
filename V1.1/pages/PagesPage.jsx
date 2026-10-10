import { Trash2, FileText, Globe, Users } from "lucide-react";
import { notify } from "../components/Notifications";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, EmptyState, PageHeader, Modal } from "../components/UI";
import { WorkspaceCard } from "../components/WorkspaceCard";
import { v11Api } from "../lib/api";
import { pageHasLeadForm, pageInitial, pageThumbnail } from "../lib/pagePresentation";
import styles from "../styles/v11.module.css";

export function PagesPage({ pages, leads, refresh, onCreate, onLeads }) {
  const router = useRouter(); const [query, setQuery] = useState(""), [error, setError] = useState(""), [copiedId, setCopiedId] = useState("");
  const [pendingDelete,setPendingDelete]=useState(null),[deleting,setDeleting]=useState(false),[deleteError,setDeleteError]=useState("");
  const filtered = useMemo(() => pages.filter((page) => `${page.title} ${page.slug}`.toLowerCase().includes(query.toLowerCase())), [pages, query]);
  const remove = async () => {
    if(!pendingDelete||deleting)return;
    setDeleting(true);setDeleteError("");
    try { await v11Api.deletePage(pendingDelete._id); setPendingDelete(null); notify.success("Landing page deleted"); try{await refresh();}catch{setError("Page deleted. Refresh to update the list.");} }
    catch(e){setDeleteError(e.message);}finally{setDeleting(false);}
  };
  const copyUrl = async (page) => { const url = `${window.location.origin}/p/${page.slug}`; try { await navigator.clipboard.writeText(url); } catch { notify.error("Could not copy the page link."); return; } setCopiedId(page._id); window.setTimeout(() => setCopiedId(""), 1800); };
  return <div className={styles.page}><PageHeader eyebrow="WORKSPACE" title="LANDING PAGE" actions={<Button onClick={onCreate}>＋ Create landing page</Button>}/><div className={styles.pageMiniStats}><div><FileText/><span>Pages</span><b>{pages.length}</b></div><div><Globe/><span>Published</span><b>{pages.filter(page=>page.slug).length}</b></div><div><Users/><span>Leads</span><b>{leads.length}</b></div></div><div className={styles.toolbar}><label className={styles.search}>⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search landing pages"/></label></div>{error && <p className={styles.inlineError}>{error}</p>}
    {filtered.length ? <div className={styles.workspaceCardGrid}>{filtered.map((page) => { const pageLeads = leads.filter((lead) => String(lead.pageId) === String(page._id)); const hasLeadForm = page.hasLeadForm ?? pageHasLeadForm(page); return <WorkspaceCard key={page._id} thumbnail={pageThumbnail(page)} fallback={pageInitial(page)} title={page.title || "Untitled page"} status={page.slug ? "Active" : "Draft"} statusTone={page.slug ? "success" : "warning"} url={page.slug ? `mytiklink.com/p/${page.slug}` : "Not published yet"} href={page.slug ? `/p/${page.slug}` : undefined} copied={copiedId === page._id} onCopy={page.slug ? () => copyUrl(page) : undefined} onLeads={hasLeadForm ? () => onLeads(page) : undefined} metrics={hasLeadForm ? [{ label: "Leads", value: pageLeads.length, onClick: () => onLeads(page) }] : []} primaryLabel="Edit page" onPrimary={() => router.push(`/v1-1/pages/editor?pageId=${page._id}`)} onDelete={() => {setDeleteError("");setPendingDelete(page);}}/>; })}</div> : <EmptyState icon="▣" title={query ? "No matching pages" : "Create your first landing page"} description={query ? "Try a different search." : "Start with a template for your offer or campaign, then decide what visitors should do next."} action={!query && <Button onClick={onCreate}>Choose a template</Button>}/>}
  {pendingDelete&&<Modal className={styles.deleteConfirm} title="Delete landing page?" description="This action cannot be undone." onClose={()=>{if(!deleting)setPendingDelete(null);}} footer={<><Button variant="secondary" disabled={deleting} onClick={()=>setPendingDelete(null)}>Keep page</Button><Button variant="danger" disabled={deleting} onClick={remove}>{deleting?"Deleting…":"Delete page"}</Button></>}>
   <div className={styles.deleteConfirmIcon}><Trash2 size={22}/></div><h3>{pendingDelete.title||"Untitled page"}</h3><p>{pendingDelete.slug?`mytiklink.com/p/${pendingDelete.slug}`:"Unpublished draft"}</p><div className={styles.deleteConfirmDetails}><span>Status <b>{pendingDelete.slug?"Published":"Draft"}</b></span><span>Collected leads <b>{leads.filter(lead=>String(lead.pageId)===String(pendingDelete._id)).length}</b></span></div><p>The page will be removed and its shared link will no longer open it.</p>{deleteError&&<p role="alert" className={styles.inlineError}>{deleteError}</p>}
  </Modal>}
  </div>;
}
