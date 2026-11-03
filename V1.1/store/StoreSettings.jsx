import SettingsHelp from "./SettingsHelp";
import workspaceStyles from "../styles/v11.module.css";
import {CommerceSettingsPanel,ResourceManager} from "./CommerceSettings";
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {ArrowUpRight,Check,Settings2} from 'lucide-react';
import {apiRequest} from '../lib/api';
import {Button,Field,PageHeader,LoadingState,ErrorState} from '../components/UI';
import {notify} from '../components/Notifications';
import {themes,changeTheme} from './design';
import {CategoryManager} from './StoreCategories';
import StoreTemplateCard from './StoreTemplateCard';
import styles from './store.module.css';
import css from './StoreSettings.module.css';
const tabTones={Categories:'teal',Payments:'peach',Delivery:'teal',Branding:'pink',Theme:'purple',Checkout:'peach',Inventory:'teal',Discounts:'pink',Customers:'blue',Policies:'gold',SEO:'blue',Integrations:'teal',Advanced:'purple'};
const tabs=['Categories','Payments','Delivery','Branding','Theme','Checkout','Inventory','Discounts','Customers','Policies','SEO','Integrations','Advanced'];
export default function StoreSettings(){
 const router=useRouter(),[data,setData]=useState(null),[form,setForm]=useState(null),[saved,setSaved]=useState(null),[template,setTemplate]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[commerceDirty,setCommerceDirty]=useState(false);const lock=useRef(false),nav=useRef(null);
 const [headerHeight,setHeaderHeight]=useState(54);
 useEffect(()=>{const header=document.querySelector('.'+workspaceStyles.topbar);if(!header)return;const measure=()=>setHeaderHeight(header.getBoundingClientRect().height);measure();const observer=new ResizeObserver(measure);observer.observe(header);return()=>observer.disconnect();},[]);
 const tab=tabs.find(t=>t.toLowerCase()===router.query.tab)||'Categories';
 const dirty=commerceDirty||!!saved&&(JSON.stringify(form)!==JSON.stringify(saved)||template!==data?.design.theme);
 const load=async()=>{const d=await apiRequest('/v1-1/store-studio');setData(d);setForm(d.setup);setSaved(d.setup);setTemplate(d.design.theme);setError('');};
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 useEffect(()=>{const leave=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave);},[dirty]);
 useEffect(()=>{if(!dirty)return;const guard=url=>{if(url.split('?')[0]===router.asPath.split('?')[0]||window.confirm('Leave without saving your store settings?'))return;router.events.emit('routeChangeError');throw 'Store settings navigation cancelled';};router.events.on('routeChangeStart',guard);return()=>router.events.off('routeChangeStart',guard);},[dirty,router]);
 const select=name=>{if(busy)return;router.replace({pathname:router.pathname,query:{...router.query,tab:name.toLowerCase()}},undefined,{shallow:true,scroll:false}).catch(()=>{});};
 const keyboard=e=>{const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();const buttons=[...nav.current.querySelectorAll('[role="tab"]')],i=buttons.indexOf(document.activeElement);const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].scrollIntoView({block:'nearest',inline:'nearest'});};
 const save=async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{if(template!==data.design.theme){const design=changeTheme(data.design,template);const result=await apiRequest('/v1-1/store-studio/draft',{method:'PUT',body:JSON.stringify({design,setup:form,revision:data.revision})});setData(d=>({...d,design,revision:result.revision}));notify.success('Template saved to draft');}if(JSON.stringify(form)!==JSON.stringify(saved)){await apiRequest('/v1-1/store-studio/settings',{method:'PATCH',body:JSON.stringify(form)});setSaved(form);notify.success('Store settings saved');}}catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
 if(!data)return error?<ErrorState message={error} onRetry={()=>load().catch(e=>setError(e.message))}/>:<LoadingState/>;
 return <main className={`${workspaceStyles.page} ${css.page}`}><PageHeader title="Store settings"/><div className={css.tabRail} style={{top:headerHeight}}><nav ref={nav} role="tablist" aria-label="Store settings" className={css.tabs} onKeyDown={keyboard}>{tabs.map(name=><button key={name} data-tone={tabTones[name]} role="tab" id={`settings-tab-${name.toLowerCase()}`} aria-controls="store-settings-panel" aria-selected={tab===name} tabIndex={tab===name?0:-1} onClick={()=>select(name)}>{name}</button>)}</nav></div><section id="store-settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${tab.toLowerCase()}`} className={css.panel}>
 {tab==='Categories'&&<><div className={css.settingsGroup} data-tone="teal"><CategoryManager/></div><div className={css.settingsGroup} data-tone="peach"><ResourceManager/></div></>}
 {tab==='Theme'&&<div className={css.settingsGroup}><div className={css.panelHeading}><div><h2>Your storefront style <SettingsHelp topic="Theme"/></h2><p>Choose a template, then preview and publish it in Store design.</p></div></div><div className={styles.templateChoices}>{Object.entries(themes).map(([id,t])=><button key={id} type="button" disabled={busy} aria-pressed={template===id} onClick={()=>setTemplate(id)}>{['atelier','streetline','atelier-services','streetline-services','digital-library','launchpad','signal-studio','dataflow'].includes(id)?<StoreTemplateCard theme={id} store={data.store||form} products={data.products||[]} accent={data.design.brand.accent}/>:<span className={styles.templateSwatch} style={{background:t.accent}}/>}<strong>{t.name}</strong><small>{t.description}</small><span className={styles.templateSelection}>{template===id?<><Check size={14}/> Selected</>:'Choose template'}</span></button>)}</div><Link className={css.textLink} href="/v1-1/store/design">Customise & preview <ArrowUpRight size={16}/></Link></div>}
 <div className={css.settingsGroup} data-tone={tab==='Payments'||tab==='Checkout'?'peach':tab==='Delivery'||tab==='Inventory'?'teal':tab==='Branding'?'pink':'purple'} hidden={tab==='Categories'||tab==='Theme'}><CommerceSettingsPanel tab={tab} setup={data.setup} onDirtyChange={setCommerceDirty}/></div>
 {error&&<p role="alert" className={css.error}>{error}</p>}{tab==='Theme'&&<footer className={css.saveBar}><span>{dirty?'Unsaved changes':'All changes saved'}</span><Button variant="secondary" disabled={busy||!dirty} onClick={()=>{setForm(saved);setTemplate(data.design.theme);setError('');}}>Cancel</Button><Button disabled={busy||!dirty} onClick={save}>{busy?'Saving…':'Save changes'}</Button></footer>}</section></main>;
}