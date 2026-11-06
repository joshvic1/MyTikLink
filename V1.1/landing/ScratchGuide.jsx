import {useState,useEffect,useRef} from 'react';
import styles from './ScratchGuide.module.css';
const steps=[
 ['Add an element','Choose Add element to add text, images, buttons and more.','[data-scratch-add]'],
 ['Edit any item','Tap an item on your canvas to open its editing options.','[data-canvas-element]'],
 ['Arrange your page','Use these arrows to move a section up or down.','[data-scratch-move]'],
 ['Undo','Take back your most recent change.','[aria-label="Undo"]'],
 ['Redo','Restore a change you have undone.','[aria-label="Redo"]'],
 ['Preview','Check how your page looks before publishing.','[data-scratch-preview]'],
 ['Ready to go live?','Click Publish to name your page and go live.','[data-scratch-publish]'],
];
export default function ScratchGuide({userId,onEdit}){
 const [step,setStep]=useState(-1),[position,setPosition]=useState({bottom:100,right:12}),panel=useRef(null);
 const key=`v11-scratch-guide-v1:${userId||''}`;
 useEffect(()=>{if(!userId)return;try{if(!localStorage.getItem(key))setStep(0);}catch{}},[key,userId]);
 useEffect(()=>{const open=()=>setStep(0);window.addEventListener("scratch:help",open);return()=>window.removeEventListener("scratch:help",open);},[]);
 const finish=()=>{setStep(-1);try{if(userId)localStorage.setItem(key,'done');}catch{}};
 useEffect(()=>{
  if(step<0)return;
  onEdit();
  let target,frame;
  const place=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   target?.removeAttribute('data-guide-highlight');
   target=document.querySelector(steps[step][2]);
   if(!target){setPosition({bottom:100,right:12});return;}
   target.setAttribute('data-guide-highlight','true');
   const rect=target.getBoundingClientRect(),v=window.visualViewport,top=v?.offsetTop||0,bottom=top+(v?.height||innerHeight),height=panel.current?.offsetHeight||170;
   setPosition({top:rect.bottom+height+20<bottom?rect.bottom+12:Math.max(top+10,rect.top-height-12),right:12});
  });};
  const targetNow=document.querySelector(steps[step][2]);
  targetNow?.scrollIntoView({block:'center',behavior:'instant'});place();
  window.addEventListener('resize',place);window.addEventListener('scroll',place,true);window.visualViewport?.addEventListener('resize',place);
  return()=>{cancelAnimationFrame(frame);target?.removeAttribute('data-guide-highlight');window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);window.visualViewport?.removeEventListener('resize',place);};
 },[step]);
 return <>{step>=0&&<aside ref={panel} style={position} className={styles.card} aria-label="Canvas guide" onKeyDown={e=>{if(e.key==='Escape')finish();}}><header><strong>{steps[step][0]}</strong><small>{step+1}/{steps.length}</small></header><p>{steps[step][1]}</p>{step>0&&step<3&&!document.querySelector(steps[step][2])&&<small>Add your first element to use this control.</small>}<footer><button onClick={finish}>Skip</button>{step>0&&<button onClick={()=>setStep(step-1)}>Back</button>}<button className={styles.next} onClick={()=>step===steps.length-1?finish():setStep(step+1)}>{step===steps.length-1?'Finish':'Next'}</button></footer></aside>}</>;
}
