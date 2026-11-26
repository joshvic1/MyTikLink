import {interactionQueue,clickDestination} from './interactionQueue.mjs';
import {useEffect,useState,useRef} from 'react';
import {apiRequest} from '../lib/api';
import {trackingData,browserEvent} from './browser';

// Landing pages initialize automatically. Store consent remains owned by PublicStore.
export default function PublicTracking({kind,slug,consent:providedConsent,contentKey,initialConnections}) {
 const [configuration,setConfiguration]=useState(null);
 const viewed=useRef(new Set());
 const identity=`${kind}:${slug}`;
 useEffect(()=>{
  if(!slug)return;
  if(initialConnections!==undefined){setConfiguration({identity,connections:initialConnections});return;}
  const controller=new AbortController();
  apiRequest(`/v1-1/tracking/public/${kind}/${encodeURIComponent(slug)}`,{token:null,signal:controller.signal})
   .then(connections=>{if(!controller.signal.aborted)setConfiguration({identity,connections});}).catch(()=>{});
  return()=>controller.abort();
 },[identity,kind,slug,initialConnections]);
 const allowed=kind==='page'||providedConsent===true;
 const interactions=useRef(null);
 if(interactions.current?.identity!==identity)interactions.current={identity,queue:interactionQueue()};
 const queue=interactions.current.queue;
 // Subscribe before configuration arrives, including newly inserted page buttons.
 useEffect(()=>{
  if(!allowed||!slug)return;
  const enqueue=(type,id)=>{
   // Do not lose a fast redirect while pixel configuration is still in flight.
   // The server checks the owner's connections and deduplicates this same event ID.
   if(type==='contact'&&configuration?.identity!==identity){const attribution=trackingData(kind,slug);if(attribution)apiRequest(`/v1-1/tracking/public/${kind}/${encodeURIComponent(slug)}`,{token:null,method:'POST',keepalive:true,body:JSON.stringify({type,id,attribution})}).catch(()=>{});}
   queue.push(type,id);
  };
  const event=e=>{if(e.detail?.kind===kind&&e.detail?.slug===slug)enqueue(e.detail.type,e.detail.id||crypto.randomUUID());};
  const click=e=>{if(e.__v11Tracked||!clickDestination(e.target,kind,location.href))return;e.__v11Tracked=true;enqueue('contact',crypto.randomUUID());};
  document.addEventListener('v11:tracking',event);document.addEventListener('click',click);
  return()=>{document.removeEventListener('v11:tracking',event);document.removeEventListener('click',click);};
 },[allowed,kind,slug,queue,configuration,identity]);
 useEffect(()=>{
  if(!allowed||configuration?.identity!==identity)return;
  const connections=configuration.connections;
  if(!Object.keys(connections).length)return;
  const send=(type,id=crypto.randomUUID())=>{
   const attribution=trackingData(kind,slug);
   if(!attribution)return;
   const properties={content_id:String(contentKey||slug),content_name:document.title,content_type:'product'};
   browserEvent(connections,type,id,properties);
   if(type!=='lead'&&Object.values(connections).some(c=>c.server))
    apiRequest(`/v1-1/tracking/public/${kind}/${encodeURIComponent(slug)}`,{token:null,method:'POST',keepalive:true,body:JSON.stringify({type,id,attribution})}).catch(()=>{});
  };
  const key=`${identity}:${location.pathname}`;
  if(!viewed.current.has(key)){viewed.current.add(key);send('view');}
  const contentIdentity=contentKey|| (kind==='page'?key:null);
  if(contentIdentity&&!viewed.current.has('content:'+identity+':'+contentIdentity)){
   viewed.current.add('content:'+identity+':'+contentIdentity);send('content');
  }
  queue.ready(send);
  return()=>queue.pause();
 },[allowed,configuration,identity,kind,slug,contentKey,queue]);
 return null;
}
