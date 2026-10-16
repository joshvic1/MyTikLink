import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { apiRequest } from '../lib/api';
import { normalizeDestination } from '../lib/redirectDestination';
import { loadTikTokPixel } from '../lib/redirectPixel';
import { redirectFrame, visitIdentity } from '../lib/redirectFrame';
import { Button, LoadingState, ErrorState } from '../components/UI';
import styles from '../styles/v11.module.css';
export default function RedirectPage({linkId}) {
 const [state,setState]=useState({loading:true,data:null,error:''}),[retry,setRetry]=useState(0);
 const timer=useRef(null),tracked=useRef(false),opened=useRef(false),left=useRef(false);
 const track=useCallback(()=>{if(!tracked.current){tracked.current=true;window.ttq?.track('CompleteRegistration');}},[]);
 const open=useCallback((data,browser=false)=>{
  clearTimeout(timer.current);opened.current=true;track();
  // Manual buttons retain the browser's user gesture for app-opening permission.
  window.location.assign(browser?data.fallback:data.deepLink);
 },[track]);
 useEffect(()=>{
  let active=true;const controller=new AbortController();tracked.current=false;opened.current=false;left.current=false;
  setState({loading:true,data:null,error:''});
  let storage;try{storage=window.sessionStorage;}catch{storage={getItem(){},setItem(){}};}
  const visitId=visitIdentity(storage,linkId,()=>crypto.randomUUID());
  apiRequest(`/v1-1/links/visit/${encodeURIComponent(linkId)}`,{method:'POST',token:null,body:JSON.stringify({visitId}),signal:controller.signal,timeoutMs:15000}).then(data=>{
   if(!active)return;
   const verified=normalizeDestination({destinationUrl:data.deepLink,fallbackUrl:data.fallback,platform:'website'});
   const safe={...data,deepLink:verified.deepLink,fallback:verified.fallbackUrl};
   setState({loading:false,data:safe,error:''});loadTikTokPixel(data.tiktokPixelId);
   timer.current=setTimeout(()=>{if(active&&!opened.current&&!left.current&&document.visibilityState==='visible')open(safe);},data.redirectDelay||500);
  }).catch(error=>{if(active)setState({loading:false,data:null,error:error.name==='AbortError'?'The connection took too long. Please try again.':error.message});});
  const hide=()=>{if(document.visibilityState==='hidden'){left.current=true;clearTimeout(timer.current);}};
  const pagehide=()=>{left.current=true;clearTimeout(timer.current);};
  document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',pagehide);
  return()=>{active=false;controller.abort();clearTimeout(timer.current);document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',pagehide);};
 },[linkId,retry,open]);
 if(state.loading)return <LoadingState label="Opening destination"/>;
 if(state.error)return <main className={styles.redirectVisitor}><ErrorState title="Could not open this link" message={state.error} onRetry={()=>setRetry(n=>n+1)}/></main>;
 const data=state.data,hasApp=data.deepLink!==data.fallback||!/^https?:/i.test(data.deepLink),srcDoc=redirectFrame(data);
 return <main className={styles.redirectVisitor}><Head><title>{data.title||'Redirect Link'}</title><meta name="robots" content="noindex,nofollow"/></Head>{srcDoc&&<iframe title="Redirect design" sandbox="" referrerPolicy="no-referrer" srcDoc={srcDoc} className={styles.redirectTemplateFrame}/>}<section className={styles.redirectVisitorCard}><img src="/images/mytiklink-mark-black.png" width="40" height="40" alt="MyTikLink"/><h1>{data.title||'Your destination is ready'}</h1><p>If your destination has not opened, tap below. Some browsers need your permission to open an app.</p><Button onClick={()=>open(data)}>{hasApp?`Open ${data.platform==='website'?'app':data.platform}`:'Open destination'}</Button>{data.deepLink!==data.fallback&&<Button variant="secondary" onClick={()=>open(data,true)}>Continue in browser</Button>}<small>{data.fallback}</small></section></main>;
}
