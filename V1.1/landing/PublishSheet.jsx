"use client";
import {useState,useEffect} from 'react';
import {Modal,Button} from '../components/UI';
import {notify} from '../components/Notifications';
import {Rocket,Loader2,Link2,LockKeyhole} from 'lucide-react';
import styles from './EditorDialogs.module.css';
export default function PublishSheet({isOpen,onClose,onPublish,hasContent,isPro,onUpgrade,initialTitle=''}){
 const [title,setTitle]=useState(initialTitle),[loading,setLoading]=useState(false);
 useEffect(()=>{setTitle(initialTitle||'');},[initialTitle,isOpen]);
 const publish=async()=>{if(loading||!title.trim())return;if(!isPro){notify.warning("Upgrade your account first to publish this page");onUpgrade?.();return;}setLoading(true);try{await onPublish({title:title.trim()});}finally{setLoading(false);}};
 if(!isOpen)return null;
 const slug=(title.trim()||'your-page').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return <Modal tone="teal" title="Publish Page" onClose={()=>!loading&&onClose()} footer={<><Button variant="secondary" disabled={loading} onClick={onClose}>Back</Button>{hasContent&&<Button onClick={publish} disabled={loading||!title.trim()}>{loading?<Loader2 size={17} className="animate-spin"/>:<Rocket size={17}/>} {loading?'Publishing…':'Publish'}</Button>}</>}>{hasContent?<><label className={styles.field}><span className={styles.label}>Page name</span><input className={styles.input} placeholder="e.g. My business" value={title} onChange={e=>setTitle(e.target.value)}/></label><div className={`${styles.urlPreview} ${!isPro?styles.lockedUrl:""}`}><Link2 size={19}/><div><small>This is your page link below</small><strong aria-hidden={!isPro}>{(process.env.NEXT_PUBLIC_SITE_URL||'https://mytik.link').replace(/\/$/,'')}/v1-1/p/{slug}</strong></div>{!isPro&&<button className={styles.urlLock} onClick={onUpgrade}><LockKeyhole size={13}/>Upgrade to unlock</button>}</div></>:<p className={styles.emptyState}>Add an element to your canvas before publishing.</p>}</Modal>;
}
