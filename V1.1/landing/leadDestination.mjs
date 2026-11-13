// Redirect only after a confirmed lead save. Never use the visitor's phone.
export function safeLeadDestination(value){
 const raw=typeof value==='string'?value.trim():'';
 if(!/^https?:\/\//i.test(raw)||/[\x00-\x20\\]/.test(raw))return '';
 try{const u=new URL(raw);return u.hostname&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
export function leadDestination(page={}){
 const theme=page.customContent?.find?.(s=>s?.type==='phase-one-theme')||{};
 for(const url of [theme.redirectUrl,page.redirectUrl]){const valid=safeLeadDestination(url);if(valid)return valid;}
 for(const phone of [theme.ownerWhatsapp,theme.personalization?.whatsappNumber,page.user?.whatsappNumber]){
  if(typeof phone!=='string'||!/^\+?[\d () .-]+$/.test(phone.trim()))continue;
  const digits=phone.replace(/\D/g,'').replace(/^00/,'');
  if(/^[1-9]\d{7,14}$/.test(digits))return `https://wa.me/${digits}`;
 }
 return '';
}
