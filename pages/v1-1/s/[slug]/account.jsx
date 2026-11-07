import {useEffect,useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import CustomerAccount from '../../../../V1.1/store/CustomerDrawer';
import {apiRequest} from '../../../../V1.1/lib/api';
import {storeThemeStyle} from '../../../../V1.1/store/StoreTheme';
import css from '../../../../V1.1/store/CustomerExperience.module.css';
export default function Account(){
 const router=useRouter(),[data,setData]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),slug=String(router.query.slug||'');
 useEffect(()=>{if(!router.isReady)return;const c=new AbortController();setError('');apiRequest(`/v1-1/store-studio/commerce/public/${encodeURIComponent(slug)}/config`,{token:null,signal:c.signal}).then(setData).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[router.isReady,slug,retry]);
 const close=()=>router.push(`/v1-1/s/${encodeURIComponent(slug)}`);
 return <><Head><title>Your customer account</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Head>{data?<div className={css.receipt} style={storeThemeStyle(data.design)}><header className={css.header}><button onClick={close}>← Back to store</button><strong>{data.store.name}</strong></header><CustomerAccount store={data.store} design={data.design} orderId={typeof router.query.order==='string'?router.query.order:undefined} onClose={close}/></div>:<main className={css.body}>{error?<><p role="alert">{error}</p><button onClick={()=>setRetry(v=>v+1)}>Retry</button></>:<p role="status">Opening your account…</p>}</main>}</>;
}
export function getServerSideProps({res}){res.setHeader('Cache-Control','private, no-store');return {props:{}};}
