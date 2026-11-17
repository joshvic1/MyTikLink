import Head from 'next/head';
import {useState} from 'react';
import {defaultDesign,themes} from '../../V1.1/store/design';
import {getCategoryCover,coverSources} from '../../V1.1/media/categoryImages';
import StoreRenderer from '../../V1.1/store/StoreRenderer';
import {Modal,Button} from '../../V1.1/components/UI';
export default function StoreTemplatePreview({theme}){
 const [product,setProduct]=useState(null);
 const definition=themes[theme],focus=definition.businessFocus?.[0]||'physical_products';
 const services=focus.endsWith('services'),digital=focus.startsWith('digital');
 const category=services?(digital?'technology-software/data-analytics':'hair-grooming/wigs'):(digital?'technology-software/data-analytics':'fashion-clothing/womenswear');
 const image=coverSources(getCategoryCover(category,{allowParent:true}))?.src||'/v1-1/store-template-covers/'+theme+'.webp';
 const design=defaultDesign(theme);
 design.sections=design.sections.map(section=>section.type==='hero'?{...section,image}:section);
 const products=(services?['Signature consultation','Premium service package','Personalised session','Complete care package']:digital?['The essential guide','Creative toolkit','Complete resource bundle','Getting started workbook']:['The signature collection','Everyday favourites','The weekend edit','New season essentials']).map((name,i)=>({_id:`sample-${i}`,slug:`sample-${i}`,name,price:[15000,24000,38000,12000][i],images:[image],description:'Sample content to help you explore this template. Your own products, photos and descriptions will appear here.',isDemo:true,featured:i<2}));
 return <><Head><title>{definition.name} template preview | MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head><header style={{padding:'12px 20px',background:'#f5efff',color:'#5e358a',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,fontSize:13}}><strong>{definition.name} · Template preview</strong><span>Sample content · Return to your original tab to select</span></header><div onClickCapture={event=>{const link=event.target.closest('a');if(link&&!link.getAttribute('href')?.startsWith('#'))event.preventDefault();}}><StoreRenderer design={design} store={{name:definition.name,currency:'NGN',businessType:digital?'digital':'physical',productCategories:[]}} products={products} config={{identity:{showFloatingWhatsapp:false}}} preview interactivePreview onProduct={setProduct} onQuickAdd={setProduct}/></div>{product&&<Modal title={product.name} onClose={()=>setProduct(null)} footer={<Button onClick={()=>setProduct(null)}>Continue exploring</Button>}><img src={image} alt={product.name} style={{width:'100%',maxHeight:360,objectFit:'contain',borderRadius:12}}/><p>{product.description}</p><strong>₦{product.price.toLocaleString()}</strong><p>Template preview only. No orders or payments can be made.</p></Modal>}</>;
}
export function getServerSideProps({query}){const theme=typeof query.theme==='string'?query.theme:'';return Object.hasOwn(themes,theme)?{props:{theme}}:{notFound:true};}
