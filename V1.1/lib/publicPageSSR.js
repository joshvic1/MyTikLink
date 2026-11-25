import {domainOrigin} from '../domains/publicUrls.mjs';
import {resolveStorefront} from './storefrontRouting.mjs';
export async function loadPublicLandingPage(context,versioned=false){
 const base=(versioned&&process.env.NODE_ENV==='development'&&process.env.NEXT_PUBLIC_V11_API_URL?process.env.NEXT_PUBLIC_V11_API_URL:process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/,'');
 context.res.setHeader('Cache-Control','private, no-store');
 try{const [storefront,response]=await Promise.all([resolveStorefront(context,{page:true}),fetch(`${base}/${versioned?'v1-1/':''}pages/public/${encodeURIComponent(context.params.slug)}`,{signal:AbortSignal.timeout(10000)})]);if(storefront)return storefront;const data=await response.json();
 if(data.code==='PAGE_INACTIVE')return {props:{slug:context.params.slug,initialPage:null,initialInactive:data.pageId}};
 if(response.status===403)return {redirect:{destination:'/expired',permanent:false}};
 if(response.status===404)return {notFound:true};
 if(!response.ok)throw Error('Page unavailable');
 const origin=domainOrigin(context.req?.headers?.['x-domain-host']),path=context.req?.headers?.['x-domain-path'];
 return {props:{slug:context.params.slug,initialPage:data,initialInactive:null,domainCanonical:origin&&typeof path==='string'&&path.startsWith('/')?origin+path:null}};
 }catch{context.res.statusCode=503;return {props:{slug:context.params.slug,initialPage:null,initialInactive:null,initialError:true}};}
}
