import AudioPlayer from './AudioPlayer';
import {useEffect,useRef,useState} from 'react';
import {LoaderCircle,RotateCcw,X} from 'lucide-react';
import {mediaQueue} from './mediaQueue.mjs';
import s from './StaffInbox.module.css';

export default function MessageAttachment({message,attachment,download,pending=false,failed=false}){
 const [viewer,setViewer]=useState(false),[active,setActive]=useState(false),[loaded,setLoaded]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 const box=useRef(null),release=useRef(()=>{});
 const url='/api/staff/messages/'+message+'/attachments/'+attachment._id,type=attachment.mimeType||'',image=type.startsWith('image/'),video=type.startsWith('video/'),audio=type.startsWith('audio/');
 useEffect(()=>{
  if(pending||(!image&&!video))return;
  let cancel=()=>{},timer,disposed=false;
  setActive(false);setLoaded(false);setError(false);
  const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();cancel=mediaQueue.enqueue(done=>{if(disposed){done();return;}release.current=()=>{clearTimeout(timer);done();};setActive(true);timer=setTimeout(()=>{setActive(false);setError(true);done();},30000);});},{rootMargin:'120px'});
  if(box.current)observer.observe(box.current);
  return()=>{disposed=true;observer.disconnect();clearTimeout(timer);cancel();};
 },[url,image,video,pending,attempt]);
 const ready=()=>{setLoaded(true);release.current();};
 const fail=()=>{setError(true);setActive(false);release.current();};
 if(pending&&failed)return <div className={s.fileAttachment}>Attachment not sent. Check the message status before retrying.</div>;
 if(audio)return pending?<div className={s.mediaLoading} role="status"><LoaderCircle className={s.spin}/>Sending audio…</div>:<AudioPlayer src={url+'/view'}/>;
 if(!image&&!video)return <div className={s.fileAttachment}>{download&&!pending?<a href={url}>{attachment.name||'Attachment'}</a>:<span>{attachment.name||'Attachment'}</span>}</div>;
 return <><div ref={box} className={s.chatMedia} aria-busy={!loaded&&!error}>
  {!loaded&&!error&&<span className={s.mediaLoading} role="status" aria-label={pending?'Sending media':'Loading '+(image?'image':'video')}><LoaderCircle className={s.spin}/></span>}
  {error&&<button className={s.mediaRetry} type="button" onClick={()=>setAttempt(n=>n+1)}><RotateCcw size={18}/>Tap to retry</button>}
  {active&&(image?<img src={url+'/view'} alt={attachment.name||'Chat image'} onLoad={ready} onError={fail} onClick={()=>setViewer(true)} tabIndex={0} role="button" aria-label="Open image" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setViewer(true);}}} style={{visibility:loaded?'visible':'hidden'}}/>:<video controls playsInline preload="metadata" controlsList="nodownload" src={url+'/view'} onLoadedMetadata={ready} onError={fail} style={{visibility:loaded?'visible':'hidden'}}/>)}
 </div>{viewer&&<div role="dialog" aria-modal="true" aria-label="Image preview" className={s.imageViewer} onClick={()=>setViewer(false)} onKeyDown={e=>{if(e.key==='Escape')setViewer(false)}}><button autoFocus type="button" aria-label="Close image preview" onClick={()=>setViewer(false)}><X/></button><img src={url+'/view'} alt={attachment.name||'Chat image'}/></div>}</>;
}
