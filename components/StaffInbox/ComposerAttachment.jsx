import {useCallback,useEffect,useRef,useState} from 'react';
import {FileText,LoaderCircle,RotateCcw,X,Check} from 'lucide-react';
import {attachmentError} from './clipboardMedia.mjs';
import s from './ComposerAttachment.module.css';
export function useComposerUpload({conversation,channel,media,setMedia,demo}){
 const [attachment,setAttachment]=useState(null),active=useRef(null),preview=useRef(null);
 const cancel=useCallback(()=>{active.current?.abort();active.current=null;if(preview.current)URL.revokeObjectURL(preview.current);preview.current=null;setAttachment(null);setMedia(null);},[setMedia]);
 useEffect(()=>{cancel();return()=>{active.current?.abort();if(preview.current)URL.revokeObjectURL(preview.current);preview.current=null;}},[conversation,cancel]);
 useEffect(()=>{if(attachment?.ready&&!media)cancel();},[media,attachment?.ready,cancel]);
 async function upload(file){cancel();const error=attachmentError(file,channel);if(error){setAttachment({file,error});return;}if(demo){setAttachment({file,error:'Uploads are unavailable in the design preview.'});return;}
 const controller=new AbortController();active.current=controller;const url=file.type.startsWith('image/')?URL.createObjectURL(file):null;preview.current=url;setAttachment({file,url,uploading:true});
 const form=new FormData();form.set('file',file,file.name||'pasted-image.png');form.set('channel',channel);
 const timeout=setTimeout(()=>controller.abort(),45000);
 try{const response=await fetch('/api/staff/media',{method:'POST',body:form,signal:controller.signal});const data=await response.json();if(!response.ok||!data.media?._id)throw Error(data.message||'Could not upload this file.');if(active.current!==controller)return;setMedia(data.media);setAttachment({file,url,ready:true});}
 catch(e){if(active.current===controller)setAttachment({file,url,error:e.name==='AbortError'?'Upload timed out. Try again.':e.message});}
 finally{clearTimeout(timeout);if(active.current===controller)active.current=null;}
 }
 return {attachment,upload,cancel};
}
export default function ComposerAttachment({attachment,media,onRemove,onRetry,disabled}){if(!attachment&&!media)return null;const file=attachment?.file;return <div className={s.card} aria-live="polite"><div className={s.thumbnail}>{attachment?.url?<img src={attachment.url} alt="Image attachment preview"/>:<FileText size={23}/>}</div><div className={s.details}><strong title={file?.name||media?.name}>{file?.name||media?.name||'Pasted image'}</strong><span>{file?`${Math.max(1,Math.round(file.size/1024))} KB · `:''}{attachment?.uploading?<><LoaderCircle size={12} className={s.spin}/>Uploading…</>:attachment?.error?<span className={s.error} role="alert">{attachment.error}</span>:<><Check size={12}/>Ready to send</>}</span>{attachment?.error&&<button type="button" className={s.retry} onClick={()=>onRetry(file)}><RotateCcw size={12}/>Try again</button>}</div><button type="button" className={s.remove} aria-label={attachment?.uploading?'Cancel upload':'Remove attachment'} onClick={onRemove} disabled={disabled}><X size={16}/></button></div>}
