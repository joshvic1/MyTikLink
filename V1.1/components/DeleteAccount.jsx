import {useState} from 'react';
import {Trash2,ShieldCheck} from 'lucide-react';
import {Modal,Button} from './UI';
import {apiRequest,invalidateReads} from '../lib/api';
import css from './DeleteAccount.module.css';
export default function DeleteAccount({user}){
 const [open,setOpen]=useState(false),[confirmation,setConfirmation]=useState(''),[name,setName]=useState(''),[challenge,setChallenge]=useState(null),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const close=()=>{if(busy)return;setOpen(false);setError('');setCode('');setConfirmation('');setName('');setChallenge(null);};
 async function submit(event){event.preventDefault();setBusy(true);setError('');try{
 if(!challenge){const result=await apiRequest('/v1-1/account-deletion/request',{method:'POST',body:JSON.stringify({confirmation,name})});setChallenge(result.challengeId);}
 else{await apiRequest('/v1-1/account-deletion/confirm',{method:'POST',body:JSON.stringify({challengeId:challenge,code})});invalidateReads();localStorage.removeItem('token');localStorage.removeItem('user');window.location.replace('/v1-1/login?accountDeleted=1');}
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 return <><section className={css.danger}><span className={css.icon}><Trash2 size={22}/></span><div><small>DANGER ZONE</small><h3>Delete your MyTikLink account</h3><p>Remove your account and business content permanently. This cannot be undone.</p><button className={css.delete} onClick={()=>setOpen(true)}>Delete account</button></div></section>
 {open&&<Modal tone="red" className={css.dialog} backdropClassName={css.backdrop} showConfirmationIntro={false} headerLeading={<span className={css.headerIcon}><Trash2 size={20}/></span>} title={challenge?'Confirm account deletion':'Delete your MyTikLink account'} onClose={close}><form className={css.form} onSubmit={submit}>
 <div className={css.notice}><ShieldCheck size={20}/><p>{challenge?'Enter the six-digit code sent to your email to confirm deletion.':'Confirm your details, then verify by email. This cannot be undone.'}</p></div>
 <p className={css.explanation}>Your pages, links, store and products will be removed. Resolve active billing and pending paid orders first. Required transaction records are retained.</p>
 {challenge?<><label>Verification code<input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} required/></label><p className={css.explanation}>Expires in 10 minutes · 5 attempts.</p><button type="button" className={css.link} disabled={busy} onClick={()=>{setChallenge(null);setCode('');setError('');}}>Request a new code</button></>:<><label>Type DELETE<input autoFocus autoComplete="off" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/></label><label>Full account name: <strong>{user.name}</strong><input autoComplete="off" value={name} onChange={e=>setName(e.target.value)} required/></label></>}
 {error&&<p className={css.error} role="alert">{error}</p>}<div className={css.actions}><Button type="button" variant="secondary" disabled={busy} onClick={close}>Keep my account</Button><button className={css.delete} type="submit" disabled={busy||(challenge?code.length!==6:confirmation!=='DELETE'||name.trim()!==user.name?.trim())}>{busy?'Please wait…':challenge?'Permanently delete account':'Send verification code'}</button></div></form></Modal>}
 </>;
}
