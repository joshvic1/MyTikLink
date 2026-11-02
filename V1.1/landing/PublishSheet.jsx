"use client";
import {useState,useEffect} from 'react';
import {Modal,Button} from '../components/UI';
import {Rocket,Loader2,Link2} from 'lucide-react';
import styles from './EditorDialogs.module.css';
export default function PublishSheet({isOpen,onClose,onPublish,hasContent,isPro,onUpgrade,initialTitle=''}){
 const [title,setTitle]=useState(initialTitle),[loading,setLoading]=useState(false);
 useEffect(()=>{setTitle(initialTitle||'');},[initialTitle,isOpen]);
 const publish=async()=>{if(loading||!title.trim())return;if(!isPro){onUpgrade?.();return;}setLoading(true);try{await onPublish({title:title.trim()});}finally{setLoading(false);}};
 if(!isOpen)return null;
 const slug=(title.trim()||'your-page').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return <Modal tone="teal" title="Publish Page" onClose={()=>!loading&&onClose()} footer={<><Button variant="secondary" disabled={loading} onClick={onClose}>Back</Button>{hasContent&&<Button onClick={publish} disabled={loading||!title.trim()}>{loading?<Loader2 size={17} className="animate-spin"/>:<Rocket size={17}/>} {loading?'Publishing…':'Publish'}</Button>}</>}>{hasContent?<><label className={styles.field}><span className={styles.label}>Page name</span><input className={styles.input} autoFocus placeholder="e.g. My business" value={title} onChange={e=>setTitle(e.target.value)}/></label><div className={styles.urlPreview}><Link2 size={19}/><div><small>Link preview · final link is assigned when published</small><strong>{(process.env.NEXT_PUBLIC_SITE_URL||'https://mytik.link').replace(/\/$/,'')}/v1-1/p/{slug}</strong></div></div>{!isPro&&<p className={styles.upgradeText}>Publishing requires an active Pro plan. <button className={styles.upgradeLink} onClick={onUpgrade}>Choose a plan</button></p>}</>:<p className={styles.emptyState}>Add an element to your canvas before publishing.</p>}</Modal>;
}
