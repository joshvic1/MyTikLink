import dynamic from 'next/dynamic';
const HomeServiceBooking=dynamic(()=>import('./HomeServiceBooking'),{ssr:false});
import {priceRange} from './servicePresentation.mjs';
import {useEffect,useState} from 'react';
import {CalendarDays} from 'lucide-react';
import {serviceApi,servicesEnabled} from './shared';
import css from './ServiceCatalogue.module.css';
export const serviceHref=(store,service)=>`/s/${encodeURIComponent(store)}/services/${encodeURIComponent(service)}`;
export default function ServiceCatalogue({slug,renderItems,onCount,showTitle=true,design}){
 const [selected,setSelected]=useState(null);
 const [data,setData]=useState(null),[page,setPage]=useState(1),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{if(!servicesEnabled||!slug)return;const c=new AbortController();setLoading(true);setError('');serviceApi(`/public/${encodeURIComponent(slug)}?page=${page}`,{token:null,signal:c.signal}).then(d=>{setData(d);onCount?.(d.services.length);}).catch(e=>{if(!c.signal.aborted)setError('Could not load services. Please try again.');}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[slug,page,retry]);
 if(!servicesEnabled)return null;
 return <div id="store-services" className={css.catalogue}>{showTitle&&<h2>Services</h2>}{loading?<div className={css.loading} role="status" aria-label="Loading services"><span/><span/></div>:error?<div className={css.empty} role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Try again</button></div>:data?.services.length?renderItems(data.services.map(s=>({...s,isService:true,price:priceRange(s).min/100,onBook:()=>setSelected(s)}))):<div className={css.empty}><span className={css.icon}><CalendarDays size={27}/></span><h3>No services published yet</h3><p>Services will appear here once they are added and published.</p></div>}{!loading&&!error&&(page>1||data?.hasMore)&&<nav className={css.pagination} aria-label="Service pages"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page}</span><button disabled={!data?.hasMore} onClick={()=>setPage(p=>p+1)}>Next</button></nav>}{selected&&<HomeServiceBooking key={`${slug}:${selected.slug}`} slug={slug} serviceSlug={selected.slug} service={selected} design={design} onClose={()=>setSelected(null)}/>}</div>;
}
