import {NextResponse} from 'next/server';
const platform=new Set(['mytiklink.com','www.mytiklink.com','mytik.link','www.mytik.link','localhost','127.0.0.1']);
export async function proxy(req){
 const host=req.nextUrl.hostname.toLowerCase();
 if(platform.has(host)||host.endsWith('.vercel.app')){const headers=new Headers(req.headers);headers.delete('x-domain-host');headers.delete('x-domain-path');return NextResponse.next({request:{headers}});}
 if(process.env.CUSTOM_DOMAINS_ROUTING_ENABLED!=='true')return NextResponse.next();
 const path=req.nextUrl.pathname;
 if(path.startsWith('/_next/static/')||path.startsWith('/_next/image')||/^\/(?:images|fonts|category-covers)\//.test(path)||path==='/favicon.ico')return NextResponse.next();
 const unavailable=()=>new NextResponse('This website is temporarily unavailable.',{status:503,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain'}});
 if(!process.env.DOMAIN_ROUTING_SECRET||!process.env.DOMAIN_ROUTING_API_URL)return unavailable();
 try{
  const url=new URL('/api/v1-1/domains/resolve',process.env.DOMAIN_ROUTING_API_URL);url.searchParams.set('host',host);url.searchParams.set('path',path);
  const r=await fetch(url,{headers:{'x-domain-routing-key':process.env.DOMAIN_ROUTING_SECRET},signal:AbortSignal.timeout(6000),cache:'no-store'});
  if(!r.ok)return unavailable();const result=await r.json();
  if(result.status===404)return new NextResponse('This page is unavailable.',{status:404,headers:{'Cache-Control':'private, no-store'}});
  if(typeof result.robots==='string')return new NextResponse(result.robots,{status:200,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain; charset=utf-8'}});
  if(Array.isArray(result.sitemap)){const escape=value=>String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+result.sitemap.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>',{status:200,headers:{'Cache-Control':'private, no-store','Content-Type':'application/xml; charset=utf-8'}});}
  const target=req.nextUrl.clone();
  if(result.placeholder){target.pathname='/_sites/status';target.search='';target.searchParams.set('kind',result.placeholder);target.searchParams.set('domain',host);}
  else{if(!/^\/(?:p|r|s|v1-1\/s)\//.test(result.destination||''))return unavailable();target.pathname=result.destination;}
  const headers=new Headers(req.headers);headers.delete('x-domain-host');headers.set('x-domain-host',host);headers.set('x-domain-path',path);
  const response=NextResponse.rewrite(target,{request:{headers}});response.headers.set('Cache-Control','private, no-store');return response;
 }catch{return unavailable();}
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
