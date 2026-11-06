import {useState} from 'react';
import {User,Store,Package,PanelsTopLeft,Link2,Layers,FileText,Copy,Check} from 'lucide-react';
import s from './Control.module.css';
export function RecordVisual({module,record,large=false}){
 const [failed,setFailed]=useState('');
 const url=module==='products'?record.images?.[0]:module==='stores'?record.logo:module==='templates'?record.thumbnailUrl:module==='pages'?record.templateInfo?.thumbnailUrl:null;
 const safe=typeof url==='string'&&(/^https?:\/\//i.test(url)||/^\/(?!\/)/.test(url));
 const Icon={users:User,subscriptions:User,stores:Store,products:Package,pages:PanelsTopLeft,links:Link2,templates:Layers}[module]||FileText;
 const person=['users','subscriptions'].includes(module);
 return <span className={`${s.recordVisual} ${large?s.visualLarge:''}`} data-kind={module} title={module==='pages'&&url?'Template preview — not a screenshot of this page':safe?'':person?'Account initials':'No image available'}>{safe&&failed!==url?<img src={url} alt={module==='pages'?'Template preview':`${record.name||record.title||'Record'} image`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(url)}/>:person?<span>{(record.name||record.email||'U').trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()}</span>:<Icon size={large?26:18} aria-hidden="true"/>}</span>;
}
export function CopyLink({url}){const [state,setState]=useState('');return <button className={s.button} onClick={async()=>{try{await navigator.clipboard.writeText(url);setState('Copied');}catch{setState('Could not copy');}}}>{state==='Copied'?<Check size={14}/>:<Copy size={14}/>} {state||'Copy public link'}</button>;}

// Same HTML/CSS interpolation as LandingTemplateEditor; scripts/forms/network connections disabled.
export function TemplatePreview({record}){
 const [open,setOpen]=useState(false);
 const config=Object.fromEntries((record.editableSchema?.fields||[]).map(f=>[f.key,f.defaultValue||'']));
 const content=(record.html||'').replace(/{{(.*?)}}/g,(_,key)=>String(config[key.trim()]||''));
 const doc=`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; font-src https:; base-uri 'none'; form-action 'none'"><meta name="referrer" content="no-referrer"><style>body{margin:0}*{box-sizing:border-box}${record.css||''}</style></head><body>${content}</body></html>`;
 return <section className={s.contextSection}><h3>Template preview</h3>{record.html?<><button className={s.button} onClick={()=>setOpen(!open)}>{open?'Hide preview':'Preview template'}</button>{open&&<iframe title="Template preview" sandbox="" referrerPolicy="no-referrer" srcDoc={doc} className={s.templatePreview}/>}</>:<p className={s.muted}>No rendered preview is available for this template.</p>}</section>;
}
