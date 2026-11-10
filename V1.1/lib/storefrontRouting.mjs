export function selectedDestination(selection,{product,account=false,query={}}={}){
 if(selection?.version!=='v1-1')return null;
 product=product||(typeof query.product==='string'?query.product:undefined);
 const root='/v1-1/s/'+encodeURIComponent(selection.slug);
 const path=account?root+'/account':product?root+'/products/'+encodeURIComponent(product):root;
 const params=new URLSearchParams();for(const [key,value] of Object.entries(query))if(!['slug','product'].includes(key)&&typeof value==='string')params.set(key,value);
 return path+(params.size?'?'+params:'');
}
export async function resolveStorefront(context,{page=false,product=false,account=false}={}){
 const base=(process.env.NODE_ENV==='development'&&process.env.NEXT_PUBLIC_V11_API_URL?process.env.NEXT_PUBLIC_V11_API_URL:process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/,'');
 context.res.setHeader('Cache-Control','private, no-store');
 const response=await fetch(`${base}/v1-1/store-studio/resolve?${page?'pageSlug':'slug'}=${encodeURIComponent(context.params.slug)}`,{signal:AbortSignal.timeout(10000)});
 if(response.status===404)return null;
 if(!response.ok)throw Error('Could not resolve the active storefront');
 const selection=await response.json();const destination=selectedDestination(selection,{product:product?context.params.product:undefined,account,query:context.query});
 return destination?{redirect:{destination,permanent:false}}:null;
}
