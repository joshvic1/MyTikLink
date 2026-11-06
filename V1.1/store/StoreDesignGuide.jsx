import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from '../landing/ScratchGuide.module.css';
const steps=[
 ['Your brand','Choose a starting style and customise colours, fonts and uploaded images.','[data-design-tab="Brand"]','Brand'],
 ['Build your storefront','Add sections, edit their content and use the arrows to rearrange them.','[data-design-tab="Sections"]','Sections'],
 ['Choose your layout','Adjust product cards, image shapes and spacing.','[data-design-tab="Layout"]','Layout'],
 ['Undo and redo','Undo your last edit, or redo it. Your draft saves automatically on this device.','[aria-label="Undo"]','Brand'],
 ['Published history','Restore a published revision into your draft, then review before publishing.','[data-design-tab="History"]','History'],
 ['Preview and products','Switch between mobile and desktop. Tap a product to open the Products editing shortcut.','[data-design-preview]',null],
 ['Publish when ready','Publish makes your reviewed design live. Closing the editor keeps your draft on this device.','[data-design-publish]',null],
];
export default function StoreDesignGuide({userId,onNavigate}){
 const [step,setStep]=useState(-1),[host,setHost]=useState(null),[position,setPosition]=useState({bottom:20,right:12}),panel=useRef(null),navigate=useRef(onNavigate);navigate.current=onNavigate;
 const key=`v11-store-guide-v1:${userId}`;
 useEffect(()=>{try{if(userId&&!localStorage.getItem(key))setStep(0);}catch{}},[key,userId]);
 const finish=()=>{setStep(-1);try{localStorage.setItem(key,'done');}catch{}};
 useEffect(()=>{
  if(step<0)return;navigate.current(steps[step][3]);let target,frame;
  const place=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{target?.removeAttribute('data-guide-highlight');target=document.querySelector(steps[step][2]);setHost(document.querySelector('[data-design-controls]')||document.body);if(!target)return;target.setAttribute('data-guide-highlight','true');const r=target.getBoundingClientRect(),height=panel.current?.offsetHeight||210;setPosition({top:Math.max(12,Math.min(r.bottom+10,innerHeight-height-12)),right:12});});};
  const timer=setTimeout(()=>{document.querySelector(steps[step][2])?.scrollIntoView({block:'nearest'});place();},50);window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
  return()=>{clearTimeout(timer);cancelAnimationFrame(frame);target?.removeAttribute('data-guide-highlight');window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
 },[step]);
 return <><button type="button" aria-label="Show store design guide" onClick={()=>setStep(0)}>Guide</button>{step>=0&&host&&createPortal(<aside ref={panel} className={styles.card} style={{...position,zIndex:10000,maxWidth:'calc(100vw - 24px)'}} aria-label="Store design guide" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();finish();}}}><header><strong>{steps[step][0]}</strong><small>{step+1}/{steps.length}</small></header><p>{steps[step][1]}</p><footer><button onClick={finish}>Skip</button>{step>0&&<button onClick={()=>setStep(step-1)}>Back</button>}<button className={styles.next} onClick={()=>step===steps.length-1?finish():setStep(step+1)}>{step===steps.length-1?'Finish':'Next'}</button></footer></aside>,host)}</>;
}
