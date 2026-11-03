import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import picker from "./PageTemplateModal.module.css";
import { Notice, notify } from "./Notifications";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Modal } from "./UI";
import { v11Api, getToken } from "../lib/api";
import AIPageBuilderModal from "../landing/AIPageBuilderModal";
import { allThemes } from "../landing/themeLibrary";
import { ThemePreview } from "../landing/ThemePreview";
import styles from "../styles/v11.module.css";
import { Plus, Sparkles, Search, Check, SlidersHorizontal } from "lucide-react";
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
export function PageTemplateModal({ onClose, user }) {
 const router = useRouter();
 const reducedMotion=useReducedMotion();
 const resultsHeading=useRef(null);
 const questionRef=useRef(null);
 const [questionError,setQuestionError]=useState("");
 const [registry,setRegistry]=useState([]);
 useEffect(()=>{v11Api.onboardingCategories().then(result=>setRegistry(result.categories || [])).catch(()=>{});},[]);
 const pilotTemplates=useMemo(()=>allThemes.map(theme=>({...theme,_id:`phase-one:${theme.id}`,name:theme.title,description:theme.copy,category:registry.find(c=>c.id===theme.categoryIds[0])?.label || theme.tags[0],pilot:true})),[registry]);
 const [templates,setTemplates]=useState([]), [selected,setSelected]=useState(""), [error,setError]=useState(""), [loading,setLoading]=useState(true);
 const [search,setSearch]=useState(""), [category,setCategory]=useState("all"), [form,setForm]=useState(null);
 const [toast,setToast]=useState(false), [aiOpen,setAiOpen]=useState(false), [navigating,setNavigating]=useState(false);
 const [filtersOpen,setFiltersOpen]=useState(false), [pilotNotice,setPilotNotice]=useState("");
 const timer=useRef(null);
 useEffect(()=>{let active=true; v11Api.pageTemplates().then(data=>{if(active)setTemplates(Array.isArray(data)?data:[]);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;clearTimeout(timer.current);};},[]);
 const availableTemplates=useMemo(()=>[...pilotTemplates.filter(t=>t.batch==="universal"),...templates,...pilotTemplates.filter(t=>t.batch!=="universal")],[templates,pilotTemplates]);
 const options=useMemo(()=>[...new Set([...categories,...availableTemplates.map(categoryOf)])],[availableTemplates]);
 const visible=useMemo(()=>availableTemplates.filter(t=>`${t.name || ""} ${t.description || ""} ${categoryOf(t)} ${(t.tags || []).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase())&&(category==="all"||categoryOf(t)===category)&&(form==="all"||(form==="yes"?t.hasForm===true:t.hasForm===false))),[availableTemplates,search,category,form]);
 const selectedPilot=useMemo(()=>pilotTemplates.find(theme=>theme._id===selected),[selected,pilotTemplates]);
 const choose=value=>{setSelected(value);setToast(false);setPilotNotice("");};
 const filter=(setter,value)=>{setter(value);setPilotNotice("");if(!["scratch","ai"].includes(selected))setSelected("");};
 const proceed=async()=>{
  if(!form){const message="Please choose Yes or No: do you want to collect user details on your landing page?";setQuestionError(message);notify.error(message);requestAnimationFrame(()=>{questionRef.current?.scrollIntoView({block:"center",behavior:reducedMotion?"instant":"smooth"});questionRef.current?.focus({preventScroll:true});});return;}
  if(!selected){clearTimeout(timer.current);setToast(true);timer.current=setTimeout(()=>setToast(false),4500);return;}
  if(selected==="ai"){setAiOpen(true);return;}
  if(selectedPilot){setNavigating(true);try{await router.push(`/v1-1/pages/builder?themeId=${encodeURIComponent(selectedPilot.id)}`);}catch{setError("Could not open theme editor.");}finally{setNavigating(false);}return;}
  setNavigating(true);try{await router.push(selected==="scratch"?"/v1-1/pages/builder":`/v1-1/pages/editor?templateId=${encodeURIComponent(selected)}`);}catch{setError("Could not open the editor. Please try again.");}finally{setNavigating(false);}
 };
 if(aiOpen)return <AIPageBuilderModal open variant="v11" token={getToken()} builderPath="/v1-1/pages/builder" onClose={()=>setAiOpen(false)}/>;
 return <Modal tone="lime" wide className={styles.templatePicker} title="Select a Page template" description="Choose a design and make it yours." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={navigating} onClick={proceed}>{navigating?"Opening…":selected==="scratch"?"Continue (Build from scratch)":selected==="ai"?"Continue (Build with AI)":selectedPilot?"Use theme":"Use this template"}</Button></>}>

 <div className={styles.templateTools}>
  <div className={styles.templateSearch}><Search size={16}/><input aria-label="Search templates" placeholder="Search templates…" value={search} onChange={e=>filter(setSearch,e.target.value)}/><button type="button" className={styles.templateFilterToggle} aria-label="Filter templates" aria-expanded={filtersOpen} aria-controls="page-template-filters" onClick={()=>setFiltersOpen(value=>!value)}><SlidersHorizontal size={17}/>{(category!=="all")&&<span/>}</button></div>
  {filtersOpen&&<div id="page-template-filters" className={styles.templateFilterPanel} onKeyDown={e=>{if(e.key==="Escape"){e.stopPropagation();setFiltersOpen(false);}}}>
   <div className={styles.templateFilterHeading}><b>Find your template</b><small>{visible.length} matching designs</small></div><div className={styles.templateFilters}><label>Category<select value={category} onChange={e=>filter(setCategory,e.target.value)}><option value="all">All categories</option>{options.map(item=><option key={item}>{item}</option>)}</select></label></div>
   <div className={styles.templateFilterActions}><Button variant="ghost" onClick={()=>{filter(setCategory,"all");}}>Clear filters</Button><Button variant="secondary" onClick={()=>setFiltersOpen(false)}>Done</Button></div>
  </div>}
 </div>
 <AnimatePresence mode="wait" initial={false}>
 {!form ? <motion.section key="question" ref={questionRef} tabIndex={-1} aria-describedby={questionError?"collect-details-error":undefined} className={picker.question} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:reducedMotion?0:0.2}}>

 <h3>Do you want to collect user details on your landing page?</h3>
 <p>(Such as name, WhatsApp number, email, etc.)</p>
 <fieldset><legend className={picker.srOnly}>Collect user details?</legend>{["yes","no"].map(answer=><label key={answer}><input type="radio" name="collect-details" value={answer} checked={form===answer} onChange={()=>{setSelected("");setForm(answer);setQuestionError("");setFiltersOpen(false);}}/><span>{answer==="yes"?"Yes":"No"}</span></label>)}</fieldset>
 {questionError&&<p id="collect-details-error" className={picker.questionError} role="alert">{questionError}</p>}
 </motion.section> : <motion.section key="templates" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:reducedMotion?0:0.22}} onAnimationComplete={()=>resultsHeading.current?.focus({preventScroll:true})}>
 <div className={picker.summary}><span ref={resultsHeading} tabIndex={-1}>{form==="yes"?"Templates with a form":"Templates without a form"}</span><button type="button" onClick={()=>{setForm(null);setSelected("");setToast(false);}}>Change answer</button></div>
 <div className={styles.templateBuildOptions}>{[{id:"scratch",title:"Build from scratch",copy:"Start with a blank canvas",Icon:Plus},{id:"ai",title:"Build with AI",copy:"Let AI build for you",Icon:Sparkles}].map(({id,title,copy,Icon})=><button type="button" key={id} aria-pressed={selected===id} className={`${styles.templateBuildOption} ${selected===id?styles.pickerSelected:""}`} onClick={()=>choose(id)}><span><Icon/></span><div><b>{title}</b><small>{copy}</small></div>{selected===id&&<span className={styles.buildSelectionMark}><Check size={14}/></span>}</button>)}</div>
 <div className={styles.pageTemplateGrid}>{visible.map(t=><div role="button" tabIndex={0} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();choose(t._id);}}} key={t._id} aria-pressed={selected===t._id} className={`${selected===t._id?styles.templateSelected:""} ${t.pilot?styles.pilotTemplateCard:""}`} onClick={()=>choose(t._id)}>{t.pilot?<ThemePreview theme={t} profile={user || {}} registry={registry} compact asButtonContent/>:t.thumbnailUrl?<img src={t.thumbnailUrl} alt="" loading="lazy"/>:<span><Sparkles/></span>}<b>{t.name}</b><small>{categoryOf(t)}{typeof t.hasForm==="boolean"?` · ${t.hasForm?"With form":"No form"}`:""}</small>{t.pilot&&<span className={styles.pilotThemeBadge}>{t.batch === "1b" ? "Phase 1B · Short form" : "Phase 1"}</span>}{selected===t._id&&<span className={styles.templateSelectionMark}><Check aria-hidden="true"/></span>}</div>)}</div>
 {loading&&<p className={styles.templateLoadingMore}>Loading more templates…</p>}
 {!loading&&!visible.length&&<div className={styles.templateEmpty}><Search size={22}/><b>No matching templates</b><p>Try another search or reset your filters.</p><Button variant="secondary" onClick={()=>{setSearch("");setCategory("all");}}>Reset filters</Button></div>}
 </motion.section>}
 </AnimatePresence>
 {pilotNotice&&<Notice tone="info" onClose={()=>setPilotNotice("")}>{pilotNotice}</Notice>}{error&&<p className={styles.inlineError} role="alert">{error}</p>}{toast&&<div role="alert" className={styles.templateToast}><Notice tone="error">Select any of the templates or options to continue</Notice></div>}
 </Modal>;
}
