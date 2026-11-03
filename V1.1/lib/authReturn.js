export function safeAuthReturn(value){
 const candidate=String(value||'');
 if(/^\/v1-1\/pages(?:\?|$)/.test(candidate))return candidate;
 try{const url=new URL(candidate,'https://mytiklink.com');if(candidate.startsWith('/v1-1/links/upgrade?')&&url.origin==='https://mytiklink.com'&&url.pathname==='/v1-1/links/upgrade'&&url.searchParams.get('link'))return '/v1-1/links/upgrade?link='+encodeURIComponent(url.searchParams.get('link'));}catch{}
 return '/v1-1/dashboard';
}
