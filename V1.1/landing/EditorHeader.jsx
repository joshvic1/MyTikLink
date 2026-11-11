import {ChevronLeft,Pencil,SlidersHorizontal,PanelsTopLeft,Eye,Undo2,Redo2,Sparkles,ArrowRight} from 'lucide-react';
import {useEffect,useState,useRef} from 'react';
import styles from './ThemeStudio.module.css';
const steps=[['Edit any item','Tap on any text, image or item on this page to edit it to your taste.'],['Edit','Tap on Edit to see all the items available to edit on your page.'],['Undo','Made a change you want to take back? Tap Undo.'],['Redo','Changed your mind? Tap Redo to restore the change you undid.'],['Publish','Ready to go live? Click on the Publish button above to go live.']];
export default function EditorHeader({mode,onMode,onBack,children,undo,redo,canUndo,canRedo}){
 const [step,setStep]=useState(-1),next=useRef(null),header=useRef(null),tour=useRef(null);
 const [tourPosition,setTourPosition]=useState(null);
 useEffect(()=>{try{if(!localStorage.getItem('v11-editor-tour-v3'))setStep(0);}catch{}},[]);
 useEffect(()=>{if(step>=0)next.current?.focus({preventScroll:true});if(step>=0)onMode('preview');},[step,onMode]);
 useEffect(()=>{
 if(step!==0||mode!=='preview')return;
 const studio=header.current?.parentElement;
 let target,timer;
 const position=()=>{if(!target||!tour.current)return;const rect=target.getBoundingClientRect(),height=tour.current.offsetHeight,viewport=window.visualViewport;const bottom=(viewport?.height||window.innerHeight)+(viewport?.offsetTop||0),top=(viewport?.offsetTop||0)+8;const below=rect.bottom+14,above=rect.top-height-14;setTourPosition({position:'fixed',top:below+height<bottom-8?below:above>top?above:Math.max(top,bottom-height-8),right:14});};
 const highlight=()=>{if(target)return;target=[...(studio?.querySelectorAll('[data-editor-preview] h1, [data-editor-preview] h2, [data-editor-preview] p')||[])].find(node=>node.textContent.trim()&&node.getBoundingClientRect().height>0);if(!target)target=studio?.querySelector('[data-editor-preview] iframe');if(!target)return;target.classList.add(styles.contentTourTarget);timer=setTimeout(()=>{target.scrollIntoView({block:'start',behavior:'instant'});position();},80);};
 highlight();const observer=new MutationObserver(highlight);if(studio)observer.observe(studio,{childList:true,subtree:true});const retry=setInterval(highlight,150);const resize=new ResizeObserver(position);if(tour.current)resize.observe(tour.current);window.addEventListener('scroll',position,true);window.addEventListener('resize',position);window.visualViewport?.addEventListener('resize',position);
 return()=>{clearInterval(retry);clearTimeout(timer);observer.disconnect();resize.disconnect();window.removeEventListener('scroll',position,true);window.removeEventListener('resize',position);window.visualViewport?.removeEventListener('resize',position);target?.classList.remove(styles.contentTourTarget);};
 },[step,mode]);
 useEffect(()=>{if(mode==='edit')setStep(-1);},[mode]);
 const finish=()=>{setStep(-1);try{localStorage.setItem('v11-editor-tour-v3','done');}catch{}};
 const highlight=n=>step===n?styles.tourTarget:'';
 return <header ref={header} className={styles.editorHeader}>
 <div className={styles.editorSingleRow}><button className={styles.editorBack} aria-label="Back to pages" onClick={onBack}><ChevronLeft size={21}/></button><button className={`${styles.settingsTrigger} ${highlight(1)}`} onClick={()=>{setStep(-1);onMode('edit');}}><Pencil size={14} strokeWidth={1.7}/> Edit</button><div className={styles.editorActions}><button className={highlight(2)} title="Undo" aria-label="Undo" disabled={!canUndo} onClick={undo}><Undo2 size={17}/></button><button className={highlight(3)} title="Redo" aria-label="Redo" disabled={!canRedo} onClick={redo}><Redo2 size={17}/></button><button aria-label="Show editor guide" onClick={()=>setStep(0)}>?</button></div><div className={`${styles.publishSlot} ${highlight(4)}`}>{children}</div></div>
 {step>=0&&<div ref={tour} style={step===0?tourPosition || {position:"fixed",bottom:12,top:"auto",right:14}:undefined} className={styles.editorTour} role="dialog" aria-label="Editor guide" onKeyDown={event=>{if(event.key==='Escape')finish();}}><div className={styles.tourHeading}><span>{step===0?<SlidersHorizontal size={14} strokeWidth={1.7}/>:step===1?<Pencil size={15}/>:step===2?<Undo2 size={15}/>:step===3?<Redo2 size={15}/>:<Sparkles size={14}/>}</span><strong>{steps[step][0]}</strong><small>{step+1}/{steps.length}</small></div><p>{steps[step][1]}</p><div><button onClick={finish}>Skip</button><button ref={next} className={styles.primary} onClick={()=>step===steps.length-1?finish():setStep(step+1)}>{step===steps.length-1?'Got it':<>Next <ArrowRight size={13}/></>}</button></div></div>}
 </header>;
}
