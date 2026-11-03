import {useState} from "react";
import {ShoppingBag,Plus,Minus} from "lucide-react";
import {FaWhatsapp} from "react-icons/fa6";
import {Photo} from "./UniversalProfile";
import {brandTokens} from "./themeModel";
import {productEnquiryUrl,addProduct} from "./productModel";
import styles from "./ProductProfile.module.css";
export default function ProductProfile({instance,preview=false}){
 const data=instance.personalization||{},shelf=instance.themeId === "curated-shelf";
 const [counts,setCounts]=useState({}),[open,setOpen]=useState(false);
 const products=(data.products||[]).slice(0,shelf?4:1),total=products.reduce((n,p)=>n+(counts[p.id]||0),0);
 const token=brandTokens(instance.colorOverride||data.brandColor),url=productEnquiryUrl(data,counts);
 const label=shelf?"Ask about a product":"Order on WhatsApp";
 return <main className={styles.canvas} style={{"--accent":token.accent,"--contrast":token.onAccent}}><article className={styles.page} data-product-layout={shelf?"shelf":"spotlight"}>
 <header className={styles.header}><h1>{data.displayName}</h1>{shelf?<button type="button" aria-label={`Selected products: ${total}`} aria-expanded={open} onClick={()=>setOpen(!open)}><ShoppingBag size={22}/><span aria-live="polite">{total||""}</span></button>:<ShoppingBag size={22} aria-hidden="true"/>}</header>
 {shelf && !data._hidden?.headline && <h2 className={styles.headline}>{data.headline||"Objects for everyday."}</h2>}
 {shelf && open && <section className={styles.basket} aria-label="Selected products">{total===0?<p>No products selected yet.</p>:products.filter(p=>counts[p.id]).map(p=><div key={p.id}><span>{p.name} × {counts[p.id]}</span><button type="button" aria-label={`Remove one ${p.name}`} onClick={()=>setCounts(c=>({...c,[p.id]:Math.max(0,(c[p.id]||0)-1)}))}><Minus size={16}/></button></div>)}</section>}
 <div className={styles.products}>{products.map((p,i)=><section key={p.id} className={styles.product}><div className={styles.photo}><Photo url={p.imageUrl || (i===0?data.coverImageUrl:"")} assets={p.assets?.length?p.assets:data.categoryAssets} name={p.name} position={p.imagePosition || (shelf ? ["35% center","65% center","left center","right center"][i] : "center")}/></div><div className={styles.details}><div>{!shelf&&<small>{data.categoryLabel}</small>}<h2>{p.name}</h2><p className={styles.price}>{p.price || ["₦18,000","₦8,500","₦12,000","₦16,500"][i]}</p></div>{shelf&&<button type="button" data-page-action={`product-${i}`} aria-label={`Add ${p.name}`} onClick={()=>setCounts(c=>addProduct(c,p.id))}><Plus size={19}/></button>}</div></section>)}</div>
 <div className={styles.actionArea}>{url&&!preview?<a className={styles.action} href={url} rel="noopener noreferrer"><FaWhatsapp size={20}/>{label}</a>:<button type="button" className={styles.action} disabled><FaWhatsapp size={20}/>{label}</button>}</div><footer className={styles.footer}>Made with MyTikLink</footer>
 </article></main>;
}
