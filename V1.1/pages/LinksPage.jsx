import { notify } from "../components/Notifications";
import { useMemo, useState } from "react";
import { Badge, Button, EmptyState, PageHeader } from "../components/UI";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";

export function LinksPage({ links, history, refresh, onCreate, onEdit }) {
  const [query, setQuery] = useState(""), [error, setError] = useState("");
  const filtered = useMemo(() => links.filter((link) => `${link.title} ${link.whatsappCode}`.toLowerCase().includes(query.toLowerCase())), [links, query]);
  const clickCount = (link) => history.filter((item) => String(item.linkId?._id || item.linkId) === String(link._id)).length || link.redirectCount || 0;
  const remove = async (link) => { if (!window.confirm(`Delete “${link.title}”? This cannot be undone.`)) return; try { await v11Api.deleteLink(link._id); await refresh(); notify.success("Deleted successfully"); } catch (e) { setError(e.message); notify.error(e.message); } };
  const copy = async (link) => { try { await navigator.clipboard.writeText(`${window.location.origin}/r/${link.linkId || link.slug || link._id}`); notify.success("Link copied"); } catch { notify.error("Could not copy the link. Please try again."); } };
  return <div className={styles.page}><PageHeader eyebrow="REDIRECT LINKS" title="A shorter path to WhatsApp." description="Create and manage lightweight links for chats, groups, and channels." actions={<Button onClick={onCreate}>＋ Create redirect link</Button>}/>
    <div className={styles.metricRow}><div><span>Redirect links</span><b>{links.length}</b></div><div><span>Recorded clicks</span><b>{links.reduce((sum, link) => sum + Number(clickCount(link)), 0).toLocaleString()}</b></div><div><span>Active</span><b>{links.length}</b></div></div>
    <div className={styles.toolbar}><label className={styles.search}>⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search redirect links"/></label></div>{error && <p className={styles.inlineError}>{error}</p>}
    {filtered.length ? <div className={styles.dataList}>{filtered.map((link) => <article key={link._id}><span className={styles.assetIcon}>↗</span><span className={styles.itemIdentity}><b>{link.title || "Untitled link"}</b><small>{window.location.host}/r/{link.linkId || link.slug || link._id}</small></span><span><small>Destination</small><b>WhatsApp {link.linkType === "dm" ? "chat" : link.linkType}</b></span><span><small>Clicks</small><b>{clickCount(link)}</b></span><Badge tone="success">Active</Badge><div className={styles.rowActions}><Button variant="secondary" onClick={() => copy(link)}>Copy</Button><Button variant="ghost" onClick={() => onEdit(link)}>Edit</Button><Button variant="ghost" onClick={() => remove(link)}>Delete</Button></div></article>)}</div> : <EmptyState icon="↗" title={query ? "No matching links" : "Create your first redirect link"} description={query ? "Try a different search." : "Choose a WhatsApp destination, test the link, then copy and share it."} action={!query && <Button onClick={onCreate}>Create redirect link</Button>}/>}
  </div>;
}
