import {useEffect,useState} from 'react';
import Link from 'next/link';
import {request} from './api';
import {allowed} from './config';
import {recordHref} from './RecordRelations';
export default function SupportAccountLink({conversationId}){
 const [account,setAccount]=useState(null);
 useEffect(()=>{const c=new AbortController();setAccount(null);request('/control/me',{signal:c.signal}).then(({actor})=>allowed(actor,'users.view')&&allowed(actor,'support.view')?request(`/control/support/${conversationId}/account`,{signal:c.signal}):null).then(data=>setAccount(data?.account||null)).catch(()=>{});return()=>c.abort();},[conversationId]);
 return account?<p><Link href={recordHref('users',account._id)}>View registered account: {account.name||account.email} →</Link><small style={{display:'block'}}>Matched by exact email address</small></p>:null;
}
