import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Trash2, Plus, Search } from "lucide-react";
import { SummaryMetrics } from "../components/SummaryMetrics";
import { notify } from "../components/Notifications";
import { Button, EmptyState, PageHeader, Modal } from "../components/UI";
import { WorkspaceCard } from "../components/WorkspaceCard";
import { v11Api, unwrapCollection } from "../lib/api";
import { pageInitial, pageThumbnail } from "../lib/pagePresentation";
import { pageUrl } from "../lib/pageUrl";
import { downloadLeads } from "../lib/leadExport";
import { usePageCollection } from "../hooks/usePageCollection";
import styles from "../styles/v11.module.css";

export function PagesPage({ onCreate, onLeads }) {
  const router = useRouter();
  const [query, setQuery] = useState(""), [search, setSearch] = useState(""), [number, setNumber] = useState(1);
  const [copiedId, setCopiedId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null), [deleting, setDeleting] = useState(false), [exporting, setExporting] = useState(false), [deleteError, setDeleteError] = useState("");
  const collection = usePageCollection(search, number);
  const { pages, summary, total, page, limit, loading, error, refresh } = collection;
  useEffect(() => { const timer = setTimeout(() => { setSearch(query.trim()); setNumber(1); }, 300); return () => clearTimeout(timer); }, [query]);
  const remove = async () => {
    if (!pendingDelete || deleting || exporting) return;
    setDeleting(true); setDeleteError("");
    try { await v11Api.deletePage(pendingDelete._id); setPendingDelete(null); notify.success("Landing page deleted"); await refresh(); }
    catch { setDeleteError("Couldn’t delete this page. Please try again."); }
    finally { setDeleting(false); }
  };
  const exportBeforeDelete = async () => {
    setExporting(true); setDeleteError("");
    try {
      const records = unwrapCollection(await v11Api.pageLeads(pendingDelete._id), "leads");
      downloadLeads(records, pendingDelete.title);
    } catch { setDeleteError("Couldn’t export the leads. Please retry before deleting."); }
    finally { setExporting(false); }
  };
  const copyUrl = async page => {
    try { await navigator.clipboard.writeText(pageUrl(page)); setCopiedId(page._id); }
    catch { notify.error("Could not copy the page link."); }
  };
  useEffect(() => { if (!copiedId) return; const timer = setTimeout(() => setCopiedId(""), 1800); return () => clearTimeout(timer); }, [copiedId]);
  return <div className={`${styles.page} ${styles.landingPagesView}`}>
    <PageHeader title="Landing pages"/>
    <SummaryMetrics label="Landing page statistics" items={[{ label: "Pages", value: summary?.pages ?? null }, { label: "Leads", value: summary?.leads ?? null }]}/>
    {(summary?.pages > 0 || query) && <div className={styles.landingPageToolbar}>
      <label className={styles.search}><Search size={16} aria-hidden="true"/><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Search landing pages" placeholder="Search your pages…"/></label>
      <Button className={styles.landingPageCreate} onClick={onCreate}><Plus size={16} aria-hidden="true"/>Create</Button>
    </div>}
    {error && <div className={styles.dataWarning} role="alert"><span>{error}{summary ? " Previously loaded information is still shown." : ""}</span><Button onClick={refresh}>Retry</Button></div>}
    {loading && <div className={`${styles.pageListLoading} ${summary ? styles.pageListRefreshing : ""}`} role="status" aria-busy="true" aria-label={summary ? "Updating landing pages" : "Loading landing pages"}><img className={styles.loadingBrand} src="/images/mytiklink-mark-black.png" alt="" width="64" height="64"/></div>}
    {pages.length > 0 ? <div className={styles.workspaceCardGrid} aria-busy={loading}>{pages.map(page => {
      const active = page.availability === "active";
      return <WorkspaceCard key={page._id} thumbnail={pageThumbnail(page)} fallback={pageInitial(page)} title={page.title || "Untitled page"}
        status={active ? "Active" : page.availability === "unverified" ? "Check access" : "Plan required"} statusTone={active ? "success" : "warning"}
        url={pageUrl(page).replace(/^https?:\/\//, "")} href={pageUrl(page)} copied={copiedId === page._id} onCopy={page.availability !== "plan_required" ? () => copyUrl(page) : undefined}
        onLeads={page.hasLeadForm || page.leadsCount > 0 ? () => onLeads(page, refresh) : undefined} leadsLabel={`View leads (${page.leadsCount})`}
        primaryLabel="Edit page" onPrimary={() => router.push(`/v1-1/pages/${page.builderType === "custom" ? "builder" : "editor"}?pageId=${page._id}`)}
        onDelete={() => { setDeleteError(""); setPendingDelete(page); }}/>
    })}</div> : !loading && !error && <EmptyState icon="▣" title={summary?.pages > 0 || search ? "No matching pages" : "Create your first landing page"}
      description={summary?.pages > 0 || search ? "Try a different search." : "Create a page to showcase your offer, collect customer details, or direct people to WhatsApp."}
      action={summary?.pages === 0 && !search ? <Button onClick={onCreate}><Plus size={16}/>Create landing page</Button> : <Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}/>}
    {total > limit && <nav className={styles.pagePagination} aria-label="Landing page results"><Button variant="secondary" disabled={loading || page <= 1} onClick={() => setNumber(page - 1)}>Previous</Button><span>Page {page} of {Math.ceil(total / limit)}</span><Button variant="secondary" disabled={loading || page * limit >= total} onClick={() => setNumber(page + 1)}>Next</Button></nav>}
    {pendingDelete && <Modal className={styles.deleteConfirm} title="Delete landing page?" description="This action cannot be undone." onClose={() => { if (!deleting && !exporting) setPendingDelete(null); }}
      footer={<><Button variant="secondary" disabled={deleting || exporting} onClick={() => setPendingDelete(null)}>Keep page</Button><Button variant="danger" disabled={deleting || exporting} onClick={remove}>{deleting ? "Deleting…" : "Delete page and leads"}</Button></>}>
      <div className={styles.deleteConfirmIcon}><Trash2 size={22}/></div><h3>{pendingDelete.title || "Untitled page"}</h3><p>{pageUrl(pendingDelete)}</p>
      <div className={styles.deleteConfirmDetails}><span>Collected leads <b>{pendingDelete.leadsCount}</b></span></div>
      <p>This permanently deletes this page and all its collected leads. Its shared link will stop working.</p>
      {pendingDelete.leadsCount > 0 && <Button variant="secondary" disabled={exporting || deleting} onClick={exportBeforeDelete}>{exporting ? "Exporting…" : "Export leads before deleting"}</Button>}
      {deleteError && <p role="alert" className={styles.inlineError}>{deleteError}</p>}
    </Modal>}
  </div>;
}
