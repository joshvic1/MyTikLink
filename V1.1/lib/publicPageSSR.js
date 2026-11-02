export async function loadPublicLandingPage(context,versioned=false){
 const base=(versioned&&process.env.NODE_ENV==='development'&&process.env.NEXT_PUBLIC_V11_API_URL?process.env.NEXT_PUBLIC_V11_API_URL:process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/,'');
 context.res.setHeader('Cache-Control','private, no-store');
 try{const response=await fetch(`${base}/${versioned?'v1-1/':''}pages/public/${encodeURIComponent(context.params.slug)}`,{signal:AbortSignal.timeout(10000)});const data=await response.json();
 if(data.code==='PAGE_INACTIVE')return {props:{slug:context.params.slug,initialPage:null,initialInactive:data.pageId}};
 if(response.status===403)return {redirect:{destination:'/expired',permanent:false}};
 if(response.status===404)return {notFound:true};
 if(!response.ok)throw Error('Page unavailable');
 return {props:{slug:context.params.slug,initialPage:data,initialInactive:null}};
 }catch{context.res.statusCode=503;return {props:{slug:context.params.slug,initialPage:null,initialInactive:null,initialError:true}};}
}
