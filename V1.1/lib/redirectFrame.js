export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function redirectFrame(data) {
 const template=data.template;if(!template?.html)return '';
 const values={title:data.title,deeplink:data.deepLink,fallback:data.fallback,redirectDelay:data.redirectDelay,showPoweredBy:''};
 const html=template.html.replace(/{{(title|deeplink|fallback|redirectDelay|showPoweredBy)}}/g,(_,key)=>escapeHtml(values[key]));
 // The empty iframe sandbox and CSP are both required. Scripts, forms,
 // popups, navigation, same-origin access and network connections are disabled.
 return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; font-src https:; script-src 'none'; form-action 'none'; base-uri 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${String(template.css||'').replace(/<\/style/gi,'')}</style></head><body>${html}</body></html>`;
}
export function visitIdentity(storage,slug,random,now=Date.now()) {
 const key=`v11-redirect-visit:${slug}`;
 try {const stored=JSON.parse(storage.getItem(key)||'null');if(stored?.id&&now-stored.at<60000)return stored.id;}catch{}
 const id=random();try{storage.setItem(key,JSON.stringify({id,at:now}));}catch{}return id;
}
