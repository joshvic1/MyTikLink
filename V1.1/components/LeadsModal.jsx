import { useMemo, useState } from "react";
import { Button, EmptyState, Modal } from "./UI";
import styles from "../styles/v11.module.css";
import { Search } from "lucide-react";

export function LeadsModal({ page, leads, onClose }) {
  const pageLeads = useMemo(() => leads.filter((lead) => String(lead.pageId) === String(page._id)), [leads, page]);
  const [query, setQuery] = useState("");
  const filtered = pageLeads.filter((lead) => `${lead.name} ${lead.whatsapp}`.toLowerCase().includes(query.toLowerCase()));
  const download = () => { const rows = [["Name", "WhatsApp", "Date"], ...pageLeads.map((lead) => [lead.name, lead.whatsapp, new Date(lead.createdAt).toLocaleString()])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n"); const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); anchor.download = `MyTikLink-Leads-${page.title || "Page"}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href); };
  return <Modal wide title={`${page.title || "Landing page"} leads`} description={`${pageLeads.length} customer submission${pageLeads.length === 1 ? "" : "s"}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button disabled={!pageLeads.length} onClick={download}>Download CSV</Button></>}><label className={styles.search}><Search/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or WhatsApp"/></label>{filtered.length ? <div className={styles.leadList}>{filtered.map((lead) => <article key={lead._id}><span><b>{lead.name || "Unnamed lead"}</b><small>{lead.whatsapp}</small></span><small>{new Date(lead.createdAt).toLocaleString()}</small><a href={`https://api.whatsapp.com/send?phone=${String(lead.whatsapp || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Open WhatsApp →</a></article>)}</div> : <EmptyState title="No leads here yet" description="Customer submissions from this page will appear here."/>}</Modal>;
}
