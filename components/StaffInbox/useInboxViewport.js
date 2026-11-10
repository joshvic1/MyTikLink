import {useEffect} from 'react';
export default function useInboxViewport(active,timeline,nearBottom){
 useEffect(()=>{
   const viewport=window.visualViewport,root=document.documentElement;
   let frame;
   const update=()=>{
     cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
       const height=viewport?.height||window.innerHeight;
       const keyboard=window.innerHeight-height>120;
       root.style.setProperty('--inbox-viewport-height',height+'px');
       root.style.setProperty('--inbox-viewport-top',(viewport?.offsetTop||0)+'px');
       root.style.setProperty('--inbox-safe-bottom',keyboard?'0px':'env(safe-area-inset-bottom, 0px)');
       if(active&&nearBottom.current&&timeline.current)timeline.current.scrollTop=timeline.current.scrollHeight;
     });
   };
   update();viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);
   return()=>{cancelAnimationFrame(frame);viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);for(const name of ['height','top'])root.style.removeProperty('--inbox-viewport-'+name);root.style.removeProperty('--inbox-safe-bottom')};
 },[active]);
 useEffect(()=>{
   if(!active||!window.matchMedia('(max-width: 700px)').matches)return;
   const body=document.body,root=document.documentElement,y=window.scrollY;
   const old={position:body.style.position,top:body.style.top,width:body.style.width,overflow:body.style.overflow,rootOverflow:root.style.overflow};
   Object.assign(body.style,{position:'fixed',top:-y+'px',width:'100%',overflow:'hidden'});root.style.overflow='hidden';
   return()=>{Object.assign(body.style,{position:old.position,top:old.top,width:old.width,overflow:old.overflow});root.style.overflow=old.rootOverflow;window.scrollTo(0,y)};
 },[active]);
}
