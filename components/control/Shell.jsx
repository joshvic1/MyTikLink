import {useState,useEffect,useRef,createContext,useContext} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {ChevronDown,Menu,X,LogOut,ShieldCheck,ArrowUpRight} from 'lucide-react';
import {groups,entries,href,allowed,descriptions} from './config';
import {request} from './api';
import {ErrorBox,Loading} from './Shared';
import s from './Control.module.css';
export const AdminContext=createContext(null);
export const useAdmin=()=>useContext(AdminContext);
export default function Shell({module='overview',children,legacy=false}){
 const router=useRouter(),[session,setSession]=useState(null),[error,setError]=useState(''),[open,setOpen]=useState(false),[reload,setReload]=useState(0);
 const entry=entries.find(e=>e[0]===module)||[module,'Administration',null,'super'];
 const navigationRef=useRef(null);
 useEffect(()=>{const controller=new AbortController();setSession(null);setError('');request('/control/me',{signal:controller.signal}).then(setSession).catch(e=>{if(e.name!=='AbortError'){setError(e.message);if(e.status===401)router.replace('/admin/login');}});return()=>controller.abort();},[reload]);
 useEffect(()=>{const ended=()=>{setSession(null);router.replace('/admin/login');};window.addEventListener('admin-session-ended',ended);return()=>window.removeEventListener('admin-session-ended',ended);},[router]);
 useEffect(()=>{setOpen(false);},[module]);
 useEffect(()=>{if(!open)return;const previous=document.activeElement;const focusable=()=>[...navigationRef.current.querySelectorAll('a[href],button,summary')].filter(node=>node.getClientRects().length);focusable()[0]?.focus();const listener=e=>{if(e.key==='Escape')setOpen(false);if(e.key==='Tab'){const items=focusable(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};window.addEventListener('keydown',listener);return()=>{window.removeEventListener('keydown',listener);previous?.focus();};},[open]);
 async function logout(){try{await request('/staff/logout',{method:'POST',body:{}});}catch{}localStorage.removeItem('admin_token');router.replace('/admin/login');}
 const canView=session&&allowed(session.actor,legacy?'super':entry[3]);
 return <AdminContext.Provider value={session}><div className={s.app}><a className={s.skip} href="#control-main">Skip to content</a>{open&&<button className={s.scrim} onClick={()=>setOpen(false)} aria-label="Close navigation"/>}
 <aside ref={navigationRef} className={`${s.sidebar} ${open?s.sidebarOpen:''}`} role={open?'dialog':undefined} aria-modal={open?true:undefined} aria-label="Administration navigation"><div className={s.brand}><span className={s.brandMark}>m<span>↗</span></span><div>mytiklink<span>CONTROL CENTER</span></div><button className={`${s.iconButton} ${s.mobileOnly}`} onClick={()=>setOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
 <div className={s.workspace}><ShieldCheck size={18}/><div>Platform administration<small>{session?.actor.superAdmin?'Super Admin':session?.actor.role||'Verifying access'}</small></div></div>
 <nav className={s.navigation}>{groups.map(group=>{const items=group.items.filter(e=>session&&allowed(session.actor,e[3]));if(!items.length)return null;return <details key={group.name} open={group.name==='Overview'||items.some(e=>e[0]===module)}><summary>{group.name}<ChevronDown size={13}/></summary>{items.map(([key,label,Icon])=><Link key={key} href={href(key)} className={module===key?s.selected:''} aria-current={module===key?'page':undefined}><Icon size={17}/><span>{label}</span>{module===key&&<i/>}</Link>)}</details>;})}</nav>
 <div className={s.account}><span className={s.avatar}>{session?.actor.name?.slice(0,1).toUpperCase()||'A'}</span><div><strong>{session?.actor.name||'Administrator'}</strong><small>Secure workspace</small></div><button onClick={logout} className={s.iconButton} aria-label="Sign out"><LogOut size={17}/></button></div></aside>
 <div className={s.main}><header className={s.topbar}><div><button className={`${s.iconButton} ${s.mobileOnly}`} onClick={()=>setOpen(true)} aria-label="Open navigation" aria-expanded={open}><Menu size={20}/></button><span className={s.breadcrumb}>Platform <span>/</span></span><strong>{entry[1]}</strong></div><a href="/v1-1/dashboard" className={s.productLink}>Open MyTikLink<ArrowUpRight size={15}/></a></header>
 <main id="control-main" className={s.content}><div className={s.pageHeading}><div><span className={s.eyebrow}>{module==='overview'?'THE BIG PICTURE':'PLATFORM MANAGEMENT'}</span><h1>{entry[1]}</h1><p>{descriptions[module]||'A dedicated workspace for the records and services that power MyTikLink.'}</p></div><span className={s.secure}><ShieldCheck size={14}/>Permission protected</span></div>
 {error?<ErrorBox error={error} retry={()=>setReload(n=>n+1)}/>:!session?<Loading/>:!canView?<ErrorBox error="Your role does not have access to this section."/>:children}
 <footer className={s.footer}>MyTikLink administration<span>Real records. Explicit permissions.</span></footer></main></div></div></AdminContext.Provider>;
}
