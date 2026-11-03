import {useEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';
import {apiRequest} from '../lib/api';
import {trackingData,browserEvent} from './browser';
import s from './tracking.module.css';
export default function PublicTracking({kind,slug,consent:providedConsent,contentKey}){
 const [connections,setConnections]=useState({}),[consent,setConsent]=useState(false),[choice,setChoice]=useState(false);const viewed=useRef(new Set());
 useEffect(()=>{if(!slug)return;let active=true;apiRequest(`/v1-1/tracking/public/${kind}/${encodeURIComponent(slug)}`,{token:null}).then(c=>active&&setConnections(c)).catch(()=>{});if(providedConsent===undefined){try{const c=localStorage.getItem(`${kind}-consent:${slug}`);setConsent(c==='yes');setChoice(c===null);}catch{setChoice(true);}}return()=>{active=false;};},[kind,slug]);
 const allowed=providedConsent===undefined?consent:providedConsent;
 useEffect(()=>{if(!allowed||!Object.keys(connections).length)return;
 const send=(type,id=crypto.randomUUID())=>{const attribution=trackingData(kind,slug);if(!attribution)return;browserEvent(connections,type,id);if(type!=='lead'&&Object.values(connections).some(c=>c.server))apiRequest(`/v1-1/tracking/public/${kind}/${encodeURIComponent(slug)}`,{token:null,method:'POST',keepalive:true,body:JSON.stringify({type,id,attribution})}).catch(()=>{});};
 const key=`${kind}:${slug}:${location.pathname}`;if(!viewed.current.has(key)){viewed.current.add(key);send('view');}if(contentKey&&!viewed.current.has('content:'+contentKey)){viewed.current.add('content:'+contentKey);send('content');}
 const event=e=>{if(e.detail?.kind===kind&&e.detail?.slug===slug)send(e.detail.type,e.detail.id)};
 const click=e=>{const link=e.target.closest?.('a[href]');if(link&&/^(https?:\/\/wa.me|https?:\/\/api.whatsapp.com|mailto:|tel:)/i.test(link.href))send('contact');};
 document.addEventListener('v11:tracking',event);document.addEventListener('click',click);return()=>{document.removeEventListener('v11:tracking',event);document.removeEventListener('click',click);};
 },[allowed,connections,kind,slug,contentKey]);
 const choose=value=>{try{localStorage.setItem(`${kind}-consent:${slug}`,value?'yes':'no');}catch{}setConsent(value);setChoice(false);if(!value){window.fbq?.('consent','revoke');window.ttq?.revokeConsent?.();window.oaiq?.('consent',false);window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied'});}};
 if(providedConsent!==undefined||!Object.keys(connections).length||typeof document==='undefined')return null;
 return createPortal(choice?<aside className={s.banner} aria-label="Privacy choices"><b>Your privacy matters</b><p>Allow optional analytics to help this business understand visits and enquiries?</p><div><button onClick={()=>choose(false)}>No thanks</button><button onClick={()=>choose(true)}>Allow analytics</button></div></aside>:<button className={s.privacy} onClick={()=>setChoice(true)}>Privacy</button>,document.body);
}
