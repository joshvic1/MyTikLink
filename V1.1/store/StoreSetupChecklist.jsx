import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,ChevronLeft,ChevronRight,X,Package,Sparkles,MapPin,CalendarDays,Folder,Truck,Coins} from 'lucide-react';
import {setupTasks} from './setupProgress.mjs';
import css from './StoreSetupChecklist.module.css';
const icons={service:Sparkles,product:Package,address:MapPin,availability:CalendarDays,categories:Folder,delivery:Truck,currencies:Coins};
export default function StoreSetupChecklist({progress}){
 const [dismissed,setDismissed]=useState([]),rail=useRef(null);
 useEffect(()=>setDismissed([]),[progress?.storeId]);
 const tasks=setupTasks(progress).filter(t=>!t.done&&!dismissed.includes(t.id));
 if(!progress||!tasks.length)return null;
 const move=direction=>rail.current?.scrollBy({left:direction*(rail.current.clientWidth*.85),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 return <section className={css.card} aria-label="Finish setting up your account"><header><div><h2>Finish setting up your account</h2></div>{tasks.length>1&&<div className={css.controls}><button aria-label="Previous setup task" onClick={()=>move(-1)}><ChevronLeft size={16}/></button><button aria-label="Next setup task" onClick={()=>move(1)}><ChevronRight size={16}/></button></div>}</header><div className={css.tasks} ref={rail} tabIndex={0} aria-label="Unfinished setup tasks">{tasks.map((t,i)=>{const Icon=icons[t.id]||Sparkles;return <article key={t.id} className={css.task} data-tone={i%3}><button className={css.close} aria-label={'Dismiss '+t.label} onClick={()=>setDismissed(ids=>[...ids,t.id])}><X size={14}/></button><span className={css.icon}><Icon size={24}/></span><div className={css.copy}><small>{t.required?'UP NEXT':'OPTIONAL'}</small><h3>{t.label}</h3><p>{t.id==='currencies'?'NGN is ready. Offer another currency if you need it.':t.id==='availability'?'Choose the days and times customers can book.':'Complete this step to help customers get started.'}</p><Link href={t.href}>Set up now <ArrowRight size={14}/></Link></div></article>;})}</div></section>;
}
