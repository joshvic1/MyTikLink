import {useEffect,useRef,useState} from 'react';
import {Lightbulb} from 'lucide-react';
import {Modal,Button} from './UI';
import {apiRequest} from '../lib/api';
export function requestFeatureSuggestion(){window.dispatchEvent(new Event('mytiklink:suggest-feature'));}
export default function FeatureSuggestion(){
 const [open,setOpen]=useState(false),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);const request=useRef();
 useEffect(()=>{const show=()=>{setSent(false);setError('');setOpen(true)};window.addEventListener('mytiklink:suggest-feature',show);return()=>window.removeEventListener('mytiklink:suggest-feature',show)},[]);
 if(!open)return null;
 return <Modal title="Suggest a feature" headerIcon={<Lightbulb/>} onClose={()=>!busy&&setOpen(false)}>{sent?<div role="status"><p>Thank you! Your suggestion has been sent to our team.</p><Button onClick={()=>setOpen(false)}>Done</Button></div>:<form onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');if(!request.current||request.current.text!==text)request.current={text,id:crypto.randomUUID()};try{await apiRequest('/v1-1/feature-suggestions',{method:'POST',body:JSON.stringify({text,requestId:request.current.id})});setSent(true);setText('');request.current=null}catch(err){setError(err.message)}finally{setBusy(false)}}}><label htmlFor="feature-suggestion">What would you like us to add?</label><p>Type your idea below. Tell us what it would help you do with MyTikLink.</p><textarea id="feature-suggestion" autoFocus required minLength={10} maxLength={3000} rows={6} disabled={busy} value={text} onChange={e=>setText(e.target.value)} placeholder="I would love to be able to…" style={{width:'100%',resize:'vertical',padding:14,border:'1px solid #ded5f0',borderRadius:14,font:'inherit',fontSize:16,background:'#faf8ff'}}/><small>{text.length}/3,000 characters</small>{error&&<p role="alert">{error}</p>}<div style={{marginTop:16}}><Button type="submit" disabled={busy||text.trim().length<10}>{busy?'Submitting…':'Submit suggestion'}</Button></div></form>}</Modal>;
}
