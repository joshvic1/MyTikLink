import {useEffect,useState} from 'react';
import {X} from 'lucide-react';
import {createIdleHelp,helpEligible,HELP_SESSION_KEY} from '../../support/idleHelp.mjs';
import s from './IdleHelp.module.css';
let sessionSeen=false;
export default function IdleHelp({buttonRef,blocked,path}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const seen=()=>{try{return sessionSeen||sessionStorage.getItem(HELP_SESSION_KEY)==='1';}catch{return sessionSeen;}};
  const controller=createIdleHelp({schedule:(fn,ms)=>setTimeout(fn,ms),cancel:id=>clearTimeout(id),hide:()=>setVisible(false),show:()=>{sessionSeen=true;try{sessionStorage.setItem(HELP_SESSION_KEY,'1');}catch{}setVisible(true);},eligible:()=>{
   const button=buttonRef.current,box=button?.getBoundingClientRect(),style=button?getComputedStyle(button):null;
   const showing=Boolean(box&&box.width&&box.height&&box.top>=0&&box.bottom<=window.innerHeight&&style.visibility!=='hidden'&&style.display!=='none');
   const modal=[...document.querySelectorAll('[role="dialog"],[aria-modal="true"],[data-ai-support-open]')].some(el=>el.getClientRects().length>0);
   return helpEligible({seen:seen(),visible:showing,hidden:document.hidden,typing:document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'),modal,helpOpen:blocked});
  }});
  const events=['pointermove','pointerdown','keydown','input','touchstart','scroll','focusin'];
  const reset=()=>{if(document.hidden)controller.dismiss();else controller.reset();};
  events.forEach(name=>window.addEventListener(name,reset,{passive:true}));document.addEventListener('visibilitychange',reset);window.addEventListener('resize',reset);
  if(!blocked&&!seen())controller.reset();
  return()=>{controller.destroy();events.forEach(name=>window.removeEventListener(name,reset));document.removeEventListener('visibilitychange',reset);window.removeEventListener('resize',reset);};
 },[blocked,path,buttonRef]);
 useEffect(()=>{if(!visible)return;const observer=new MutationObserver(()=>{if([...document.querySelectorAll('[role="dialog"],[aria-modal="true"],[data-ai-support-open]')].some(el=>el.getClientRects().length>0))setVisible(false);});observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();},[visible]);
 return visible&&!blocked?<div className={s.hint} role="status"><div><b>Need help?</b><p>Tap here to get support.</p></div><button aria-label="Dismiss help reminder" onClick={()=>setVisible(false)}><X size={13}/></button></div>:null;
}
