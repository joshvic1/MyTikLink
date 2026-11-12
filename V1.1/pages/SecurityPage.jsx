import {useEffect,useState,useId,useRef} from 'react';
import {ShieldCheck,Mail,LockKeyhole,LoaderCircle,Check} from 'lucide-react';
import {useRouter} from 'next/router';
import {apiRequest} from '../lib/api';
import {Button,Field,Modal} from '../components/UI';
import {notify} from '../components/Notifications';
import skin from './AccountSettings.module.css';
import authStyles from '../styles/v11.module.css';
export function PasswordDialog({user,onClose}){
 const id=useId(),[sent,setSent]=useState(false),[code,setCode]=useState(['','','','']),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[cooldown,setCooldown]=useState(0),[done,setDone]=useState(false);
 useEffect(()=>{if(!cooldown)return;const t=setTimeout(()=>setCooldown(v=>v-1),1000);return()=>clearTimeout(t);},[cooldown]);
 const codeRefs=useRef([]);
 const enterCode=(index,raw)=>{
  const digits=raw.replace(/\D/g,'').slice(0,4),next=[...code],start=digits.length===4?0:index;
  if(!digits)next[index]='';
  else [...digits].forEach((digit,offset)=>{if(start+offset<4)next[start+offset]=digit;});
  setCode(next);if(digits)codeRefs.current[Math.min(start+digits.length,3)]?.focus();
 };
 const deleteCode=index=>{const target=code[index]?index:Math.max(0,index-1),next=[...code];next[target]='';setCode(next);codeRefs.current[target]?.focus();};
 const send=async()=>{if(busy||cooldown)return;setBusy(true);try{await apiRequest('/auth/send-password-code',{method:'POST',body:'{}'});setSent(true);setCooldown(120);notify.success('Verification code sent');}catch(e){notify.error(e.message);}finally{setBusy(false);}};
 const update=async e=>{e.preventDefault();if(busy)return;if(!code.every(digit=>/^\d$/.test(digit))){notify.error('Enter the four-digit verification code');return;}if(password!==confirm){notify.error('Passwords do not match');return;}setBusy(true);try{await apiRequest('/auth/update-password-with-code',{method:'POST',body:JSON.stringify({code:code.join(''),password})});setPassword('');setConfirm('');setCode(['','','','']);setDone(true);notify.success('Password updated');}catch(error){notify.error(error.message);}finally{setBusy(false);}};
 return <Modal tone="peach" title="Password & security" onClose={()=>!busy&&onClose()} footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>{done?'Close':'Cancel'}</Button>{!done&&(sent?<Button type="submit" form={id} disabled={busy}>{busy?<LoaderCircle className={skin.spin} size={16}/>:<LockKeyhole size={16}/>} {busy?'Updating…':'Update password'}</Button>:<Button disabled={busy||cooldown>0} onClick={send}>{busy?<LoaderCircle className={skin.spin} size={16}/>:<Mail size={16}/>} {busy?'Sending…':'Send verification code'}</Button>)}</>}>
 <div className={skin.passwordIntro}><span>{done?<Check size={26}/>:<ShieldCheck size={26}/>}</span><div><h3>{done?'Your password is updated':sent?'Check your inbox':'Secure your account'}</h3><p>{done?'Use your new password the next time you sign in.':sent?'Enter your email code and choose a new password.':'We’ll send a verification code to your account email before you change your password.'}</p></div></div>
 {!done&&<div className={skin.emailRecipient}><Mail size={18}/><div><small>VERIFIED EMAIL</small><span>{user.email}</span></div><ShieldCheck size={17}/></div>}
 {sent&&!done&&<form id={id} className={skin.securityForm} onSubmit={update}><div role="group" aria-labelledby={`${id}-code-label`}><span id={`${id}-code-label`}>Verification code</span><div className={authStyles.v11AuthCode}>{code.map((digit,index)=><input key={index} ref={node=>{codeRefs.current[index]=node;}} required pattern="[0-9]" inputMode="numeric" autoComplete={index===0?'one-time-code':'off'} aria-label={`Verification digit ${index+1}`} autoFocus={index===0} readOnly={busy} value={digit} onFocus={e=>e.target.select()} onChange={e=>enterCode(index,e.target.value)} onPaste={e=>{e.preventDefault();enterCode(index,e.clipboardData.getData('text'));}} onKeyDown={e=>{if(e.key==='Backspace'){e.preventDefault();deleteCode(index);}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();codeRefs.current[Math.max(0,Math.min(3,index+(e.key==='ArrowLeft'?-1:1)))]?.focus();}}}/>)}</div></div><Field label="New password"><input required minLength={8} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)}/></Field><Field label="Confirm password"><input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></Field><button className={skin.historyLink} disabled={busy||cooldown>0} type="button" onClick={send}>{cooldown?`Resend code in ${cooldown}s`:'Resend code'}</button></form>}
 </Modal>;
}
export default function SecurityPage({user}){const router=useRouter();return <PasswordDialog user={user} onClose={()=>router.push('/v1-1/settings/profile')}/>;}
