import {CalendarClock,Bell,CheckCircle2,CalendarDays,XCircle} from 'lucide-react';
import css from './FollowupActivity.module.css';
const labels={scheduled:'Follow-up scheduled',due:'Follow-up due',rescheduled:'Follow-up rescheduled',completed:'Follow-up completed',cancelled:'Follow-up cancelled'};
const icons={scheduled:CalendarClock,due:Bell,rescheduled:CalendarDays,completed:CheckCircle2,cancelled:XCircle};
export const followupStamp=value=>value?new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(value))+' WAT':'';
export default function FollowupActivity({message,messages=[]}){
 const a=message.followupActivity;
 if(!a)return <aside className={css.activity}><CalendarClock size={15}/><div><b>Follow-up reminder</b><p>{message.text}</p><time>{followupStamp(message.sentAt)}</time></div></aside>;
 const latest=messages.filter(m=>m.followupActivity?.followupId===a.followupId&&m.followupActivity?.source===a.source).at(-1)?.followupActivity;
 const current=latest&&['completed','cancelled'].includes(latest.event)?latest.event:latest&&latest.version>a.version?'rescheduled':latest?.event==='due'?'due':a.currentStatus||(new Date(a.due)<=new Date()?'due':'upcoming');
 const Icon=icons[a.event]||CalendarClock;
 return <aside className={css.activity} data-status={current} id={'message-'+message._id}><Icon size={16}/><div className={css.content}><header><b>{labels[a.event]||'Follow-up activity'}</b><span className={css.status}>{current[0].toUpperCase()+current.slice(1)}</span></header><div className={css.meta}>{a.event==='due'?`Scheduled by ${a.creator?.name||'Team'}`:a.actor?.name||message.authorName} · {a.channel==='Call'?'Phone call':a.channel}</div>{a.due&&<div className={css.due}>Scheduled for {followupStamp(a.due)}</div>}<p>{a.note}</p>{(a.previousDue||a.completionNote)&&<details><summary>More details</summary>{a.previousDue&&<p>Previous time: {followupStamp(a.previousDue)}</p>}{a.completionNote&&<p>{a.completionNote}</p>}</details>}<time dateTime={message.sentAt}>{followupStamp(message.sentAt)}</time></div></aside>;
}
