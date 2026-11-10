const destinations=new Set(['/v1-1/dashboard','/v1-1/pages','/v1-1/pages/builder','/v1-1/links','/v1-1/store','/v1-1/store/products','/v1-1/store/orders','/v1-1/store/settings','/v1-1/store/design','/v1-1/settings/profile','/v1-1/settings/tracking','/v1-1/settings/billing','/v1-1/pages/editor','/v1-1/pages/create','/v1-1/analytics','/v1-1/insights','/v1-1/affiliate','/v1-1/help']);
const legacyDestinations=new Set(['/dashboard','/dashboard/settings','/dashboard/links','/dashboard/page','/dashboard/analytics','/dashboard/tiktok-pixel','/store','/store/settings','/checkout','/payment-history','/verify-payment']);
export function safeAuthReturn(value,fallback='/v1-1/dashboard'){
 const candidate=String(value||'');
 if(!candidate.startsWith('/')||candidate.startsWith('//')||/[\\\x00-\x1f]/.test(candidate))return fallback;
 try{const url=new URL(candidate,'https://mytiklink.com');if(url.origin!=='https://mytiklink.com')return fallback;
 if(url.pathname==='/v1-1/links/upgrade'&&url.searchParams.get('link'))return '/v1-1/links/upgrade?link='+encodeURIComponent(url.searchParams.get('link'));
 if(/^\/(?:v1-1\/)?s\/[a-zA-Z0-9-]+\/account$/.test(url.pathname))return url.pathname+url.search+url.hash;
 if(destinations.has(url.pathname)||legacyDestinations.has(url.pathname))return url.pathname+url.search+url.hash;
 }catch{}
 return fallback;
}

export function dashboardDestination(preference,candidate){
 const intended=safeAuthReturn(candidate,'');
 return intended&&!['/dashboard','/v1-1/dashboard'].includes(intended)?intended:preference.version==='v1-1'?'/v1-1/dashboard':'/dashboard';
}
