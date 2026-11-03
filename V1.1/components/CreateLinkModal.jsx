import {destinationLabels,designsForDestination} from "../config/redirectDesigns";
import { linkUrl } from "../lib/linkPresentation";
import { normalizeDestination, detectPlatform, validateRedirectDestination } from "../lib/redirectDestination";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from "libphonenumber-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Field, Modal, LoadingState } from "./UI";
import { notify } from "./Notifications";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";
import { Sparkles, Search, Check, ArrowRight, LockKeyhole, LoaderCircle, ExternalLink } from "lucide-react";

export function CreateLinkModal({ link, onClose, onSaved }) {
 const editing=Boolean(link);
 const [saved,setSaved]=useState(null),[copied,setCopied]=useState(false);
 const [step,setStep]=useState(0),[search,setSearch]=useState(""),[page,setPage]=useState(1);
 const [catalog,setCatalog]=useState({templates:[],total:0,totalPages:1});
 const [form,setForm]=useState({title:link?.title||"",linkType:link?.linkType||"dm",whatsappCode:link?.destinationUrl||link?.whatsappCode||"",prefill:link?.prefill||"",templateId:link?.design?._id||"default"});
 const [templateName,setTemplateName]=useState(link?.design?.name||"Default design");
 const [state,setState]=useState({loading:false,saving:false,error:""});
 const [retry,setRetry]=useState(0);
 const submitting=useRef(false);
 const [creationStage,setCreationStage]=useState(0);
 useEffect(()=>{if(!state.saving){setCreationStage(0);return;}const timer=setInterval(()=>setCreationStage(n=>Math.min(n+1,2)),1100);return()=>clearInterval(timer);},[state.saving]);


 const fieldRefs=useRef({}),lastInvalid=useRef(null);
 const [attempted,setAttempted]=useState(false);
 const [platform,setPlatform]=useState(link?.platform || (link?.linkType==="url"?detectPlatform(link.destinationUrl||link.whatsappCode):"whatsapp"));
 const previousPlatform=useRef(platform);
 useEffect(()=>{if(previousPlatform.current!==platform){previousPlatform.current=platform;setForm(f=>({...f,templateId:'default'}));setTemplateName('Default design');setPage(1);}},[platform]);
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

 useEffect(()=>{
  if(step!==1)return;
  let active=true;setState(s=>({...s,loading:true,error:""}));
  const timer=setTimeout(()=>{v11Api.linkTemplates({page,search,platform}).then(data=>{
   if(!active)return;
   if(!Array.isArray(data?.templates))throw new Error("Template search is unavailable. Please try again after the server update.");
   setCatalog(data);
  }).catch(error=>{if(active){setState(s=>({...s,error:error.message}));notify.error(error.message);}}).finally(()=>{if(active)setState(s=>({...s,loading:false}));});},250);
  return()=>{active=false;clearTimeout(timer);};
 },[step,page,search,retry,platform]);
 const fieldErrors={};
 if(!form.title.trim())fieldErrors.title="Enter a name for your redirect link.";
 const hasAppLink=/^[a-z][a-z\d+.-]*:/i.test(form.whatsappCode)&&!/^https?:/i.test(form.whatsappCode);
 if(!parsed.valid){
  let target="destination";
  if(hasAppLink){
   try{validateRedirectDestination(normalizeDestination({whatsappCode:form.whatsappCode.trim(),platform,linkType:form.linkType,prefill:form.prefill,fallbackUrl:"https://example.com"}));target="fallback";}catch{}
  }
  fieldErrors[target]=!form.whatsappCode.trim()?(platform==="whatsapp"&&form.linkType==="dm"?"Enter a phone number or WhatsApp link.":"Enter your destination link."):parsed.error;
 }
 if(!form.templateId)fieldErrors.design="Select a design to continue.";
 const errorFor=key=>attempted&&fieldErrors[key]?<span id={`redirect-${key}-error`} role="alert">{fieldErrors[key]}</span>:undefined;
 const fieldProps=key=>({ref:node=>{fieldRefs.current[key]=node;},"aria-invalid":Boolean(attempted&&fieldErrors[key]),"aria-describedby":attempted&&fieldErrors[key]?`redirect-${key}-error`:undefined});
 const validateStep=(targetStep=step)=>{
  setAttempted(true);
  const keys=(targetStep===0?["title","destination","fallback"]:["design"]).filter(key=>fieldErrors[key]);
  if(!keys.length){lastInvalid.current=null;return true;}
  const key=keys[(keys.indexOf(lastInvalid.current)+1)%keys.length];
  lastInvalid.current=key;
  requestAnimationFrame(()=>{
   const input=fieldRefs.current[key];
   input?.focus({preventScroll:true});
   (input?.closest("label")||input)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
  });
  return false;
 };
 const next=()=>{
  if(!validateStep())return;
  setAttempted(false);
  setStep(s=>Math.min(2,s+1));
 };
 const submit=async()=>{
  if(submitting.current)return;
  if(Object.keys(fieldErrors).length){const target=Object.keys(fieldErrors).some(key=>key!=="design")?0:1;setStep(target);validateStep(target);return;}
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
 if(saved)return <Modal tone="peach" className={styles.redirectWizard} title={editing?"Redirect link updated":"Your redirect link is ready"} onClose={onClose} footer={<Button className={styles.redirectDone} onClick={onClose}>Done</Button>}><div className={styles.redirectSaved}><span className={styles.redirectSuccessSeal}><Check size={24}/></span><small>READY TO SHARE</small><h3>{saved.title}</h3><p className={styles.redirectSavedAddress}>{linkUrl(saved)}</p><small>Your destination and design are connected. Share your link anywhere.</small><Button onClick={async()=>{try{await navigator.clipboard.writeText(linkUrl(saved));setCopied(true);}catch{notify.error("Could not copy. Select and copy the address above.");}}}>{copied?"Copied":"Copy link"}</Button></div></Modal>;
 return <Modal tone="peach" wide className={styles.redirectWizard} title={editing?"Edit redirect link":"Create a redirect link"} description="Send people to any link as fast as possible." onClose={()=>{if(!state.saving)onClose();}} footer={<><Button variant="secondary" disabled={state.saving} onClick={()=>step?setStep(s=>s-1):onClose()}>{step?"Back":"Cancel"}</Button><Button disabled={state.saving} onClick={step===2?submit:next}>{state.saving?<span className={styles.creationProgress} role="status"><LoaderCircle size={16}/>{["Preparing your link…","Applying your design…","Finishing up…"][creationStage]}</span>:step===2?(editing?"Save changes":"Confirm and create page"):<>Next <ArrowRight size={15}/></>}</Button></>}>
  <div key={step} className={styles.wizardStep}>{step===2&&<h3>{steps[step]}</h3>}
  {step===0&&<div className={styles.formGrid}>
   <Field label="Link name" error={errorFor("title")}><input {...fieldProps("title")} autoComplete="off" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Customer enquiries"/></Field>
   <Field label="Where should visitors go?"><select value={platform} onChange={e=>{setPlatform(e.target.value);setPurpose("url");setForm({...form,linkType:e.target.value==="whatsapp"?"dm":"url"});}}>{Object.keys(platformOptions).map(item=><option key={item} value={item}>{item==="website"?"Any website / other link":item==="x"?"X / Twitter":item.charAt(0).toUpperCase()+item.slice(1)}</option>)}</select></Field>
   {platform==="whatsapp"&&<Field label={platform==="whatsapp"?"What kind of WhatsApp destination?":"What would you like to share?"}><select value={platform==="whatsapp"?form.linkType:purpose} onChange={e=>platform==="whatsapp"?setForm({...form,linkType:e.target.value}):setPurpose(e.target.value)}>{platformOptions[platform].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field>}
   {platform==="whatsapp"&&form.linkType==="dm"&&<Field label="Phone country" hint="Used to clean local phone numbers. International numbers keep their own country code."><select value={country} onChange={e=>setCountry(e.target.value)}>{getCountries().map(code=><option key={code} value={code}>{new Intl.DisplayNames(["en"],{type:"region"}).of(code)} (+{getCountryCallingCode(code)})</option>)}</select></Field>}
   <Field error={errorFor("destination")} label={platform==="whatsapp"&&form.linkType==="dm"?"Phone number or WhatsApp link":purpose!=="url"?`${platform} ${purpose} link`:"Destination link"} hint={platform==="whatsapp"?"Paste your phone number, group, channel or business message link. Full links are detected automatically.":"Paste the full shared link or app deep link. Paths and query parameters are kept."}><input {...fieldProps("destination")} value={form.whatsappCode} onChange={e=>enterDestination(e.target.value)} placeholder={platform==="whatsapp"&&form.linkType==="dm"?"0803 000 0000 or +234 803 000 0000":"https://…"}/></Field>
   {/^[a-z][a-z\d+.-]*:/i.test(form.whatsappCode)&&!/^https?:/i.test(form.whatsappCode)&&<Field error={errorFor("fallback")} label="Browser fallback" hint="Where to send visitors who do not have the app installed."><input {...fieldProps("fallback")} value={fallbackUrl} onChange={e=>setFallbackUrl(e.target.value)} placeholder="https://…"/></Field>}
   {parsed.valid&&<div className={styles.wizardHint}>Destination: {parsed.fallbackUrl}</div>}
   {parsed.platform==="whatsapp"&&parsed.linkType==="dm"&&<Field label="Prefilled message (optional)"><textarea value={form.prefill} onChange={e=>setForm({...form,prefill:e.target.value})} placeholder="Leave blank for visitors to write their own message"/></Field>}
  </div>}

  {step===1&&<>
   <p className={styles.redirectTemplateIntro}>Choose a template below, or keep the default design.</p>
   <div className={styles.redirectTemplateSearch}><label className={styles.templateSearch}><Search size={16}/><input aria-label="Search link templates" placeholder="Search link templates…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label></div>
   {errorFor("design")&&<p className={styles.fieldError}>{errorFor("design")}</p>}
   <div className={styles.templateGrid}>
    <button {...fieldProps("design")} type="button" className={form.templateId==="default"?styles.templateSelected:""} aria-pressed={form.templateId==="default"} onClick={()=>{setForm({...form,templateId:"default"});setTemplateName("Default design");}}><span className={styles.defaultRedirectCover} style={{"--destination-color":designsForDestination(platform)[0]?.accent||"#7651ac","--destination-ink":platform==="snapchat"?"#171717":"white"}}><ExternalLink/><strong>Opening<br/>{destinationLabels[platform]||"your destination"}</strong><i/><em>Continue →</em></span><b>Default design</b><small>Fast and simple · All plans</small></button>
    {!state.loading&&!state.error&&catalog.templates.map(t=><button type="button" aria-disabled={!t.available} key={t._id} aria-pressed={form.templateId===t._id} className={form.templateId===t._id?styles.templateSelected:""} onClick={()=>{if(!t.available){notify.warning("Upgrade to Pro to use this template");return;}setForm({...form,templateId:t._id});setTemplateName(t.name);}}>{t.thumbnailUrl?<img src={t.thumbnailUrl} alt="" loading="lazy"/>:<span><Sparkles/></span>}{!t.available&&<i className={styles.templateLock}><LockKeyhole size={13}/>Pro</i>}<b>{t.name}</b><small>{[...new Set((t.allowedPlans||[]).map(p=>p.split("_")[0]))].map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(" · ")||"No eligible plans"}{!t.available?" · Upgrade required":""}</small></button>)}
   </div>
   {state.loading&&<div className={styles.templateLoading}><LoadingState label="Loading designs"/></div>}
   {state.error&&<div className={styles.wizardHint}><p>{state.error}</p><Button variant="secondary" onClick={()=>setRetry(n=>n+1)}>Try again</Button></div>}
   {!state.loading&&!state.error&&!catalog.templates.length&&<p className={styles.wizardHint}>{search?"No designs match your search.":"No other designs are available yet."}</p>}
   {catalog.totalPages>1&&<div className={styles.templatePagination}><Button variant="secondary" disabled={page===1||state.loading} onClick={()=>setPage(p=>p-1)}>Previous</Button><span aria-live="polite">Page {page} of {catalog.totalPages}</span><Button variant="secondary" disabled={page>=catalog.totalPages||state.loading} onClick={()=>setPage(p=>p+1)}>Next page</Button></div>}
  </>}
  {step===2&&<><div className={styles.redirectReviewHero}>{catalog.templates.find(t=>t._id===form.templateId)?.thumbnailUrl?<img src={catalog.templates.find(t=>t._id===form.templateId).thumbnailUrl} alt=""/>:<span><ExternalLink size={22}/></span>}<div><small>YOUR REDIRECT</small><strong>{form.title}</strong><p>{templateName} · {destinationLabels[platform]}</p></div><Check size={18}/></div><dl className={styles.wizardReview}><div><dt>Link name</dt><dd>{form.title}</dd></div><div><dt>Destination</dt><dd>{form.whatsappCode}</dd></div><div><dt>Type</dt><dd>{parsed.platform} · {parsed.linkType}</dd></div>{parsed.linkType==="dm"&&form.prefill&&<div><dt>Ready message</dt><dd>{form.prefill}</dd></div>}<div><dt>Design</dt><dd>{templateName}</dd></div></dl></>}
  </div>
 </Modal>;
}
