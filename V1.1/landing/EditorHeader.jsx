import {ChevronLeft,SlidersHorizontal,PanelsTopLeft,Eye,Undo2,Redo2,Sparkles,ArrowRight} from 'lucide-react';
import {useEffect,useState,useRef} from 'react';
import styles from './ThemeStudio.module.css';
const steps=[['Edit','Click the edit button to change your text, images, buttons, and every other detail on your landing page.'],['Preview','Click on Preview to see what your page looks like before you publish. And you can tap on any text to edit each item individually.'],['Make it yours','Tap any text or image here to open its editing section and make it yours.'],['Publish','Ready to go live? Publish your latest changes here.']];
export default function EditorHeader({mode,onMode,onBack,children,undo,redo,canUndo,canRedo}){
 const [step,setStep]=useState(-1),next=useRef(null),header=useRef(null);
 useEffect(()=>{try{if(!localStorage.getItem('v11-editor-tour-v1'))setStep(0);}catch{}},[]);
 useEffect(()=>{if(step>=0)next.current?.focus({preventScroll:true});if(step===0||step===2)onMode('preview');if(step===1)onMode('edit');},[step,onMode]);
 useEffect(()=>{
 if(step!==2||mode!=='preview')return;
 const studio=header.current?.parentElement;
 let target,timer;
 const highlight=()=>{if(target)return;target=[...(studio?.querySelectorAll('[data-editor-preview] h1, [data-editor-preview] h2, [data-editor-preview] p')||[])].find(node=>node.textContent.trim()&&node.getBoundingClientRect().height>0);if(!target)return;target.classList.add(styles.contentTourTarget);timer=setTimeout(()=>target.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}),80);};
 highlight();const observer=new MutationObserver(highlight);if(studio)observer.observe(studio,{childList:true,subtree:true});const retry=setInterval(highlight,150);
 return()=>{clearInterval(retry);clearTimeout(timer);observer.disconnect();target?.classList.remove(styles.contentTourTarget);};
 },[step,mode]);
 const finish=()=>{setStep(-1);try{localStorage.setItem('v11-editor-tour-v1','done');}catch{}};
 const highlight=n=>step===n?styles.tourTarget:'';
 return <header ref={header} className={styles.editorHeader}>
 <div className={styles.editorTop}><button aria-label="Back to pages" onClick={onBack}><ChevronLeft size={21}/></button><strong>Edit your page</strong><div className={`${styles.publishSlot} ${highlight(3)}`}>{children}</div></div>
 <div className={styles.editorBottom}><div className={styles.modeTabs}><button className={step===0||step===1?styles.tourTarget:''} onClick={()=>onMode(mode==='edit'?'preview':'edit')}>{mode==='edit'?<><Eye size={16}/> Preview</>:<><SlidersHorizontal size={14} strokeWidth={1.7}/> Edit</>}</button></div><div className={styles.editorActions}><button title="Undo" aria-label="Undo" disabled={!canUndo} onClick={undo}><Undo2 size={17}/></button><button title="Redo" aria-label="Redo" disabled={!canRedo} onClick={redo}><Redo2 size={17}/></button><button aria-label="Show editor guide" onClick={()=>setStep(0)}>?</button></div></div>
 {step>=0&&<div className={styles.editorTour} role="dialog" aria-label="Editor guide" onKeyDown={event=>{if(event.key==='Escape')finish();}}><div className={styles.tourHeading}><span>{step===0?<SlidersHorizontal size={14} strokeWidth={1.7}/>:step===1?<PanelsTopLeft size={15}/>:<Sparkles size={14}/>}</span><strong>{steps[step][0]}</strong><small>{step+1}/{steps.length}</small></div><p>{steps[step][1]}</p><div><button onClick={finish}>Skip</button><button ref={next} className={styles.primary} onClick={()=>step===steps.length-1?finish():setStep(step+1)}>{step===steps.length-1?'Got it':<>Next <ArrowRight size={13}/></>}</button></div></div>}
 </header>;
}
