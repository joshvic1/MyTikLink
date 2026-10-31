import {useEffect} from "react";
import {v11ApiBase} from "./apiBase";
export default function usePageAnalytics(page){
 useEffect(()=>{
  if(!page?.slug || page.preview)return;
  let visitor;
  const bucket=Math.floor(Date.now()/1800000),key='v11-page-visit';
  try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');visitor=saved?.window===bucket?saved.visitor:crypto.randomUUID();sessionStorage.setItem(key,JSON.stringify({visitor,window:bucket}));}catch{visitor=crypto.randomUUID();}
  const sent=new Set();let alive=true,activeWindow=bucket;
  const send=(type,action='')=>{
   const currentWindow=Math.floor(Date.now()/1800000);if(currentWindow!==activeWindow){sent.clear();activeWindow=currentWindow}
   const id=type+action;if(sent.has(id)||sent.size>=64)return;sent.add(id);
   const payload=JSON.stringify({visitor,window:activeWindow,events:[{type,action}]});
   const url=`${v11ApiBase()}/v1-1/pages/public/${encodeURIComponent(page.slug)}/events`;
   const deliver=()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true,credentials:'omit'});
   // One retry only; the server receipt makes retries safe. Never poll.
   void (async()=>{for(let attempt=0;attempt<2;attempt++){try{const response=await deliver();if(response.status<500)return}catch{}if(!alive)return}})();
  };
  const view=()=>{if(document.visibilityState==='visible')send('view')};
  const click=e=>{
   if(!e.isTrusted)return;
   const target=e.target.closest?.('a[href],button[data-page-action],button[data-cta="true"]');
   if(!target || target.closest('form') || target.disabled || target.getAttribute('aria-disabled')==='true')return;
   const href=target.getAttribute('href');if(href && (href.startsWith('#')||/^javascript:/i.test(href)))return;
   // Position-based identifiers keep URLs, phone numbers and text out of analytics.
   const index=[...document.querySelectorAll('a[href],button[data-page-action],button[data-cta="true"]')].indexOf(target);
   send('click',`action-${index}`);
  };
  const lead=()=>send('click','lead-submit');
  view();document.addEventListener('visibilitychange',view);document.addEventListener('click',click,true);document.addEventListener('v11:lead-success',lead);
  return()=>{alive=false;document.removeEventListener('visibilitychange',view);document.removeEventListener('click',click,true);document.removeEventListener('v11:lead-success',lead)};
 },[page?.slug]);
}
