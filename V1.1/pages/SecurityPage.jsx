import {useEffect,useState,useId} from 'react';
import {ShieldCheck,Mail,LockKeyhole,LoaderCircle,Check} from 'lucide-react';
import {useRouter} from 'next/router';
import {apiRequest} from '../lib/api';
import {Button,Field,Modal} from '../components/UI';
import {notify} from '../components/Notifications';
import skin from './AccountSettings.module.css';
export function PasswordDialog({user,onClose}){
 const id=useId(),[sent,setSent]=useState(false),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[cooldown,setCooldown]=useState(0),[done,setDone]=useState(false);
 useEffect(()=>{if(!cooldown)return;const t=setTimeout(()=>setCooldown(v=>v-1),1000);return()=>clearTimeout(t);},[cooldown]);
 const send=async()=>{if(busy||cooldown)return;setBusy(true);try{await apiRequest('/auth/send-password-code',{method:'POST',body:'{}'});setSent(true);setCooldown(120);notify.success('Verification code sent');}catch(e){notify.error(e.message);}finally{setBusy(false);}};
 const update=async e=>{e.preventDefault();if(busy)return;if(password!==confirm){notify.error('Passwords do not match');return;}setBusy(true);try{await apiRequest('/auth/update-password-with-code',{method:'POST',body:JSON.stringify({code,password})});setPassword('');setConfirm('');setCode('');setDone(true);notify.success('Password updated');}catch(error){notify.error(error.message);}finally{setBusy(false);}};
 return <Modal tone="peach" title="Password & security" onClose={()=>!busy&&onClose()} footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>{done?'Close':'Cancel'}</Button>{!done&&(sent?<Button type="submit" form={id} disabled={busy}>{busy?<LoaderCircle className={skin.spin} size={16}/>:<LockKeyhole size={16}/>} {busy?'Updating…':'Update password'}</Button>:<Button disabled={busy||cooldown>0} onClick={send}>{busy?<LoaderCircle className={skin.spin} size={16}/>:<Mail size={16}/>} {busy?'Sending…':'Send verification code'}</Button>)}</>}>
 <div className={skin.passwordIntro}><span>{done?<Check size={26}/>:<ShieldCheck size={26}/>}</span><div><h3>{done?'Your password is updated':sent?'Check your inbox':'Secure your account'}</h3><p>{done?'Use your new password the next time you sign in.':sent?'Enter your email code and choose a new password.':'We’ll send a verification code to your account email before you change your password.'}</p></div></div>
 {!done&&<div className={skin.emailRecipient}><Mail size={18}/><div><small>VERIFIED EMAIL</small><span>{user.email}</span></div><ShieldCheck size={17}/></div>}
 {sent&&!done&&<form id={id} className={skin.securityForm} onSubmit={update}><Field label="Verification code"><input required minLength={4} maxLength={4} autoComplete="one-time-code" inputMode="numeric" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></Field><Field label="New password"><input required minLength={8} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)}/></Field><Field label="Confirm password"><input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></Field><button className={skin.historyLink} disabled={busy||cooldown>0} type="button" onClick={send}>{cooldown?`Resend code in ${cooldown}s`:'Resend code'}</button></form>}
 </Modal>;
}
export default function SecurityPage({user}){const router=useRouter();return <PasswordDialog user={user} onClose={()=>router.push('/v1-1/settings/profile')}/>;}
