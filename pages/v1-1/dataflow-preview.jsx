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
 useEffect(()=>{let active=true;if(!router.isReady)return;if(router.query.example==='creator'){
 const image=coverSources(getCategoryCover('technology-software/data-analytics'))?.src;const beauty=coverSources(getCategoryCover('science-research/data-collection'))?.src;
 const design=defaultDesign('dataflow');
 setData({design,store:{name:'Clearpoint Data',slug:'demo',categoryId:'technology-software/data-analytics',currency:'NGN',description:'Useful tools for your next big idea.',productCategories:[]},products:[{_id:'demo-care',slug:'rest-and-reset',name:'Data cleanup & organisation',description:'Get your spreadsheets and records organised so they are easier to use.',productType:'service',price:85000,images:[image]},{_id:'demo-glow',slug:'skin-refresh',name:'Reports & dashboards',description:'Turn your numbers into a clear picture of what is happening.',productType:'service',price:150000,images:[beauty]}],config:{identity:{showFloatingWhatsapp:false}}});return;}apiRequest('/v1-1/store-studio').then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[router.isReady,router.query.example]);
 const design=data?(data.design?.theme==='dataflow'?data.design:changeTheme(data.design||defaultDesign('dataflow'),'dataflow')):null;
 return <><Head><title>Your Dataflow storefront preview | MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head><div style={{padding:'10px 18px',background:'#edf3f0',color:'#263f35',fontSize:13}}>{router.query.example==='creator'?'Data services demo · Sample resources and prices':'Private Dataflow preview · Your saved details'} · Nothing is published <a href="/v1-1/store/design" style={{marginLeft:16,textDecoration:'underline'}}>Open store designer</a></div>{error?<p role="alert" style={{padding:24}}>{error}</p>:!data?<p role="status" style={{padding:24}}>Loading your store…</p>:<StoreRenderer design={design} store={{...(data.store||data.setup),...Object.fromEntries(Object.entries(data.config?.identity||{}).filter(([,v])=>v!==""))}} config={data.config} collections={data.collections||[]} reviews={data.reviews||[]} products={data.products} preview/>}</>;
}
