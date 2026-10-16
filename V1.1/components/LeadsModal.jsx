import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button, EmptyState, Modal } from "./UI";
import { unwrapCollection, v11Api } from "../lib/api";
import { downloadLeads } from "../lib/leadExport";
import { normalizeLeadPhone } from "../lib/leadPhone";
import styles from "../styles/v11.module.css";

export function LeadsModal({ page, onClose }) {
  const [records, setRecords] = useState(null), [query, setQuery] = useState(""), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true); setError("");
    try {
      const result = await v11Api.pageLeads(page._id);
      if (sequence.current === request) setRecords(unwrapCollection(result, "leads"));
    } catch { if (sequence.current === request) setError("Couldn’t load the leads. Please try again."); }
    finally { if (sequence.current === request) setLoading(false); }
  }, [page._id]);
  useEffect(() => { setRecords(null); setQuery(""); refresh(); return () => { sequence.current += 1; }; }, [refresh]);
  const filtered = (records || []).filter(lead => `${lead.name} ${lead.whatsapp}`.toLowerCase().includes(query.toLowerCase()));
  return <Modal wide title={`${page.title || "Landing page"} leads`} description={records ? `${records.length} customer submission${records.length === 1 ? "" : "s"}` : "Customer submissions"} onClose={onClose}
    footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button disabled={loading || !!error || !records?.length} onClick={() => downloadLeads(records, page.title)}>Export all leads (CSV)</Button></>}>
    <label className={styles.search}><Search aria-hidden="true"/><input aria-label="Search leads by name or WhatsApp number" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name or WhatsApp"/></label>
    <Button variant="ghost" disabled={loading} onClick={refresh}>Refresh leads</Button>
    {loading && <p role="status">Loading leads…</p>}
    {error && <p role="alert" className={styles.inlineError}>{error}</p>}
    {filtered.length > 0 ? <div className={styles.leadList}>{filtered.map(lead => {
      const phone = normalizeLeadPhone(lead.whatsapp);
      return <article key={lead._id}><span><b>{lead.name || "Unnamed lead"}</b><small>{lead.whatsapp}</small></span><small>{new Date(lead.createdAt).toLocaleString()}</small>{phone ? <a href={`https://wa.me/${phone.slice(1)}`} target="_blank" rel="noreferrer">Open WhatsApp →</a> : <small>Country code needed to open WhatsApp</small>}</article>;
    })}</div> : !loading && !error && <EmptyState title={query ? "No matching leads" : "No leads here yet"} description={query ? "Try another name or WhatsApp number." : "Customer submissions from this page will appear here."}/>}
  </Modal>;
}
