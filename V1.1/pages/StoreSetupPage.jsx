import StoreTemplateCard from "../store/StoreTemplateCard";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Check, ArrowRight, Store, CreditCard, Palette, ClipboardCheck, Package, Download, ShoppingBag } from "lucide-react";
import {defaultDesign,themes,changeTheme} from "../store/design";
import StoreRenderer from "../store/StoreRenderer";
const templates=Object.entries(themes).map(([id,t])=>({id,title:t.name,description:t.description}));
import { Button, Field, PageHeader, Modal } from "../components/UI";
import { useSubscription } from "../components/SubscriptionModal";
import { apiRequest } from "../lib/api";
import { canUseLandingPages } from "../lib/pageAccess";
import styles from "../styles/storeSetup.module.css";
const initial={name:"",phone:"",category:"",businessType:"physical",bankName:"",accountName:"",accountNumber:"",templateId:templates[0]?.id||""};
const steps=[{name:"Business",Icon:Store},{name:"Payments",Icon:CreditCard},{name:"Design",Icon:Palette},{name:"Review",Icon:ClipboardCheck}];
export default function StoreSetupPage({user,refreshSession,onCreated}){
 const router=useRouter(),{openSubscription}=useSubscription();
 const [form,setForm]=useState(initial),[step,setStep]=useState(0),[errors,setErrors]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState(""),[upgrade,setUpgrade]=useState(false);
 const lock=useRef(false),refs=useRef({}),completed=useRef(false),sectionRef=useRef(null),previousStep=useRef(0);
 useEffect(()=>{if(previousStep.current===step)return;previousStep.current=step;const frame=requestAnimationFrame(()=>{sectionRef.current?.focus({preventScroll:true});sectionRef.current?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});return()=>cancelAnimationFrame(frame);},[step]);
 const [design,setDesign]=useState(defaultDesign()),[draftReady,setDraftReady]=useState(false),[draftStatus,setDraftStatus]=useState("Loading draft…");
 const revision=useRef(0),saveQueue=useRef(Promise.resolve()),latest=useRef(null);
 latest.current={form,design};
 useEffect(()=>{let active=true;apiRequest("/v1-1/store-studio").then(data=>{if(!active)return;revision.current=data.revision;setDesign(data.design);setForm({...initial,...data.setup,templateId:data.design.theme});setDraftReady(true);setDraftStatus("Draft loaded");}).catch(e=>setError(e.message));return()=>{active=false;};},[]);
 const saveDraft=()=>{const snapshot=latest.current;const operation=saveQueue.current.catch(()=>{}).then(async()=>{const saved=await apiRequest("/v1-1/store-studio/draft",{method:"PUT",body:JSON.stringify({setup:snapshot.form,design:snapshot.design.theme===snapshot.form.templateId?snapshot.design:changeTheme(snapshot.design,snapshot.form.templateId),revision:revision.current})});revision.current=saved.revision;setDraftStatus("Draft saved to your account");});saveQueue.current=operation;return operation;};
 useEffect(()=>{if(!draftReady||completed.current||busy)return;setDraftStatus("Saving draft…");const timer=setTimeout(()=>saveDraft().catch(e=>{setError(e.message);setDraftStatus("Draft not saved");}),1000);return()=>clearTimeout(timer);},[form,design,draftReady,busy]);
 const update=(key,value)=>{setForm(f=>({...f,[key]:value}));setErrors(e=>({...e,[key]:""}));};
 const validate=()=>{
  const issues={};
  for(const key of step===0?["name","phone","category"]:step===1?["bankName","accountName","accountNumber"]:step===2?["templateId"]:[])if(!form[key].trim())issues[key]="Please complete this field.";
  if(step===1&&form.accountNumber&&!/^\d{10,34}$/.test(form.accountNumber))issues.accountNumber="Enter 10–34 digits, without spaces or letters.";
  setErrors(issues);const key=Object.keys(issues)[0];
  if(key){requestAnimationFrame(()=>{refs.current[key]?.focus({preventScroll:true});refs.current[key]?.scrollIntoView({block:"center",behavior:"smooth"});});return false;}return true;
 };
 const create=async()=>{
  if(lock.current||!draftReady)return;
  lock.current=true;setBusy(true);setError("");
  try{await saveDraft();if(!canUseLandingPages(user)){setUpgrade(true);return;}await apiRequest("/v1-1/store-studio/publish",{method:"POST",body:JSON.stringify({revision:revision.current})});completed.current=true;await onCreated?.();await router.push("/v1-1/store/design");}
  catch(e){if(e.status===403)setUpgrade(true);else setError(e.message||"Could not create your store. Your details are still here; please try again.");}
  finally{lock.current=false;setBusy(false);}
 };
 const input=(key,label,props={})=><Field label={label} error={errors[key]&&<span id={`store-${key}-error`}>{errors[key]}</span>}><input {...props} ref={node=>{refs.current[key]=node;}} value={form[key]} maxLength={160} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?`store-${key}-error`:undefined} onChange={e=>update(key,e.target.value)}/></Field>;
 const selected=templates.find(t=>t.id===form.templateId);
 return <div className={styles.page}><PageHeader title="Create your storefront" description="Set up your business, choose a design, and get ready to sell."/>
  <ol className={styles.steps} aria-label="Storefront setup progress">{steps.map(({name,Icon},i)=><li key={name} aria-current={i===step?"step":undefined} className={i<=step?styles.active:""}><span>{i<step?<Check size={16}/>:<Icon size={16}/>}</span><div><small>0{i+1}</small><b>{name}</b></div></li>)}</ol>
  <div className={styles.layout}><section className={styles.panel}>
   <div className={styles.panelTop}><span><Store size={15}/> STOREFRONT STUDIO</span><span role="status">{draftStatus}</span></div>
   <div key={step} ref={sectionRef} tabIndex={-1} aria-label={`${steps[step].name} setup`} className={styles.content}>
   <small className={styles.stepLabel}>STEP {step+1} OF 4</small><h2>{["Tell us about your business","How customers will pay","Make your store your own","Ready to create your store?"][step]}</h2>
   <p className={styles.description}>{["Add the details customers need to recognise and contact you.","Add your bank details for customer payments. You can update these later.","Choose a starting design. You can customise it after setup.","Check your details below. You can go back to edit anything."][step]}</p>
   {step===0&&<div className={styles.fields}>{input("name","Store name",{placeholder:"e.g. Ada’s collection",autoComplete:"organization"})}{input("phone","Business phone",{type:"tel",autoComplete:"tel",placeholder:"e.g. +234 803 000 0000"})}{input("category","Business category",{placeholder:"e.g. Fashion, beauty, courses"})}<fieldset className={styles.productTypes}><legend>What do you sell?</legend>{[{id:"physical",title:"Physical products",detail:"Items you ship or deliver",Icon:Package},{id:"digital",title:"Digital & services",detail:"Downloads, skills and services",Icon:Download}].map(({id,title,detail,Icon})=><button key={id} type="button" aria-pressed={form.businessType===id} onClick={()=>update("businessType",id)}><Icon size={20}/><span><b>{title}</b><small>{detail}</small></span><span className={styles.radio}>{form.businessType===id&&<Check size={11}/>}</span></button>)}</fieldset></div>}
   {step===1&&<div className={styles.fields}>{input("bankName","Bank name",{autoComplete:"off"})}{input("accountName","Account holder name",{autoComplete:"off"})}{input("accountNumber","Account number",{inputMode:"numeric",autoComplete:"off"})}<p className={styles.note}>Double-check these details so customers can pay the correct account.</p></div>}
   {step===2&&<div className={styles.designs}>{templates.map(t=><article key={t.id} className={form.templateId===t.id?styles.selected:""}><button type="button" aria-pressed={form.templateId===t.id} onClick={()=>update("templateId",t.id)}>{t.id==="atelier"?<StoreTemplateCard store={form} accent={design.brand.accent}/>:<div style={{padding:24,background:themes[t.id].accent,color:"white",minHeight:110}}><ShoppingBag size={28}/><p>{t.description}</p></div>}<span>{t.title}{form.templateId===t.id&&<Check size={16}/>}</span></button><small style={{display:"block",padding:12}}>Customisable colours, sections and product layout</small></article>)}</div>}
   {step===3&&<dl className={styles.review}>{[["Store name",form.name],["Phone",form.phone],["Category",form.category],["Products",form.businessType],["Bank",form.bankName],["Account holder",form.accountName],["Account number",form.accountNumber],["Design",selected?.title]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
   {error&&<p role="alert" className={styles.error}>{error}</p>}</div>
   <footer className={styles.actions}><Button variant="secondary" disabled={busy} onClick={()=>step?setStep(s=>s-1):router.push("/v1-1/store")}>{step?"Back":"Cancel"}</Button><Button disabled={busy||!draftReady} onClick={()=>step===3?create():validate()&&setStep(s=>s+1)}>{busy?"Creating…":step===3?"Create storefront":<>Continue <ArrowRight size={15}/></>}</Button></footer>
  </section><aside className={styles.preview}>
   <div className={styles.previewHeading}><span className={styles.stepLabel}>STORE PREVIEW</span><span className={styles.previewTag}>Design preview</span></div>
   <div className={styles.phoneFrame}><div className={styles.phoneTop} aria-hidden="true"><span/></div><div className={styles.phoneScreen} tabIndex={0} role="region" aria-label="Scrollable store preview"><StoreRenderer design={design.theme===form.templateId?design:changeTheme(design,form.templateId)} store={form} preview/></div><div className={styles.phoneBottom} aria-hidden="true"><span/></div></div>
   <h3>A space for your business.</h3><p>Your products, your style, one simple place to shop.</p>
   <div className={styles.previewDetails}><Palette size={16}/><div><small>SELECTED DESIGN</small><b>{selected?.title}</b></div><Check size={15}/></div>
   <p className={styles.previewHint}>This is a design preview. Add your products and customise your store after setup.</p>
  </aside></div>
  {upgrade&&<Modal tone="teal" className={styles.proPrompt} title="Storefronts are available on Pro only" description="Upgrade to the Pro plan to be able to create a storefront. Your setup details will remain in drafts. Click the button below to upgrade." onClose={()=>setUpgrade(false)} footer={<><Button variant="secondary" onClick={()=>setUpgrade(false)}>Keep editing</Button><Button onClick={()=>{setUpgrade(false);openSubscription({mode:"upgrade",preselected:"pro"});}}>Upgrade to Pro</Button></>}/>}
 </div>;
}
