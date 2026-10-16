import { linkUrl } from "../lib/linkPresentation";
import { normalizeDestination, detectPlatform, validateRedirectDestination } from "../lib/redirectDestination";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from "libphonenumber-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Field, Modal, LoadingState } from "./UI";
import { notify } from "./Notifications";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";
import { Sparkles, Search, Check, ArrowRight } from "lucide-react";

export function CreateLinkModal({ link, onClose, onSaved }) {
 const editing=Boolean(link);
 const [saved,setSaved]=useState(null),[copied,setCopied]=useState(false);
 const [step,setStep]=useState(0),[search,setSearch]=useState(""),[plan,setPlan]=useState("all"),[page,setPage]=useState(1);
 const [catalog,setCatalog]=useState({templates:[],total:0,totalPages:1});
 const [form,setForm]=useState({title:link?.title||"",linkType:link?.linkType||"dm",whatsappCode:link?.destinationUrl||link?.whatsappCode||"",prefill:link?.prefill||"",templateId:link?.design?._id||"default"});
 const [templateName,setTemplateName]=useState(link?.design?.name||"Default design");
 const [state,setState]=useState({loading:false,saving:false,error:""});
 const [retry,setRetry]=useState(0);
 const heading=useRef(null),submitting=useRef(false);
 const [platform,setPlatform]=useState(link?.platform || (link?.linkType==="url"?detectPlatform(link.destinationUrl||link.whatsappCode):"whatsapp"));
 const [purpose,setPurpose]=useState("url");
 const [country,setCountry]=useState("NG"),[fallbackUrl,setFallbackUrl]=useState(link?.fallbackUrl||"");
 const parsed=useMemo(()=>{
  try {
   let value=form.whatsappCode.trim();
   if(platform==="whatsapp"&&/^[+\d\s().-]+$/.test(value)){
    value=value.replace(/^00/,"+");
    const digits=value.replace(/\D/g,"");
    const prefix=getCountryCallingCode(country);
    if(!value.startsWith("+")&&digits.startsWith(prefix))value="+"+digits;
    const number=parsePhoneNumberFromString(value,country);
    if(!number?.isPossible())throw new Error("Enter a valid phone number and choose its country.");
    value=number.number;
   }
   return {...validateRedirectDestination(normalizeDestination({whatsappCode:value,platform,linkType:form.linkType,prefill:form.prefill,fallbackUrl})),valid:true};
  }catch(error){return {valid:false,error:error.message};}
 },[form.whatsappCode,form.linkType,form.prefill,platform,country,fallbackUrl]);
 const platformOptions={whatsapp:[['dm','Direct message / phone number'],['group','Group invite'],['channel','Channel'],['url','Business message or another WhatsApp link']],telegram:[['url','Shared link'],['profile','Profile or bot'],['group','Group invite'],['channel','Channel']],instagram:[['url','Shared link'],['profile','Profile'],['dm','Direct message'],['post','Post or reel']],facebook:[['url','Shared link'],['profile','Page or profile'],['dm','Messenger'],['group','Group']],tiktok:[['url','Shared link'],['profile','Profile'],['video','Video']],x:[['url','Shared link'],['profile','Profile'],['post','Post'],['dm','Direct message']],youtube:[['url','Shared link'],['channel','Channel'],['video','Video or playlist']],linkedin:[['url','Profile, company or post']],snapchat:[['url','Profile or shared content']],website:[['url','Website, checkout, email or other destination']]};
 const enterDestination=value=>{
  const detected=detectPlatform(value);
  let detectedType;
  if(detected!=="website"||/^https?:\/\//i.test(value)||/^[\w-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(value)){
   setPlatform(detected);setPurpose("url");
   try{detectedType=normalizeDestination({destinationUrl:value,platform:detected,fallbackUrl}).linkType;}catch{}
  }
  let embeddedMessage;try{embeddedMessage=new URL(value).searchParams.get("text");}catch{}
  setForm(current=>({...current,whatsappCode:value,...(embeddedMessage!==null&&embeddedMessage!==undefined?{prefill:embeddedMessage}:{}),...(detectedType?{linkType:detectedType}:{})}));
 };
 const steps=["Destination","Design","Review"];
 useEffect(()=>{heading.current?.focus();},[step]);
 useEffect(()=>{
  if(step!==1)return;
  let active=true;setState(s=>({...s,loading:true,error:""}));
  const timer=setTimeout(()=>{v11Api.linkTemplates({page,search,plan}).then(data=>{
   if(!active)return;
   if(!Array.isArray(data?.templates))throw new Error("Template search is unavailable. Please try again after the server update.");
   setCatalog(data);
  }).catch(error=>{if(active){setState(s=>({...s,error:error.message}));notify.error(error.message);}}).finally(()=>{if(active)setState(s=>({...s,loading:false}));});},250);
  return()=>{active=false;clearTimeout(timer);};
 },[step,page,search,plan,retry]);
 const validDestination=()=>parsed.valid;
 const next=()=>{
  if(step===0&&(!form.title.trim()||!validDestination())){notify.warning("Add a link name and a valid destination to continue.");return;}
  if(step===1&&!form.templateId){notify.warning("Select a transition template to continue.");return;}
  setStep(s=>Math.min(2,s+1));
 };
 const submit=async()=>{
  if(submitting.current)return;
  if(!form.title.trim()||!validDestination()||!form.templateId){notify.warning("Complete the destination and select a template first.");setStep(0);return;}
  submitting.current=true;setState(s=>({...s,saving:true}));
  try{
   const {valid,error,...destination}=parsed;
   const payload={title:form.title.trim(),...destination,templateId:form.templateId};
   const result=editing?await v11Api.updateLink(link.linkId,payload):await v11Api.createLink(payload);
   setSaved(result.link||result);
   notify.success(editing?"Redirect link updated":"Redirect link created");
   try{await onSaved();}catch{notify.warning("Your link was saved. Refresh the page to see it.");}

  }catch(error){notify.error(error.message);}finally{submitting.current=false;setState(s=>({...s,saving:false}));}
 };
 if(saved)return <Modal className={styles.redirectWizard} title={editing?"Redirect link updated":"Your redirect link is ready"} onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}><div className={styles.redirectSaved}><Check size={28}/><h3>{saved.title}</h3><p>{linkUrl(saved)}</p><Button onClick={async()=>{try{await navigator.clipboard.writeText(linkUrl(saved));setCopied(true);}catch{notify.error("Could not copy. Select and copy the address above.");}}}>{copied?"Copied":"Copy link"}</Button></div></Modal>;
 return <Modal wide className={styles.redirectWizard} title={editing?"Edit redirect link":"Create a redirect link"} description="Send people to any link as fast as possible." onClose={()=>{if(!state.saving)onClose();}} footer={<><Button variant="secondary" disabled={state.saving} onClick={()=>step?setStep(s=>s-1):onClose()}>{step?"Back":"Cancel"}</Button>{editing&&step===0&&<Button disabled={state.saving||!form.title.trim()||!parsed.valid} onClick={submit}>Save changes</Button>}<Button disabled={state.saving||(step===0&&(!form.title.trim()||!parsed.valid))||(step===1&&!form.templateId)} onClick={step===2?submit:next}>{state.saving?"Saving…":step===2?(editing?"Save changes":"Create redirect link"):<>Next <ArrowRight size={15}/></>}</Button></>}>
  <ol className={styles.wizardProgress}>{steps.map((title,i)=><li key={title} aria-current={i===step?"step":undefined} className={i<=step?styles.wizardProgressActive:""}><span>{i<step?<Check size={12}/>:i+1}</span>{title}</li>)}</ol>
  <div key={step} className={styles.wizardStep}><h3 ref={heading} tabIndex={-1}>{steps[step]}</h3>
  {step===0&&<div className={styles.formGrid}>
   <Field label="Link name"><input autoComplete="off" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Customer enquiries"/></Field>
   <Field label="Where should visitors go?"><select value={platform} onChange={e=>{setPlatform(e.target.value);setPurpose("url");setForm({...form,linkType:e.target.value==="whatsapp"?"dm":"url"});}}>{Object.keys(platformOptions).map(item=><option key={item} value={item}>{item==="website"?"Any website / other link":item==="x"?"X / Twitter":item.charAt(0).toUpperCase()+item.slice(1)}</option>)}</select></Field>
   {platform==="whatsapp"&&<Field label={platform==="whatsapp"?"What kind of WhatsApp destination?":"What would you like to share?"}><select value={platform==="whatsapp"?form.linkType:purpose} onChange={e=>platform==="whatsapp"?setForm({...form,linkType:e.target.value}):setPurpose(e.target.value)}>{platformOptions[platform].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field>}
   {platform==="whatsapp"&&form.linkType==="dm"&&<Field label="Phone country" hint="Used to clean local phone numbers. International numbers keep their own country code."><select value={country} onChange={e=>setCountry(e.target.value)}>{getCountries().map(code=><option key={code} value={code}>{new Intl.DisplayNames(["en"],{type:"region"}).of(code)} (+{getCountryCallingCode(code)})</option>)}</select></Field>}
   <Field label={platform==="whatsapp"&&form.linkType==="dm"?"Phone number or WhatsApp link":purpose!=="url"?`${platform} ${purpose} link`:"Destination link"} hint={platform==="whatsapp"?"Paste your phone number, group, channel or business message link. Full links are detected automatically.":"Paste the full shared link or app deep link. Paths and query parameters are kept."}><input value={form.whatsappCode} onChange={e=>enterDestination(e.target.value)} placeholder={platform==="whatsapp"&&form.linkType==="dm"?"0803 000 0000 or +234 803 000 0000":"https://…"}/></Field>
   {/^[a-z][a-z\d+.-]*:/i.test(form.whatsappCode)&&!/^https?:/i.test(form.whatsappCode)&&<Field label="Browser fallback" hint="Where to send visitors who do not have the app installed."><input value={fallbackUrl} onChange={e=>setFallbackUrl(e.target.value)} placeholder="https://…"/></Field>}
   {form.whatsappCode&&<div className={styles.wizardHint}>{parsed.valid?<>Destination: {parsed.fallbackUrl}</>:parsed.error}</div>}
   {parsed.platform==="whatsapp"&&parsed.linkType==="dm"&&<Field label="Prefilled message (optional)"><textarea value={form.prefill} onChange={e=>setForm({...form,prefill:e.target.value})} placeholder="Leave blank for visitors to write their own message"/></Field>}
  </div>}

  {step===1&&<><button type="button" className={styles.defaultRedirectDesign} aria-pressed={form.templateId==="default"} onClick={()=>{setForm({...form,templateId:"default"});setTemplateName("Default design");}}><Check size={16}/>Default design · Fast and simple</button><p className={styles.linkMetricNote}>Ready to use. Browse other designs only if you want to customize.</p><div className={styles.templateTools}><label className={styles.templateSearch}><Search size={16}/><input aria-label="Search redirect templates" placeholder="Search designs…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label><label className={styles.wizardFilter}>Plan availability<select value={plan} onChange={e=>{setPlan(e.target.value);setPage(1);}}><option value="all">All designs</option><option value="free">Free</option><option value="standard">Standard</option><option value="pro">Pro</option></select></label></div>
   {state.loading?<div className={styles.templateLoading}><LoadingState label="Loading designs"/></div>:state.error?<div className={styles.wizardHint}><p>{state.error}</p><Button variant="secondary" onClick={()=>setRetry(n=>n+1)}>Try again</Button></div>:<><div className={styles.templateGrid}>{catalog.templates.map(t=><button type="button" disabled={!t.available} key={t._id} aria-pressed={form.templateId===t._id} className={form.templateId===t._id?styles.templateSelected:""} onClick={()=>{setForm({...form,templateId:t._id});setTemplateName(t.name);}}>{t.thumbnailUrl?<img src={t.thumbnailUrl} alt="" loading="lazy"/>:<span><Sparkles/></span>}<b>{t.name}</b>{!t.available&&<small>Requires another plan</small>}</button>)}</div>{!catalog.templates.length&&<p className={styles.wizardHint}>No designs match. Try another search or filter.</p>}</>}
   <div className={styles.templatePagination}><Button variant="secondary" disabled={page===1||state.loading} onClick={()=>setPage(p=>p-1)}>Previous</Button><span aria-live="polite">Page {page} of {catalog.totalPages} · {catalog.total} designs</span><Button variant="secondary" disabled={page>=catalog.totalPages||state.loading} onClick={()=>setPage(p=>p+1)}>Next page</Button></div>{form.templateId&&<p className={styles.wizardHint}>Selected: {templateName}</p>}
  </>}
  {step===2&&<dl className={styles.wizardReview}><div><dt>Link name</dt><dd>{form.title}</dd></div><div><dt>Destination</dt><dd>{form.whatsappCode}</dd></div><div><dt>Type</dt><dd>{parsed.platform} · {parsed.linkType}</dd></div>{parsed.linkType==="dm"&&form.prefill&&<div><dt>Ready message</dt><dd>{form.prefill}</dd></div>}<div><dt>Design</dt><dd>{templateName}</dd></div></dl>}
  </div>
 </Modal>;
}
