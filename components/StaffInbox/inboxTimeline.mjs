export function mergeMessages(current,incoming){
 const map=new Map(current.map(m=>[m._id,m]));
 for(const message of incoming){const old=map.get(message._id),merged={...old,...message};const rank={sent:0,failed:1,delivered:2,read:3};if(old&&['delivered','read'].includes(old.deliveryEvent)&&(rank[old.deliveryEvent]>(rank[message.deliveryEvent]??-1))){merged.deliveryEvent=old.deliveryEvent;merged.status='sent';}map.set(message._id,merged);}
 return [...map.values()].sort((a,b)=>new Date(a.sentAt)-new Date(b.sentAt)||a._id.localeCompare(b._id));
}
export function deliveryStatus(message){
 if(['read','delivered'].includes(message.deliveryEvent))return message.deliveryEvent;
 return ['failed','unknown','sending'].includes(message.status)?message.status:message.deliveryEvent||message.status||'sent';
}
