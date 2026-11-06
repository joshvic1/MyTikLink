import {useState} from 'react';
import {useRouter} from 'next/router';
import {ShieldCheck,ArrowRight} from 'lucide-react';
import {request} from '@/components/control/api';
import {entries,allowed,href} from '@/components/control/config';
import s from '@/components/control/Control.module.css';
export default function AdminLogin(){
 const router=useRouter(),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function login(e){e.preventDefault();setBusy(true);setError('');try{
  await request('/staff/login',{method:'POST',body:{email,password}});
  localStorage.removeItem('admin_token');
  const {actor}=await request('/control/session',{method:'POST',body:{}});
  router.replace(href(entries.find(entry=>allowed(actor,entry[3]))?.[0]||'overview'));
 }catch(e){localStorage.removeItem('admin_token');setError(e.message);}finally{setBusy(false);}}
 return <div className={s.app}><div className={s.login}><section className={s.loginStory}><div className={s.brand}><span className={s.brandMark}>m<span>↗</span></span><div>mytiklink<span>CONTROL CENTER</span></div></div><span className={s.eyebrow}>A CLEARER VIEW. BETTER DECISIONS.</span><h1>The whole platform.<br/>One focused workspace.</h1><p>Understand your customers, oversee your products and give your team the access they need.</p></section><section className={s.loginForm}><form onSubmit={login}><ShieldCheck size={28}/><h2>Welcome to administration</h2><p>Sign in with your authorized Super Admin or Inbox staff credentials.</p>{error&&<div className={s.error} role="alert">{error}</div>}<label>Email address<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className={s.primary} disabled={busy}>{busy?'Verifying access…':'Sign in securely'}<ArrowRight size={16}/></button><small>Staff access must be explicitly granted by a Super Admin. Inbox membership alone does not provide access.</small></form></section></div></div>;
}
