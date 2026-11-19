import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Youtube,X} from 'lucide-react';
import css from './SettingsVideo.module.css';
const videos={ 'Product categories':'n4jfWIjvpMk', Delivery:'962SSHRX2Zo', 'Physical products':'6mfCzsAmC4A' };
function VideoOverlay({topic,videoId,onClose}){
 const dialog=useRef(null),close=useRef(null);
 useEffect(()=>{
  const previous=document.activeElement,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  dialog.current.showModal();close.current.focus();
  return()=>{document.body.style.overflow=overflow;previous?.focus?.();};
 },[]);
 return createPortal(<dialog ref={dialog} className={css.overlay} onKeyDown={event=>event.stopPropagation()} aria-label={`${topic} video guide`} onCancel={event=>{event.preventDefault();onClose();}}>
  <header className={css.header}><span>{topic} video guide</span><button ref={close} className={css.close} type="button" aria-label="Close video guide" onClick={onClose}><X size={28}/></button></header>
  <div className={css.stage}><iframe className={`${css.player} ${topic==='Physical products'?css.landscape:''}`} src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0`} title={`${topic} YouTube video guide`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>
 </dialog>,document.body);
}
export default function SettingsVideo({topic,compact=false}){
 const [open,setOpen]=useState(false),videoId=videos[topic];
 if(!videoId)return null;
 return <><button className={`${css.trigger} ${compact?css.compact:""}`} type="button" aria-label={`Watch ${topic.toLowerCase()} video guide`} title={`Watch ${topic.toLowerCase()} video guide`} onClick={()=>setOpen(true)}><Youtube size={19}/></button>{open&&<VideoOverlay topic={topic} videoId={videoId} onClose={()=>setOpen(false)}/>}</>;
}
