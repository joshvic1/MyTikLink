import {readLeadReceipt,rememberLeadReceipt,RECEIVED_MESSAGE} from "./leadReceipt.mjs";
import {safeLeadDestination} from "./leadDestination.mjs";
import {trackingData,announceTracking} from "../tracking/browser";
import { Send } from "lucide-react";
import { useId, useState, useRef, useEffect } from "react";
import { normalizeLeadPhone } from "../lib/leadPhone";
import { apiRequest } from "../lib/api";
import styles from "./ThemeRenderer.module.css";
export default function ThemeLeadForm({ section, page, preview, name, className = "", compact = false, interactivePreview = false }) {
  const id = useId();
  const inFlight = useRef(false);
  const [busy,setBusy] = useState(false), [status,setStatus] = useState(""), [done,setDone] = useState(false);
  const [receipt,setReceipt]=useState(null);
  useEffect(()=>{if(preview)return;const restore=()=>{const saved=readLeadReceipt(page);if(saved){setReceipt(saved);setDone(true);setBusy(false);inFlight.current=false;}};restore();window.addEventListener('pageshow',restore);return()=>window.removeEventListener('pageshow',restore);},[page,preview]);
  const submit = async event => {
    event.preventDefault();
    if (inFlight.current || busy || (preview && !interactivePreview) || done) return;
    const values = new FormData(event.currentTarget);
    const whatsapp = normalizeLeadPhone(values.get("whatsapp"));
    if (!whatsapp) {setStatus("Include a valid country code, for example +2348012345678."); return;}
    if (preview) {setStatus("Preview test complete. No enquiry was sent."); return;}
    if (!page?.slug) {setStatus("Publish this page before receiving enquiries."); return;}
    inFlight.current = true;
    setBusy(true);setStatus("");
    try {
      const result = await apiRequest(`/v1-1/pages/public/${encodeURIComponent(page.slug)}/lead`, {token:null, method:"POST",body:JSON.stringify({tracking:trackingData("page",page.slug),name:String(values.get("name")).trim(),whatsapp,company:values.get("company") || ""})});
      if (result?.success !== true) throw new Error("Your enquiry was not confirmed. Please try again.");
      const saved=rememberLeadReceipt(page,result.redirectUrl);setReceipt(saved);setDone(true);
      if(result.alreadySubmitted)return;
      try { if (typeof document !== "undefined") document.dispatchEvent(new Event("v11:lead-success")); } catch {}
      announceTracking("page",page.slug,"lead",result.eventId);
      setDone(true);
      const destination=safeLeadDestination(result.redirectUrl);
      setStatus(destination ? "Your details have been saved. Redirecting…" : section.successMessage || "Thank you. Your enquiry has been received.");
      if(destination)window.location.assign(destination);
    } catch(error) {setStatus(error.message || "Unable to send. Please try again.");} finally {inFlight.current = false;setBusy(false);}
  };
  if(receipt&&!preview)return <div className={`${styles.form} ${className}`}><p role="status">{RECEIVED_MESSAGE}</p>{receipt.destination&&<button type="button" className={styles.action} onClick={()=>window.location.assign(receipt.destination)}>Continue</button>}</div>;
  const buttonLabel = busy ? "Sending…" : done ? "Enquiry received" : section.submitLabel;
  const body = <>{!compact && <span className={styles.eyebrow}>LET’S TALK</span>}<h2>{section.formTitle}</h2>{section.formCopy && <p>{section.formCopy}</p>}<><label htmlFor={`${id}-name`}>Your name<input id={`${id}-name`} name="name" placeholder="Enter your name" autoComplete="name" required maxLength={200} disabled={done || (preview && !interactivePreview)}/></label>
    <label htmlFor={`${id}-phone`}>WhatsApp number<input id={`${id}-phone`} name="whatsapp" type="tel" autoComplete="tel" placeholder="+2348012345678" required maxLength={30} disabled={done || (preview && !interactivePreview)}/></label>
    <div className={styles.honeypot} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off"/></label></div>
    {section.showConsent !== false && <label className={styles.consent}><input type="checkbox" required disabled={done || (preview && !interactivePreview)}/><span>{section.consent}</span></label>}
    <button data-editor-button={buttonLabel} type={preview && !interactivePreview ? "button" : "submit"} className={styles.action} disabled={busy || done} aria-disabled={preview && !interactivePreview || undefined}>{compact ? <><Send size={18} aria-hidden="true"/>{buttonLabel}</> : buttonLabel}</button>
    <p role={done ? "status" : "alert"} aria-live="polite">{status}</p>
  </></>;
  return <form className={`${styles.form} ${className}`} id={preview ? undefined : "enquiry"} onSubmit={submit}>{body}</form>;
}
