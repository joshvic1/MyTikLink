import {useEffect,useRef} from 'react';
import {X,Inbox,ArrowUpRight} from 'lucide-react';
import s from './Control.module.css';
export const get=(obj,key)=>key.split('.').reduce((v,k)=>v?.[k],obj);
export function CreatedAt({value,label='Created'}){const date=value?new Date(value):null;return <small className={s.createdAt}>{date&&!Number.isNaN(date.getTime())?<>{label} <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Africa/Lagos'}).format(date)} WAT</time></>:'Creation date unavailable'}</small>;}
export function display(value,key=''){
 if(value===null||value===undefined||value==='')return '—';
 if(typeof value==='boolean')return value?'Yes':'No';
 if(/At$|Expiry$|createdAt|lastAdminLogin/.test(key)&&!Number.isNaN(Date.parse(value)))return new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
 if(typeof value==='number')return value.toLocaleString(undefined,{maximumFractionDigits:2});
 if(Array.isArray(value))return value.map(v=>typeof v==='object'?JSON.stringify(v):v).join(', ')||'None';
 if(typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}: ${display(v,k)}`).join(' · ');
 return String(value).replace(/_/g,' ');
}
export const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n||0);
export function Badge({value}){const text=String(value).toLowerCase(),positive=['active','successful','sent','published','ready','paid','delivered','true','yes'].includes(text),negative=['failed','suspended','false','disabled','cancelled'].includes(text),pending=['pending','processing','sending','draft','scheduled'].includes(text),plan=/^(free|standard_|pro_)/.test(text);return <span className={`${s.badge} ${plan?s.planBadge:positive?s.good:negative?s.bad:pending?s.warning:s.neutral}`}><i aria-hidden="true"/>{display(value)}</span>;}
export function Empty({title='No matching records',children}){return <div className={s.empty}><Inbox size={30}/><h3>{title}</h3><p>{children||'Try a different search or clear your filters.'}</p></div>;}
export function ErrorBox({error,retry}){return <div className={s.error} role="alert"><strong>We couldn’t load this view</strong><p>{error}</p>{retry&&<button onClick={retry}>Try again</button>}</div>;}
export function Loading(){return <div className={s.loading} role="status" aria-label="Loading records"><span/><span/><span/></div>;}
export function Dialog({title,children,onClose,wide=false}){
 const ref=useRef(null);useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.focus();function key(e){if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=[...ref.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first?.focus();}}}document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
 return <div className={s.backdrop}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`${s.dialog} ${wide?s.wide:''}`}><header><div><span className={s.eyebrow}>MYTIKLINK ADMIN</span><h2>{title}</h2></div><button className={s.iconButton} onClick={onClose} aria-label="Close dialog"><X size={20}/></button></header><div className={s.dialogBody}>{children}</div></section></div>;
}
export function RecordFields({record}){return <dl className={s.fields}>{Object.entries(record).filter(([k])=>k!=='__v').map(([key,value])=><div key={key}><dt>{key.replace(/([A-Z])/g,' $1').replace(/^_id$/,'Record ID')}</dt><dd>{display(value,key)}</dd></div>)}</dl>;}
export function External({href,children}){return /^https?:\/\//.test(href||'')?<a href={href} target="_blank" rel="noopener noreferrer" className={s.button}>{children}<ArrowUpRight size={16}/></a>:null;}
