import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {ArrowLeft} from 'lucide-react';
import {Modal,Button} from './UI';
import {v11Api} from '../lib/api';
import {getThemeBlock} from '../landing/themeModel';
import s from './StarterPage.module.css';
const ThemeRenderer=dynamic(()=>import('../landing/ThemeRenderer'));
export default function StarterPagePreview({page,onClose,onUpgrade}){
 const [detail,setDetail]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;v11Api.pageDetail(page._id).then(data=>{if(active)setDetail(data);}).catch(e=>{if(active)setError(e.message||'Preview could not load.');});return()=>{active=false;};},[page._id]);
 const instance=detail&&getThemeBlock(detail.customContent);
 return <Modal title="Your page preview" headerIcon={<button className={s.previewBack} onClick={onClose} aria-label="Back to previous page"><ArrowLeft size={19}/></button>} backdropClassName={s.previewBackdrop} description="This is what your landing page looks like below." className={s.previewSheet} onClose={onClose} footer={<Button onClick={onUpgrade}>Upgrade to Pro to publish this page</Button>}><div className={s.previewStage}><div className={s.previewFrame}>{error?<p role="alert">{error}</p>:!detail?<p role="status">Loading your preview…</p>:instance?<div inert="" className={s.previewContent}><ThemeRenderer instance={instance} preview/></div>:<p>This page preview is unavailable.</p>}</div></div></Modal>;
}
