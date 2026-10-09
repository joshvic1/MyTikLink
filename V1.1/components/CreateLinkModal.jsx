import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Field, Modal, LoadingState } from "./UI";
import { notify } from "./Notifications";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";
import { Sparkles, Search, Check, ArrowRight } from "lucide-react";

function parseWhatsApp(value, preferredType) {
  let type = preferredType || "dm";
  let code = String(value || "").trim().replace(/\s+/g, "");
  const base = code.split("?")[0];
  if (base.includes("whatsapp.com/channel/")) { code = base.split("whatsapp.com/channel/")[1]?.replace(/^\/+|\/+$/g, "") || ""; type = "channel"; }
  else if (base.includes("chat.whatsapp.com")) { code = base.split("/").pop(); type = "group"; }
  else if (base.includes("wa.me/")) { code = base.split("/").pop(); type = "dm"; }
  else if (code.includes("send?phone=")) { code = code.match(/phone=(\d+)/)?.[1] || ""; type = "dm"; }
  else if (/^\+?\d+$/.test(code)) { code = code.replace(/\D/g, ""); type = "dm"; }
  else code = code.replace(/^\/+|\/+$/g, "");
  return { code, type };
}

export function CreateLinkModal({ link, onClose, onSaved }) {
 const editing=Boolean(link);
 const [step,setStep]=useState(0),[search,setSearch]=useState(""),[plan,setPlan]=useState("all"),[page,setPage]=useState(1);
 const [catalog,setCatalog]=useState({templates:[],total:0,totalPages:1});
 const [form,setForm]=useState({title:link?.title||"",linkType:link?.linkType||"dm",whatsappCode:link?.whatsappCode||"",prefill:link?.prefill||"",templateId:link?.templateId?._id||link?.templateId||""});
 const [templateName,setTemplateName]=useState(link?.templateId?.name||"Current design");
 const [state,setState]=useState({loading:false,saving:false,error:""});
 const [retry,setRetry]=useState(0);
 const heading=useRef(null),submitting=useRef(false);
 const parsed=useMemo(()=>parseWhatsApp(form.whatsappCode,form.linkType),[form.whatsappCode,form.linkType]);
 const steps=["Destination","Options","Design","Review"];
 useEffect(()=>{heading.current?.focus();},[step]);
 useEffect(()=>{
  if(step!==2)return;
  let active=true;setState(s=>({...s,loading:true,error:""}));
  const timer=setTimeout(()=>{v11Api.linkTemplates({page,search,plan}).then(data=>{
   if(!active)return;
   if(!Array.isArray(data?.templates))throw new Error("Template search is unavailable. Please try again after the server update.");
   setCatalog(data);
  }).catch(error=>{if(active){setState(s=>({...s,error:error.message}));notify.error(error.message);}}).finally(()=>{if(active)setState(s=>({...s,loading:false}));});},250);
  return()=>{active=false;clearTimeout(timer);};
 },[step,page,search,plan,retry]);
 const validDestination=()=>parsed.type==="dm"?/^\d{7,15}$/.test(parsed.code):/^[A-Za-z0-9_-]{8,}$/.test(parsed.code);
 const next=()=>{
  if(step===0&&(!form.title.trim()||!validDestination())){notify.warning("Add a link name and a valid WhatsApp number or invite link to continue.");return;}
  if(step===2&&!form.templateId){notify.warning("Select a transition template to continue.");return;}
  setStep(s=>Math.min(3,s+1));
 };
 const submit=async()=>{
  if(submitting.current)return;
  if(!form.title.trim()||!validDestination()||!form.templateId){notify.warning("Complete the destination and select a template first.");setStep(0);return;}
  submitting.current=true;setState(s=>({...s,saving:true}));
  try{
   const payload={title:form.title.trim(),linkType:parsed.type,whatsappCode:parsed.code,templateId:form.templateId,...(parsed.type==="dm"&&form.prefill.trim()?{prefill:form.prefill.trim()}:{})};
   if(editing)await v11Api.updateLink(link._id,payload);else await v11Api.createLink(payload);
   notify.success(editing?"Redirect link updated":"Redirect link created");
   try{await onSaved();}catch{notify.warning("Your link was saved. Refresh the page to see it.");}
   onClose();
  }catch(error){notify.error(error.message);}finally{submitting.current=false;setState(s=>({...s,saving:false}));}
 };
 return <Modal wide className={styles.redirectWizard} title={editing?"Edit redirect link":"Create a redirect link"} description="Send people to any link as fast as possible." onClose={()=>{if(!state.saving)onClose();}} footer={<><Button variant="secondary" disabled={state.saving} onClick={()=>step?setStep(s=>s-1):onClose()}>{step?"Back":"Cancel"}</Button><Button disabled={state.saving} onClick={step===3?submit:next}>{state.saving?"Saving…":step===3?(editing?"Save changes":"Create redirect link"):<>Next <ArrowRight size={15}/></>}</Button></>}>
  <ol className={styles.wizardProgress}>{steps.map((title,i)=><li key={title} aria-current={i===step?"step":undefined} className={i<=step?styles.wizardProgressActive:""}><span>{i<step?<Check size={12}/>:i+1}</span>{title}</li>)}</ol>
  <div key={step} className={styles.wizardStep}><h3 ref={heading} tabIndex={-1}>{steps[step]}</h3>
  {step===0&&<div className={styles.formGrid}><Field label="Link name"><input autoComplete="off" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Customer enquiries"/></Field><Field label="Destination" hint="Paste a WhatsApp chat, group or channel link, or an international phone number."><input value={form.whatsappCode} onChange={e=>setForm({...form,whatsappCode:e.target.value})} placeholder="https://wa.me/234…"/></Field></div>}
  {step===1&&<div className={styles.formGrid}><Field label="Destination type" hint="Full WhatsApp URLs are detected automatically."><select value={parsed.type} onChange={e=>setForm({...form,linkType:e.target.value})}><option value="dm">Direct chat</option><option value="group">WhatsApp group</option><option value="channel">WhatsApp channel</option></select></Field>{parsed.type==="dm"?<Field label="Ready message" hint="Optional message visitors can send"><textarea value={form.prefill} onChange={e=>setForm({...form,prefill:e.target.value})} placeholder="Hello, I would like to know more…"/></Field>:<div className={styles.wizardHint}>Visitors will open your WhatsApp {parsed.type}. A ready message is only available for direct chats.</div>}</div>}
  {step===2&&<><div className={styles.templateTools}><label className={styles.templateSearch}><Search size={16}/><input aria-label="Search redirect templates" placeholder="Search designs…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label><label className={styles.wizardFilter}>Plan availability<select value={plan} onChange={e=>{setPlan(e.target.value);setPage(1);}}><option value="all">All designs</option><option value="free">Free</option><option value="standard">Standard</option><option value="pro">Pro</option></select></label></div>
   {state.loading?<div className={styles.templateLoading}><LoadingState label="Loading designs"/></div>:state.error?<div className={styles.wizardHint}><p>{state.error}</p><Button variant="secondary" onClick={()=>setRetry(n=>n+1)}>Try again</Button></div>:<><div className={styles.templateGrid}>{catalog.templates.map(t=><button type="button" key={t._id} aria-pressed={form.templateId===t._id} className={form.templateId===t._id?styles.templateSelected:""} onClick={()=>{setForm({...form,templateId:t._id});setTemplateName(t.name);}}>{t.thumbnailUrl?<img src={t.thumbnailUrl} alt="" loading="lazy"/>:<span><Sparkles/></span>}<b>{t.name}</b></button>)}</div>{!catalog.templates.length&&<p className={styles.wizardHint}>No designs match. Try another search or filter.</p>}</>}
   <div className={styles.templatePagination}><Button variant="secondary" disabled={page===1||state.loading} onClick={()=>setPage(p=>p-1)}>Previous</Button><span aria-live="polite">Page {page} of {catalog.totalPages} · {catalog.total} designs</span><Button variant="secondary" disabled={page>=catalog.totalPages||state.loading} onClick={()=>setPage(p=>p+1)}>Next page</Button></div>{form.templateId&&<p className={styles.wizardHint}>Selected: {templateName}</p>}
  </>}
  {step===3&&<dl className={styles.wizardReview}><div><dt>Link name</dt><dd>{form.title}</dd></div><div><dt>Destination</dt><dd>{form.whatsappCode}</dd></div><div><dt>Type</dt><dd>{parsed.type==="dm"?"Direct chat":`WhatsApp ${parsed.type}`}</dd></div>{parsed.type==="dm"&&form.prefill&&<div><dt>Ready message</dt><dd>{form.prefill}</dd></div>}<div><dt>Design</dt><dd>{templateName}</dd></div></dl>}
  </div>
 </Modal>;
}
