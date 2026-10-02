import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, EmptyState, PageHeader } from "../components/UI";
import { WorkspaceCard } from "../components/WorkspaceCard";
import { v11Api } from "../lib/api";
import { pageHasLeadForm, pageInitial, pageThumbnail } from "../lib/pagePresentation";
import styles from "../styles/v11.module.css";

export function PagesPage({ pages, leads, refresh, onCreate, onLeads }) {
  const router = useRouter(); const [query, setQuery] = useState(""), [error, setError] = useState(""), [copiedId, setCopiedId] = useState("");
  const filtered = useMemo(() => pages.filter((page) => `${page.title} ${page.slug}`.toLowerCase().includes(query.toLowerCase())), [pages, query]);
  const remove = async (page) => { if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return; try { await v11Api.deletePage(page._id); await refresh(); } catch (e) { setError(e.message); } };
  const copyUrl = async (page) => { const url = `${window.location.origin}/p/${page.slug}`; await navigator.clipboard.writeText(url); setCopiedId(page._id); window.setTimeout(() => setCopiedId(""), 1800); };
  return <div className={styles.page}><PageHeader eyebrow="LANDING PAGES" title="Turn interest into action." description="Manage campaign pages, offer pages, lead capture and WhatsApp conversion experiences." actions={<Button onClick={onCreate}>＋ Create landing page</Button>}/><div className={styles.metricRow}><div><span>Landing pages</span><b>{pages.length}</b></div><div><span>Published</span><b>{pages.filter((page) => page.slug).length}</b></div><div><span>Leads collected</span><b>{leads.length}</b></div></div><div className={styles.toolbar}><label className={styles.search}>⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search landing pages"/></label></div>{error && <p className={styles.inlineError}>{error}</p>}
    {filtered.length ? <div className={styles.workspaceCardGrid}>{filtered.map((page) => { const pageLeads = leads.filter((lead) => String(lead.pageId) === String(page._id)); const hasLeadForm = page.hasLeadForm ?? pageHasLeadForm(page); return <WorkspaceCard key={page._id} thumbnail={pageThumbnail(page)} fallback={pageInitial(page)} title={page.title || "Untitled page"} status={page.slug ? "Active" : "Draft"} statusTone={page.slug ? "success" : "warning"} url={page.slug ? `mytiklink.com/p/${page.slug}` : "Not published yet"} href={page.slug ? `/p/${page.slug}` : undefined} copied={copiedId === page._id} onCopy={page.slug ? () => copyUrl(page) : undefined} onLeads={hasLeadForm ? () => onLeads(page) : undefined} metrics={hasLeadForm ? [{ label: "Leads", value: pageLeads.length, onClick: () => onLeads(page) }] : []} primaryLabel="Edit page" onPrimary={() => router.push(`/v1-1/pages/editor?pageId=${page._id}`)} onDelete={() => remove(page)}/>; })}</div> : <EmptyState icon="▣" title={query ? "No matching pages" : "Create your first landing page"} description={query ? "Try a different search." : "Start with a template for your offer or campaign, then decide what visitors should do next."} action={!query && <Button onClick={onCreate}>Choose a template</Button>}/>} 
  </div>;
}
