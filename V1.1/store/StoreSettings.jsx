import {draftKey,readDraft,writeDraft} from './localDesign.mjs';
import {CatalogStoreContext} from "./CatalogControls";
import {TrackingPage} from "../pages/TrackingPage";
import {Children,isValidElement} from "react";
import {useSubscription} from "../components/SubscriptionModal";
import SettingsHelp from "./SettingsHelp";
import workspaceStyles from "../styles/v11.module.css";
import {CommerceSettingsPanel,ResourceManager} from "./CommerceSettings";
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {ArrowUpRight,Check,Settings2} from 'lucide-react';
import {apiRequest} from '../lib/api';
import {Button,Field,Modal,PageHeader,LoadingState,ErrorState} from '../components/UI';
import {notify} from '../components/Notifications';
import {themes,changeTheme} from './design';
import {CategoryManager} from './StoreCategories';
import StoreTemplateCard from './StoreTemplateCard';
import styles from './store.module.css';
import css from './StoreSettings.module.css';
const tabTones={Categories:'teal',Payments:'peach',Delivery:'teal',Branding:'pink',Theme:'purple',Checkout:'peach',Inventory:'teal',Discounts:'pink',Customers:'blue',Policies:'gold',SEO:'blue',Integrations:'teal',Advanced:'purple'};
const tabs=['Categories','Payments','Delivery','Branding','Theme','Inventory','Discounts','Customers','Policies','SEO','Integrations','Advanced'];
function SettingsGate({locked,onUpgrade,children}){return <>{Children.map(children,(child,index)=>!locked||!isValidElement(child)||child.props.hidden?child:<div className={css.lockedSection} key={index}><div inert="" aria-hidden="true" className={css.blurredSection}>{child}</div><button className={css.unlockSection} onClick={onUpgrade}><Settings2 size={20}/><strong>Upgrade to Pro to access this</strong><span>Unlock your store settings <ArrowUpRight size={14}/></span></button></div>)}</>;}
export default function StoreSettings(){
 const {openSubscription}=useSubscription();
 const router=useRouter(),[data,setData]=useState(null),[form,setForm]=useState(null),[saved,setSaved]=useState(null),[template,setTemplate]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[commerceDirty,setCommerceDirty]=useState(false);const lock=useRef(false),nav=useRef(null);
 const [pendingTheme,setPendingTheme]=useState(null);
 const [headerHeight,setHeaderHeight]=useState(54);
 useEffect(()=>{const header=document.querySelector('.'+workspaceStyles.topbar);if(!header)return;const measure=()=>setHeaderHeight(header.getBoundingClientRect().height);measure();const observer=new ResizeObserver(measure);observer.observe(header);return()=>observer.disconnect();},[]);
 const tab=router.query.tab==='checkout'?'Payments':tabs.find(t=>t.toLowerCase()===router.query.tab)||'Categories';
 // Scroll only the horizontal tab rail, keeping the page position unchanged.
 useEffect(()=>{
   const rail=nav.current;
   if(!rail)return;
   const center=()=>{
     const active=rail.querySelector('[aria-selected="true"]');
     if(!active)return;
     const bounds=rail.getBoundingClientRect(),item=active.getBoundingClientRect();
     const target=rail.scrollLeft+item.left-bounds.left+(item.width-rail.clientWidth)/2;
     rail.scrollTo({left:Math.max(0,Math.min(target,rail.scrollWidth-rail.clientWidth)),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   };
   const frame=requestAnimationFrame(center);
   const observer=new ResizeObserver(center);
   observer.observe(rail);
   return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[tab,Boolean(data)]);
 const dirty=commerceDirty||!!saved&&(JSON.stringify(form)!==JSON.stringify(saved)||template!==data?.design.theme);
 const load=async()=>{const d=await apiRequest('/v1-1/store-studio');setData(d);setForm(d.setup);setSaved(d.setup);setTemplate(d.design.theme);setError('');};
 useEffect(()=>{const refresh=()=>load().catch(e=>setError(e.message));refresh();window.addEventListener('v11:plan-updated',refresh);return()=>window.removeEventListener('v11:plan-updated',refresh);},[]);
 useEffect(()=>{const leave=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave);},[dirty]);
 useEffect(()=>{if(!dirty)return;const guard=url=>{if(url.split('?')[0]===router.asPath.split('?')[0]||window.confirm('Leave without saving your store settings?'))return;router.events.emit('routeChangeError');throw 'Store settings navigation cancelled';};router.events.on('routeChangeStart',guard);return()=>router.events.off('routeChangeStart',guard);},[dirty,router]);
 const select=name=>{if(busy)return;router.replace({pathname:router.pathname,query:{...router.query,tab:name.toLowerCase()}},undefined,{shallow:true,scroll:false}).catch(()=>{});};
 const keyboard=e=>{const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();const buttons=[...nav.current.querySelectorAll('[role="tab"]')],i=buttons.indexOf(document.activeElement);const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].scrollIntoView({block:'nearest',inline:'nearest'});};
 const save=async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{if(template!==data.design.theme){const design=changeTheme(data.design,template);const result=await apiRequest('/v1-1/store-studio/draft',{method:'PUT',body:JSON.stringify({design,setup:form,revision:data.revision})});setData(d=>({...d,design,revision:result.revision}));notify.success('Template saved to draft');}if(JSON.stringify(form)!==JSON.stringify(saved)){await apiRequest('/v1-1/store-studio/settings',{method:'PATCH',body:JSON.stringify(form)});setSaved(form);notify.success('Store settings saved');}}catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
 if(!data)return error?<ErrorState message={error} onRetry={()=>load().catch(e=>setError(e.message))}/>:<LoadingState/>;
 return <CatalogStoreContext.Provider value={data.store?.slug||''}><main className={`${workspaceStyles.page} ${css.page}`}><PageHeader title="Store settings"/><div className={css.tabRail} style={{top:headerHeight}}><nav ref={nav} role="tablist" aria-label="Store settings" className={css.tabs} onKeyDown={keyboard}>{tabs.map(name=><button key={name} data-tone={tabTones[name]} role="tab" id={`settings-tab-${name.toLowerCase()}`} aria-controls="store-settings-panel" aria-selected={tab===name} tabIndex={tab===name?0:-1} onClick={()=>select(name)}>{name}</button>)}</nav></div><section id="store-settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${tab.toLowerCase()}`} className={css.panel}><SettingsGate locked={data.available===false} onUpgrade={()=>openSubscription({mode:"upgrade",preselected:"pro"})}>
 {tab==='Categories'&&<><div className={css.settingsGroup} data-tone="teal"><CategoryManager/></div><div className={css.settingsGroup} data-tone="peach"><ResourceManager/></div></>}
 {tab==='Integrations'&&<div className={css.settingsGroup} data-tone="teal"><TrackingPage embedded/></div>}
 {tab==='Theme'&&<div className={css.settingsGroup}><div className={css.panelHeading}><div><h2>Your storefront style <SettingsHelp topic="Theme"/></h2><p>Choose a theme for your storefront. Your custom content and design settings are preserved.</p></div></div><div className={styles.templateChoices}>{Object.entries(themes).sort(([a],[b])=>Number(b===data.design.theme)-Number(a===data.design.theme)).map(([id,t])=><button key={id} type="button" disabled={busy} aria-pressed={template===id} onClick={()=>id!==data.design.theme&&setPendingTheme(id)}><span className={styles.themePreview}><img src={`/v1-1/store-themes/${id}.webp`} alt={`${t.name} storefront preview`} loading="lazy"/>{data.design.theme===id&&<span className={styles.activeTheme} aria-label="Saved theme"><Check size={15}/></span>}</span><strong>{t.name}</strong><small>{t.description}</small><span className={styles.templateSelection}>{template===id?<><Check size={14}/> Selected</>:'Choose template'}</span></button>)}</div><Link className={css.textLink} href="/v1-1/store/design">Customise & preview <ArrowUpRight size={16}/></Link></div>}
 <div className={tab==='Payments'?css.paymentSections:css.settingsGroup} data-tone={tab==='Payments'||tab==='Checkout'?'peach':tab==='Delivery'||tab==='Inventory'?'teal':tab==='Branding'?'pink':'purple'} hidden={tab==='Categories'||tab==='Theme'||tab==='Integrations'}><CommerceSettingsPanel tab={tab} setup={data.setup} onDirtyChange={setCommerceDirty}/></div>
 {error&&<p role="alert" className={css.error}>{error}</p>}{pendingTheme&&<Modal title="Apply this theme?" description={`Do you want to use ${themes[pendingTheme].name} for your storefront?`} onClose={()=>!busy&&setPendingTheme(null)} footer={<><Button variant="secondary" disabled={busy} onClick={()=>setPendingTheme(null)}>Cancel</Button><Button disabled={busy} onClick={async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const result=await apiRequest('/v1-1/store-studio/theme',{method:'POST',body:JSON.stringify({theme:pendingTheme,revision:data.revision})});setData(d=>({...d,...result}));try{const key=draftKey(data.ownerId,data.store?._id||data.ownerId),cached=readDraft(localStorage,key);if(cached&&cached.revision===data.revision)writeDraft(localStorage,key,{...cached.design,theme:result.design.theme},result.revision);}catch{}setTemplate(result.design.theme);setPendingTheme(null);notify.success('Store theme applied');}catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}}}>{busy?'Applying…':'Confirm'}</Button></>}><p>Your content, colors, fonts, images and layout settings will be kept. The new theme may present them differently.</p></Modal>}</SettingsGate></section></main></CatalogStoreContext.Provider>;
}