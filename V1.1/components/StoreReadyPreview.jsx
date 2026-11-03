import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {Menu,ShoppingCart} from 'lucide-react';
import {Modal,Button} from './UI';
import {apiRequest} from '../lib/api';
import {resolveStoreText} from '../store/design';
import s from './StarterPage.module.css';
import t from './StoreReadyPreview.module.css';
const StoreRenderer=dynamic(()=>import('../store/StoreRenderer'));
export function StoreReadyThumbnail({detail,store={}}){
 const design=detail?.design,hero=design?.sections?.find(s=>s.type==='hero'&&s.visible),identity={...store,...detail?.store,...Object.fromEntries(Object.entries(detail?.config?.identity||{}).filter(([,v])=>v!==''))};
 const title=hero?resolveStoreText(hero.title,identity):identity.name;
 return <div className={t.frame} style={{'--store-accent':design?.brand?.accent||'#7041dc'}}><div className={t.browser}><i/><i/><i/></div><header><Menu size={11}/><b>{identity.name||'Your store'}</b><ShoppingCart size={11}/></header><div className={t.hero}>{hero?.image&&<img src={hero.image} alt="" loading="lazy"/>}<div><strong>{title||identity.name||'Your collection'}</strong><span>{hero?.settings?.ctaLabel||'Shop now'}</span></div></div><div className={t.caption}>Your storefront</div></div>;
}
export default function StoreReadyPreview({detail,onClose,onUpgrade}){
 const [data,setData]=useState(detail),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(detail){setData(detail);return;}let active=true;setError('');apiRequest('/v1-1/store-studio').then(result=>{if(active)setData(result);}).catch(e=>{if(active)setError(e.message||'Could not load your store.');});return()=>{active=false;};},[detail,attempt]);
 const store={...data?.store,...Object.fromEntries(Object.entries(data?.config?.identity||{}).filter(([,v])=>v!==''))};
 return <Modal title="Your store preview" description="This is what your online store looks like below." backdropClassName={s.previewBackdrop} className={s.previewSheet} onClose={onClose} footer={onUpgrade?<Button onClick={onUpgrade}>Upgrade to Pro to publish your store</Button>:undefined}><div className={s.previewStage}><div className={s.previewFrame}>{error?<div role="alert"><p>{error}</p><Button onClick={()=>setAttempt(n=>n+1)}>Retry preview</Button></div>:!data?<p role="status">Loading your store preview…</p>:!data.store||!data.design?<p>Your store preview is unavailable.</p>:<div inert="" className={s.previewContent}><StoreRenderer design={data.design} store={store} products={data.products||[]} config={data.config} collections={data.collections||[]} reviews={data.reviews||[]} preview/></div>}</div></div></Modal>;
}
