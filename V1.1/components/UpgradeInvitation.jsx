import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/router';
import {Sparkles,PanelsTopLeft,Store,Paintbrush,MousePointerClick,Headphones,ArrowRight} from 'lucide-react';
import {apiRequest} from '../lib/api';
import {adoptionEvent} from '../lib/dashboardPreference';
import {Modal,Button} from './UI';
import VersionBadge from './VersionBadge';
import css from './UpgradeInvitation.module.css';
const features=[
 [PanelsTopLeft,'Personalized dashboard','A clearer view of your pages, links and store.'],
 [Paintbrush,'Flexible page editing','Customize templates or build a page from scratch.'],
 [Store,'Better store management','Manage your products, orders and store settings.'],
 [MousePointerClick,'Tracking integrations','Connect supported Meta, TikTok, Snapchat and Google pixels.'],
 [Headphones,'Improved support','Find support channels and Ask MyTikLink AI in one place.'],
 [Sparkles,'More design choices','Explore the available page and storefront templates.']
];
export default function UpgradeInvitation(){
 const router=useRouter(),ref=useRef(null),[preference,setPreference]=useState(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let alive=true;apiRequest('/auth/dashboard-preference').then(value=>{if(alive){setPreference(value);if(value.version==='v1-1')router.replace(value.destination);}}).catch(()=>{});return()=>{alive=false;};},[]);
 useEffect(()=>{if(preference?.version!=='legacy'||!ref.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){adoptionEvent('announcement');observer.disconnect();}},{threshold:.5});observer.observe(ref.current);return()=>observer.disconnect();},[preference]);
 const continueToV11=async()=>{if(busy)return;setBusy(true);setError('');try{await apiRequest('/auth/dashboard-preference',{method:'POST',body:JSON.stringify({version:'v1-1'})});await router.push('/v1-1/dashboard');}catch(e){setError(e.message);setBusy(false);}};
 if(preference?.version!=='legacy')return null;
 return <><section ref={ref} className={css.card}><div><span className={css.eyebrow}><Sparkles size={15}/> Meet your new workspace <VersionBadge/></span><h2>MyTikLink just got upgraded!</h2><p>Try out our new dashboard. It’s a better look, better design and more tools to help your business grow.</p></div><button onClick={()=>{setOpen(true);adoptionEvent('preview');}}>Move to the new version dashboard (Free)<ArrowRight size={16}/></button></section>
 {open&&<Modal title="Discover what's new in MyTikLink V1.1" description="A better dashboard, more tools, and an easier way to manage your business online." wide onClose={()=>!busy&&setOpen(false)} footer={<><Button variant="secondary" disabled={busy} onClick={()=>setOpen(false)}>Not now</Button><Button disabled={busy} onClick={continueToV11}>{busy?'Saving your preference…':'Continue to V1.1'}</Button></>}><div className={css.features}>{features.map(([Icon,title,description])=><article key={title}><Icon size={21}/><div><h3>{title}</h3><p>{description}</p></div></article>)}</div><p className={css.note}>Your existing account, published links, pages, store and subscription stay intact.</p>{error&&<p role="alert">{error}</p>}</Modal>}</>;
}
