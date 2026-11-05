const destinations=new Set(['/v1-1/dashboard','/v1-1/pages','/v1-1/pages/builder','/v1-1/links','/v1-1/store','/v1-1/store/products','/v1-1/store/orders','/v1-1/store/settings','/v1-1/store/design','/v1-1/settings/profile','/v1-1/settings/tracking']);
export function safeAuthReturn(value){
 const candidate=String(value||'');
 if(!candidate.startsWith('/v1-1/')||/[\\\x00-\x1f]/.test(candidate))return '/v1-1/dashboard';
 try{const url=new URL(candidate,'https://mytiklink.com');if(url.origin!=='https://mytiklink.com')return '/v1-1/dashboard';
 if(url.pathname==='/v1-1/links/upgrade'&&url.searchParams.get('link'))return '/v1-1/links/upgrade?link='+encodeURIComponent(url.searchParams.get('link'));
 if(destinations.has(url.pathname))return url.pathname+url.search+url.hash;
 }catch{}
 return '/v1-1/dashboard';
}
