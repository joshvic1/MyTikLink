import {useEffect,useState} from 'react';
import {Bot,UserRound} from 'lucide-react';
import s from './AiControls.module.css';
export default function AiControls({conversation,api,canControl,revision}){
 const [state,setState]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let alive=true;const load=()=>api('conversations/'+conversation._id+'/ai').then(d=>{if(alive){setState(d.ai);setError('')}}).catch(()=>{if(alive)setError('Could not check AI status')});load();const timer=setInterval(load,5000);return()=>{alive=false;clearInterval(timer)}},[conversation._id,revision]);
 async function change(){setBusy(true);setError('');try{const d=await api('conversations/'+conversation._id+'/ai',{mode:state.mode==='auto'?'manual':'auto'},'PATCH');setState(d.ai)}catch(e){setError(e.message)}finally{setBusy(false)}}
 if(!state)return error?<div className={s.bar} role="status">{error}</div>:null;
 const auto=state.mode==='auto'&&state.configured;
 return <div className={s.bar}><span>{auto?<Bot size={15}/>:<UserRound size={15}/>}<span><b>{auto?'AI replies are on':'Human handling'}</b>{(!state.configured||state.reason)&&<small>{!state.configured?'AI connection needs attention':state.reason}</small>}</span></span>{canControl&&<button onClick={change} disabled={busy||(!state.configured&&state.mode!=='auto')}>{busy?'Updating…':state.mode==='auto'?'Take over':'Return to AI'}</button>}{error&&<small role="alert">{error}</small>}</div>
}
