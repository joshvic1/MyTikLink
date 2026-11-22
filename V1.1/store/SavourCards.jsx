import {Clock3,LoaderCircle,Package,Plus} from 'lucide-react';
import {durationLabel} from '../services/servicePresentation.mjs';
import {serviceHref} from '../services/ServiceCatalogue';
import {storeImageSrcSet} from './storeMedia';
import css from './SavourCards.module.css';

export default function SavourCards({items,store,preview,interactivePreview,onProduct,onQuickAdd,quickAdding,openingProduct,price}){
 if(!items.length)return <div className={css.empty}><Package size={28}/><h3>{store.serviceBusiness?'Our services are coming soon':'Nothing to show just yet'}</h3><p>Check back soon or try another search.</p></div>;
 return <div className={css.grid}>{items.map(item=>{
  const service=Boolean(item.isService||item.demoFocus?.endsWith('_services'));
  const image=typeof item.images?.[0]==='string'?item.images[0]:item.images?.[0]?.url;
  const href=service?serviceHref(store.slug,item.slug):`/s/${encodeURIComponent(store.slug)}/products/${encodeURIComponent(item.slug)}`;
  const blocked=Boolean((preview||item.isDemo)&&!interactivePreview);
  const busy=quickAdding===item.slug||openingProduct===item.slug;
  const open=preview||item.isDemo||!service?e=>{if(blocked||onProduct){e.preventDefault();if(!blocked)onProduct?.(item);}}:undefined;
  const action=service?(item.serviceMode==='appointment'?'Book appointment':'Book service'):(item.productType==='digital'||store.businessType==='digital'?'Buy now':'Add');
  const duration=service?durationLabel(item):'';
  return <article className={css.card} key={item._id} aria-busy={busy}>
   <a className={css.visual} href={blocked?undefined:href} onClick={open} aria-label={`View ${item.name}`} aria-disabled={blocked||undefined}>{image?<img src={image} srcSet={storeImageSrcSet(image)} sizes="(max-width:700px) 88px, 25vw" alt={item.name} loading="lazy" decoding="async"/>:<Package size={30}/>}</a>
   <div className={css.body}>
    <h3><a href={blocked?undefined:href} onClick={open} title={item.name}>{item.name}</a></h3>
    {!service&&item.description&&<p className={css.description}>{String(item.description).replace(/<[^>]*>/g,' ').slice(0,160)}</p>}
    {duration&&<span className={css.duration}><Clock3 size={13}/>{duration}</span>}
    <div className={css.bottom}><div className={css.price}>{price(item.price)}{item.comparePrice>item.price&&<del>{price(item.comparePrice)}</del>}</div>
    {service&&!item.onBook&&!preview&&!item.isDemo?<a className={css.action} href={href}>{action}</a>:<button type="button" className={css.action} disabled={blocked||Boolean(quickAdding)||Boolean(openingProduct)} onClick={()=>service?(item.onBook?item.onBook():onProduct?.(item)):onQuickAdd?.(item)} aria-label={`${action} ${item.name}`}>{busy?<LoaderCircle size={17} className={css.spinner}/>:<>{!service&&<Plus size={16}/>}<span>{action}</span></>}</button>}</div>
   </div>
  </article>;
 })}</div>;
}
