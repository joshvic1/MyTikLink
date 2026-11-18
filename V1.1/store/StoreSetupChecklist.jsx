import {useEffect,useState} from 'react';
import {useRouter} from 'next/router';
import {Check,ArrowRight,X} from 'lucide-react';
import {setupTasks,shouldShowSetup} from './setupProgress.mjs';
import css from './StoreSetupChecklist.module.css';
export default function StoreSetupChecklist({progress}) {
 const router=useRouter(),[closed,setClosed]=useState(false),[dismissedAt,setDismissedAt]=useState(0);
 const key='store-setup-dismissed:'+progress?.storeId;
 useEffect(()=>{setClosed(false);try{setDismissedAt(Number(localStorage.getItem(key)||0))}catch{}},[key]);
 const tasks=setupTasks(progress);
 if(!progress||closed||!shouldShowSetup(tasks,dismissedAt))return null;
 const completed=tasks.filter(t=>t.done).length;
 return <section className={css.card} aria-label="Finish setting up your store"><header><div><h2>Finish setting up your store</h2><p>{completed} of {tasks.length} completed · Set up at your own pace</p></div><button aria-label="Dismiss store setup checklist" onClick={()=>{setClosed(true);try{localStorage.setItem(key,String(Date.now()))}catch{}}}><X size={18}/></button></header><div className={css.progress}><i style={{width:`${completed/tasks.length*100}%`}}/></div><div className={css.tasks}>{tasks.map(t=><button key={t.id} onClick={()=>router.push(t.href)} className={t.done?css.done:''}><span className={css.check}>{t.done?<Check size={14}/>:null}</span><span><b>{t.label}</b>{!t.required&&<small>{t.id==='currencies'?'Optional · NGN already works':'For appointment services'}</small>}</span>{!t.done&&<ArrowRight size={16}/>}</button>)}</div></section>;
}
