export function mergeMessages(current,incoming){
 const map=new Map(current.map(m=>[m._id,m]));
 for(const message of incoming){if(message.requestId&&!message.optimistic){for(const [id,row] of map){if(row.optimistic&&row.requestId===message.requestId)map.delete(id);}}const old=map.get(message._id),merged={...old,...message};const rank={sent:0,failed:1,delivered:2,read:3};if(old&&['delivered','read'].includes(old.deliveryEvent)&&(rank[old.deliveryEvent]>(rank[message.deliveryEvent]??-1))){merged.deliveryEvent=old.deliveryEvent;merged.status='sent';}map.set(message._id,merged);}
 return [...map.values()].sort((a,b)=>new Date(a.sentAt)-new Date(b.sentAt)||a._id.localeCompare(b._id));
}
export function deliveryStatus(message){
 if(['read','delivered'].includes(message.deliveryEvent))return message.deliveryEvent;
 return ['failed','unknown','sending'].includes(message.status)?message.status:message.deliveryEvent||message.status||'sent';
}

export function chatDate(value,now=new Date()){
 const date=new Date(value);if(Number.isNaN(date.getTime()))return '';
 if(date.toDateString()===now.toDateString())return 'Today';
 const yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);
 if(date.toDateString()===yesterday.toDateString())return 'Yesterday';
 const day=date.getDate(),suffix=day%100>=11&&day%100<=13?'th':({1:'st',2:'nd',3:'rd'}[day%10]||'th');
 const month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'][date.getMonth()];
 return `${day}${suffix} ${month} ${date.getFullYear()}`;
}
export function visibleMessageText(message){
 if(message.attachments?.some(a=>/^(image|audio|video)\//.test(a.mimeType||''))&&/^\[(?:audio|image|video)(?: message)?\]$/i.test((message.text||'').trim()))return '';
 return message.text;
}
