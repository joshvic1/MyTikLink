import {useEffect,useState} from "react";

import {apiRequest} from "../lib/api";

import {Button,Field,PageHeader,LoadingState,ErrorState} from "../components/UI";

import {themes,changeTheme} from "./design";

import styles from "./store.module.css";

export default function StoreSettings(){

 const [form,setForm]=useState(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");

 const [studio,setStudio]=useState(null),[template,setTemplate]=useState(""),[templateBusy,setTemplateBusy]=useState(false),[templateMessage,setTemplateMessage]=useState(""),[templateError,setTemplateError]=useState("");

 useEffect(()=>{apiRequest("/v1-1/store-studio").then(d=>{setForm(d.setup);setStudio(d);setTemplate(d.design.theme);}).catch(e=>setError(e.message));},[]);

 const save=async()=>{setBusy(true);setError("");try{await apiRequest("/v1-1/store-studio/settings",{method:"PATCH",body:JSON.stringify(form)});setMessage("Store settings saved.");}catch(e){setError(e.message);}finally{setBusy(false);}};

 const saveTemplate=async()=>{if(templateBusy||!studio)return;setTemplateBusy(true);setTemplateError("");setTemplateMessage("");try{const design=changeTheme(studio.design,template);const result=await apiRequest("/v1-1/store-studio/draft",{method:"PUT",body:JSON.stringify({design,setup:studio.setup,revision:studio.revision})});setStudio({...studio,design,revision:result.revision});setTemplateMessage("Template saved to your draft. Review it in Store design, then publish when ready.");}catch(e){setTemplateError(e.status===409?"Your design changed in another tab. Refresh this page before changing the template.":e.message);}finally{setTemplateBusy(false);}};

 if(!form)return error?<ErrorState message={error}/>:<LoadingState/>;

 return <main className={styles.studio}><PageHeader title="Store settings" description="Manage your business details and choose your storefront template."/><section className={styles.templateSettings} aria-labelledby="store-template-title"><h2 id="store-template-title">Store template</h2><p>Switch designs anytime. Your products and store details stay in place. Changes are saved as a draft until you publish.</p><div className={styles.templateChoices}>{Object.entries(themes).map(([id,t])=><button type="button" key={id} disabled={templateBusy} aria-pressed={template===id} onClick={()=>{setTemplate(id);setTemplateMessage("");setTemplateError("");}}><span className={styles.templateSwatch} style={{background:t.accent}} aria-hidden="true"/><strong>{t.name}</strong><small>{t.description}</small><span className={styles.templateSelection}>{template===id?"Selected":"Choose template"}</span></button>)}</div>{templateError&&<p role="alert" className={styles.error}>{templateError}</p>}{templateMessage&&<p role="status">{templateMessage}</p>}<div className={styles.row}><Button disabled={templateBusy||template===studio?.design.theme} onClick={saveTemplate}>{templateBusy?"Saving…":"Use selected template"}</Button><a href="/v1-1/store/design">Customise & preview →</a></div></section><div className={`${styles.controls} ${styles.settingsControls}`} style={{position:"static",maxHeight:"none",maxWidth:600}}>{Object.entries({name:"Store name",phone:"Phone",category:"Category",address:"Store address (optional)",description:"Short store introduction (optional)",bankName:"Bank name",accountName:"Account holder",accountNumber:"Account number"}).map(([key,label])=><Field key={key} label={label}><input value={form[key]||""} onChange={e=>{setMessage("");setForm({...form,[key]:e.target.value});}}/></Field>)}<label><input type="checkbox" checked={Boolean(form.showFeatured)} onChange={e=>setForm({...form,showFeatured:e.target.checked})}/> Show featured products</label><p>Products marked as featured appear automatically. Your store name, contact details and introduction update across every template.</p><Field label="Products"><select value={form.businessType||"physical"} onChange={e=>setForm({...form,businessType:e.target.value})}><option value="physical">Physical</option><option value="digital">Digital / services</option></select></Field>{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}<Button disabled={busy} onClick={save}>{busy?"Saving…":"Save settings"}</Button></div></main>;

}

