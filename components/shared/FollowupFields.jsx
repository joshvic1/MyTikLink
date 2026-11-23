import {useState} from 'react';
import css from './FollowupFields.module.css';
export const localFollowupTime=value=>value?new Date(+new Date(value)+3600000).toISOString().slice(0,16):'';
export const followupUTC=value=>value?new Date(value+':00+01:00').toISOString():null;
export default function FollowupFields({due,note='',channel='WhatsApp',channels=['WhatsApp','Call','Email'],required=false}){
 const initial=localFollowupTime(due),[day,setDay]=useState(initial.slice(0,10)),[time,setTime]=useState(initial.slice(11)),[method,setMethod]=useState(channel);
 return <div className={css.fields}><div className={css.dates}><label>Follow-up date<input name="followupDate" type="date" value={day} min={localFollowupTime(new Date()).slice(0,10)} required={required} onChange={e=>setDay(e.target.value)}/></label><label>Time · WAT<input name="followupTime" type="time" value={time} required={required||!!day} onChange={e=>setTime(e.target.value)}/></label></div><input type="hidden" name="due" value={day&&time?day+'T'+time:''}/><fieldset><legend>Follow-up channel</legend>{channels.map(c=><label key={c}><input type="radio" name="channel" value={c} checked={method===c} onChange={()=>setMethod(c)}/><span>{c==='Call'?'Phone call':c}</span></label>)}</fieldset><label>Follow-up note<textarea name="text" rows={3} defaultValue={note} required={required||!!day} minLength={3} maxLength={4000} placeholder="What should you remember when following up?"/></label><small>Times use Africa/Lagos (WAT). This note stays internal.</small></div>;
}
