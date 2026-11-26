export function interactionQueue(limit=100){
 let sender=null,pending=[];const seen=new Set();
 return {
  push(type,id){if(seen.has(id))return;seen.add(id);if(sender)sender(type,id);else if(pending.length<limit)pending.push([type,id]);},
  ready(send){sender=send;const events=pending;pending=[];for(const args of events)send(...args);},
  pause(){sender=null;},
 };
}
export function clickDestination(target,kind,base){
 const link=target?.closest?.('a[href],button[data-href],button[data-url],button[data-tracking-url]');
 if(!link||link.disabled||link.getAttribute('aria-disabled')==='true'||link.closest('[data-editor-mode]'))return null;
 const raw=(link.getAttribute('href')||link.getAttribute('data-href')||link.getAttribute('data-url')||link.getAttribute('data-tracking-url')||'').trim();
 if(!raw||raw.startsWith('#'))return null;
 try{const url=new URL(raw,base);if(!['http:','https:','mailto:','tel:','whatsapp:','tg:'].includes(url.protocol))return null;
  if(kind!=='page'&&!['mailto:','tel:','whatsapp:'].includes(url.protocol)&&!['wa.me','api.whatsapp.com'].includes(url.hostname))return null;
  return url.href;
 }catch{return null;}
}
