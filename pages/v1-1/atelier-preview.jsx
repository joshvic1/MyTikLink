import {useEffect,useState} from 'react';
import Head from 'next/head';
import {apiRequest} from '../../V1.1/lib/api';
import {defaultDesign,changeTheme} from '../../V1.1/store/design';
import StoreRenderer from '../../V1.1/store/StoreRenderer';
export default function AtelierPreview(){
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;apiRequest('/v1-1/store-studio').then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 const design=data?(data.design?.theme==='atelier'?data.design:changeTheme(data.design||defaultDesign('atelier'),'atelier')):null;
 return <><Head><title>Your Atelier storefront preview | MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head><div style={{padding:'10px 18px',background:'#edf3f0',color:'#263f35',fontSize:13}}>Private Atelier preview · Your saved store details · Nothing is published <a href="/v1-1/store/design" style={{marginLeft:16,textDecoration:'underline'}}>Open store designer</a></div>{error?<p role="alert" style={{padding:24}}>{error}</p>:!data?<p role="status" style={{padding:24}}>Loading your store…</p>:<StoreRenderer design={design} store={{...(data.store||data.setup),...Object.fromEntries(Object.entries(data.config?.identity||{}).filter(([,v])=>v!==""))}} config={data.config} collections={data.collections||[]} reviews={data.reviews||[]} products={data.products} preview/>}</>;
}
