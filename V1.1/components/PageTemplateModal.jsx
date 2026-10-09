import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Modal, LoadingState } from "./UI";
import { v11Api, getToken } from "../lib/api";
import AIPageBuilderModal from "@/components/custom/ai/AIPageBuilderModal";
import styles from "../styles/v11.module.css";
import { Plus, Sparkles, Search, Check, AlertCircle } from "lucide-react";
const categories = ["Business & Services", "Products & Offers", "Courses & Events", "Personal & Portfolio", "General"];
function categoryOf(t) {
  if (t.category) return t.category;
  const text = `${t.name || ""} ${t.description || ""} ${(t.tags || []).join(" ")}`.toLowerCase();
  if (/course|class|webinar|event|training|workshop|ebook/.test(text)) return "Courses & Events";
  if (/product|shop|sale|offer|store|fashion|beauty|food/.test(text)) return "Products & Offers";
  if (/portfolio|personal|creator|bio|artist/.test(text)) return "Personal & Portfolio";
  if (/business|service|agency|consult|coach|real estate/.test(text)) return "Business & Services";
  return "General";
}
export function PageTemplateModal({ onClose }) {
 const router = useRouter();
 const [templates,setTemplates]=useState([]), [selected,setSelected]=useState(""), [error,setError]=useState(""), [loading,setLoading]=useState(true);
 const [search,setSearch]=useState(""), [category,setCategory]=useState("all"), [form,setForm]=useState("all");
 const [toast,setToast]=useState(false), [aiOpen,setAiOpen]=useState(false), [navigating,setNavigating]=useState(false);
 const timer=useRef(null);
 useEffect(()=>{let active=true; v11Api.pageTemplates().then(data=>{if(active)setTemplates(Array.isArray(data)?data:[]);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;clearTimeout(timer.current);};},[]);
 const options=useMemo(()=>[...new Set([...categories,...templates.map(categoryOf)])],[templates]);
 const visible=useMemo(()=>templates.filter(t=>`${t.name || ""} ${t.description || ""} ${categoryOf(t)} ${(t.tags || []).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase())&&(category==="all"||categoryOf(t)===category)&&(form==="all"||(form==="yes"?t.hasForm===true:t.hasForm===false))),[templates,search,category,form]);
 const choose=value=>{setSelected(value);setToast(false);};
 const filter=(setter,value)=>{setter(value);if(!["scratch","ai"].includes(selected))setSelected("");};
 const proceed=async()=>{
  if(!selected){clearTimeout(timer.current);setToast(true);timer.current=setTimeout(()=>setToast(false),4500);return;}
  if(selected==="ai"){setAiOpen(true);return;}
  setNavigating(true);try{await router.push(selected==="scratch"?"/v1-1/pages/builder":`/v1-1/pages/editor?templateId=${encodeURIComponent(selected)}`);}catch{setError("Could not open the editor. Please try again.");}finally{setNavigating(false);}
 };
 if(aiOpen)return <AIPageBuilderModal open token={getToken()} builderPath="/v1-1/pages/builder" onClose={()=>setAiOpen(false)}/>;
 return <Modal wide className={styles.templatePicker} title="Select a Page template" description="Pick any design you'd love to use for your page, you can also build from scratch or build with AI as well." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={navigating} onClick={proceed}>{navigating?"Opening…":"Use this template"}</Button></>}>
 <div className={styles.templateTools}><label className={styles.templateSearch}><Search size={16}/><input aria-label="Search templates" placeholder="Search templates…" value={search} onChange={e=>filter(setSearch,e.target.value)}/></label><div className={styles.templateFilters}><label>Category<select value={category} onChange={e=>filter(setCategory,e.target.value)}><option value="all">All categories</option>{options.map(item=><option key={item}>{item}</option>)}</select></label><label>Form<select value={form} onChange={e=>filter(setForm,e.target.value)}><option value="all">All templates</option><option value="yes">With form</option><option value="no">No form</option></select></label></div></div>
 <div className={styles.templateBuildOptions}>{[{id:"scratch",title:"Build from scratch",copy:"Start with a blank canvas",Icon:Plus},{id:"ai",title:"Build with AI",copy:"Turn your idea into a page",Icon:Sparkles}].map(({id,title,copy,Icon})=><button type="button" key={id} aria-pressed={selected===id} className={`${styles.templateBuildOption} ${selected===id?styles.pickerSelected:""}`} onClick={()=>choose(id)}><span><Icon/></span><div><b>{title}</b><small>{copy}</small></div>{selected===id&&<Check size={16}/>}</button>)}</div>
 <div className={styles.templateResultCount} aria-live="polite">{loading?"":`${visible.length} template${visible.length===1?"":"s"}`}</div>
 {loading?<div className={styles.templateLoading}><LoadingState label="Loading templates"/></div>:<div className={styles.pageTemplateGrid}>{visible.map(t=><button type="button" key={t._id} aria-pressed={selected===t._id} className={selected===t._id?styles.templateSelected:""} onClick={()=>choose(t._id)}>{t.thumbnailUrl?<img src={t.thumbnailUrl} alt="" loading="lazy"/>:<span><Sparkles/></span>}<b>{t.name}</b><small>{categoryOf(t)}{typeof t.hasForm==="boolean"?` · ${t.hasForm?"With form":"No form"}`:""}</small></button>)}</div>}
 {!loading&&!visible.length&&<div className={styles.templateEmpty}><Search size={22}/><b>No matching templates</b><p>Try another search or reset your filters.</p><Button variant="secondary" onClick={()=>{setSearch("");setCategory("all");setForm("all");}}>Reset filters</Button></div>}
 {error&&<p className={styles.inlineError} role="alert">{error}</p>}{toast&&<div role="alert" className={styles.templateToast}><AlertCircle size={17}/><span>Select any of the templates or options to continue</span></div>}
 </Modal>;
}
