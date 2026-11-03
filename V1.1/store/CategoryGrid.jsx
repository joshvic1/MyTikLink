import {Package} from 'lucide-react';
import {storeImageSrcSet} from './storeMedia';

// Structure and category routing are shared; each theme supplies its own className.
export default function CategoryGrid({categories=[],products=[],title='Shop by category',sectionId='category-grid',className,hrefFor,preview=false,limit,allHref}){
 const visible=categories.filter(category=>category.visible);
 if(!visible.length)return null;
 return <section data-store-section={sectionId} className={className}><h2>{title}</h2><div>{visible.slice(0,limit||visible.length).map(category=>{
  const product=products.find(p=>p.category===category.name||p.categories?.includes(category.name));
  const first=product?.images?.[0];
  const image=category.image||(typeof first==='string'?first:first?.url);
  return <a key={category.slug} href={preview?undefined:hrefFor(category.slug)}>{image?<img src={image} srcSet={storeImageSrcSet(image)} sizes="(max-width:700px) 50vw, 25vw" loading="lazy" alt=""/>:<Package size={36}/>}<span>{category.name}</span></a>;
 })}</div>{limit&&visible.length>limit&&allHref&&<a href={allHref} style={{display:"flex",justifyContent:"center",marginTop:20,padding:12,border:"1px solid currentColor",fontSize:12,fontWeight:700}}>View all categories</a>}</section>;
}
