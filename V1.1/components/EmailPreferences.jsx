import {useEffect,useState} from 'react';
import {apiRequest} from '../lib/api';
import {notify} from './Notifications';
export default function EmailPreferences(){
 const [enabled,setEnabled]=useState(false),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;apiRequest('/email/preferences').then(s=>{if(active){setEnabled(s.marketing);setReady(true);}}).catch(()=>{if(active)setError('Could not load email preferences. Refresh to try again.');});return()=>{active=false};},[]);
 const change=async value=>{setBusy(true);try{await apiRequest('/email/preferences',{method:'PUT',body:JSON.stringify({marketing:value})});setEnabled(value);notify.success('Message preference saved');}catch(e){notify.error(e.message);}finally{setBusy(false)}};
 return <div><label style={{display:'flex',alignItems:'center',gap:12,fontSize:12,lineHeight:1.6}}><input type="checkbox" checked={enabled} disabled={!ready||busy} onChange={e=>change(e.target.checked)}/>Personalized product tips, offers and updates</label><p style={{fontSize:11,color:'#8b8293'}}>Choose whether to receive marketing guidance by email and WhatsApp. Welcome messages, security codes and essential account updates will continue.</p>{error&&<p role="alert">{error}</p>}</div>;
}
