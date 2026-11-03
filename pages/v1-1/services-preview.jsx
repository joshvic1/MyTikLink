import {useEffect,useState} from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {getCategoryCover,coverSources} from '../../V1.1/media/categoryImages';
import {apiRequest} from '../../V1.1/lib/api';
import {defaultDesign,changeTheme} from '../../V1.1/store/design';
import StoreRenderer from '../../V1.1/store/StoreRenderer';
export default function ServicesPreview(){
 const router=useRouter();
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;if(!router.isReady)return;if(router.query.example==='wellness'){
 const image=coverSources(getCategoryCover('beauty-cosmetics/spas'))?.src;const beauty=coverSources(getCategoryCover('beauty-cosmetics/beauty-salons'))?.src;
 const design=defaultDesign('atelier-services');design.sections.find(s=>s.type==='hero').image=image;
 setData({design,store:{name:'Still & Well',slug:'demo',currency:'NGN',description:'Care that fits into your day.',productCategories:[]},products:[{_id:'demo-care',slug:'rest-and-reset',name:'Rest & reset',description:'A calming treatment for the days you need to slow down and feel like yourself again.',price:25000,images:[image]},{_id:'demo-glow',slug:'skin-refresh',name:'A fresh look, just for you',description:'A wash, care and styling session tailored to your hair. Tell us the look you have in mind.',price:18000,images:[beauty]}],config:{identity:{showFloatingWhatsapp:false}}});return;}apiRequest('/v1-1/store-studio').then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[router.isReady,router.query.example]);
 const design=data?(data.design?.theme==='atelier-services'?data.design:changeTheme(data.design||defaultDesign('atelier-services'),'atelier-services')):null;
 return <><Head><title>Your Atelier Services storefront preview | MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head><div style={{padding:'10px 18px',background:'#edf3f0',color:'#263f35',fontSize:13}}>{router.query.example==='wellness'?'Wellness demo · Sample services and prices':'Private Atelier Services preview · Your saved details'} · Nothing is published <a href="/v1-1/store/design" style={{marginLeft:16,textDecoration:'underline'}}>Open store designer</a></div>{error?<p role="alert" style={{padding:24}}>{error}</p>:!data?<p role="status" style={{padding:24}}>Loading your store…</p>:<StoreRenderer design={design} store={{...(data.store||data.setup),...Object.fromEntries(Object.entries(data.config?.identity||{}).filter(([,v])=>v!==""))}} config={data.config} collections={data.collections||[]} reviews={data.reviews||[]} products={data.products} preview/>}</>;
}
