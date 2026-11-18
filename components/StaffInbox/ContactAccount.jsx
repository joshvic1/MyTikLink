import {useEffect,useRef,useState} from 'react';
export default function ContactAccount({id,api}){
 const container=useRef(),[data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,started=false;setData(null);setError('');
  const load=()=>{if(started)return;started=true;api('conversations/'+id+'/account').then(d=>{if(active)setData(d.account)}).catch(e=>{if(active)setError(e.message)});};
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();observer.disconnect();}});
  if(observer&&container.current)observer.observe(container.current);else load();
  return()=>{active=false;observer?.disconnect()};
 },[id,api]);
 return <div ref={container}>{error?<p>{error}</p>:!data?<p>Account details load when opened.</p>:<dl><dt>Account name</dt><dd>{data.name}</dd><dt>Email</dt><dd>{data.email}</dd><dt>Plan</dt><dd>{data.plan}</dd><dt>Landing pages</dt><dd>{data.pageCount}</dd><dt>Store</dt><dd>{data.hasStore?data.storeName:'No storefront'}</dd><dt>Products</dt><dd>{data.productCount}</dd></dl>}</div>;
}
