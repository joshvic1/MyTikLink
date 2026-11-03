import {useEffect,useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {Sparkles,Check,ArrowUpRight} from 'lucide-react';
import {useV11Session} from '../lib/useV11Session';
import {apiRequest} from '../lib/api';
import {SubscriptionModal} from '../components/SubscriptionModal';
import s from '../components/RedirectLimit.module.css';
export default function RedirectUpgradePage(){
 const router=useRouter();
 const session=useV11Session({enabled:router.isReady});
 const slug=typeof router.query.link==='string'?router.query.link:'';
 const [context,setContext]=useState(null),[error,setError]=useState(''),[modal,setModal]=useState(null),[checking,setChecking]=useState(false);
 const load=async(open=false)=>{setChecking(true);setError('');try{const data=await apiRequest(`/v1-1/links/upgrade-context/${encodeURIComponent(slug)}`);setContext(data);if(open&&data.status==='Limit reached')setModal({mode:'upgrade',preselected:'pro',sourceRedirectSlug:slug});}catch(e){setError(e.message);}finally{setChecking(false);}};
 useEffect(()=>{if(session.user&&slug)void load(true);},[session.user?._id,slug]);
 const active=context?.status==='Active';
 const open=()=>setModal({mode:'upgrade',preselected:'pro',sourceRedirectSlug:slug});
 return <main className={s.screen}><Head><title>Restore your link · MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head><div><section className={s.card}><div className={s.top}><span className={s.icon}>{active?<Check size={27}/>:<Sparkles size={27}/>}</span><small>YOUR REDIRECT LINK</small><h1>{active?'Your link is ready':'Keep the connection going'}</h1></div><div className={s.body}>{session.loading||checking?<p role="status">Checking your link…</p>:error||session.error?<><p role="alert">{error||session.error.message}</p><Link href="/v1-1/links">Back to your links</Link></>:!slug?<p>No link was specified.</p>:context?<><p>{context.title}</p>{active?<Link href={`/v1-1/r/${encodeURIComponent(slug)}`}>Continue to your link <ArrowUpRight size={16}/></Link>:context.status==='Limit reached'?<><p>Choose a plan to refresh your allowance and welcome more visitors.</p><button onClick={open}>Choose your upgrade <ArrowUpRight size={16}/></button></>:<p>Your account is ready, but this link is inactive or unavailable. Manage its status from your links page.</p>}<button className={s.secondary} disabled={checking} onClick={()=>load(false)}>Already paid? Check status</button><p className={s.note}>If confirmation is delayed, we’ll recheck your payment automatically. You do not need to pay again.</p><Link className={s.secondary} href="/v1-1/links">Manage your links</Link></>:<p>Opening your account…</p>}</div></section><div className={s.brand}>MyTikLink · Secure checkout with Paystack</div></div>{modal&&<SubscriptionModal state={{...modal,onSuccess:()=>load(false)}} user={session.user} refreshSession={session.refresh} close={()=>setModal(null)} update={setModal}/>}</main>;
}
