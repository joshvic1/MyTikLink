import { useState } from "react";
import { brandTokens } from "./themeModel";
import { validDestination } from "./personalization";
import ActionIcon from "./ActionIcon";
import styles from "./PersonalizedPreview.module.css";

function Image({url,assets=[],avatar=false,fit="cover",name=""}) {
 const [failed,setFailed]=useState([]);
 const custom=validDestination(url);
 const asset=assets.find(item=>!failed.includes(item.categoryId));
 const variant=asset?.variants?.find(item=>item.format==="webp"&&item.width===400);
 const src=custom&&!failed.includes(custom)?custom:variant?.url;
 const key=src===custom?custom:asset?.categoryId;
 if(!src)return avatar?<span className={styles.initials}>{name.trim().split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]).join("")}</span>:<div className={styles.neutral}/>;
 return <img src={src} alt="" width={avatar?56:400} height={avatar?56:200} loading="lazy" decoding="async" style={{objectFit:src===custom?fit:"cover",objectPosition:asset?`${asset.focalPoint.x*100}% ${asset.focalPoint.y*100}%`:"center"}} onError={()=>setFailed(previous=>[...previous,key])}/>;
}
// Presentation only: no forms, analytics, navigation, effects or profile requests.
export default function PersonalizedPreview({data,color,layout="profile"}) {
 const tokens=brandTokens(color||data.brandColor);
 if (["product-spotlight","curated-shelf"].includes(layout)) return <div className={styles.productCard} data-layout={layout} style={{"--preview-brand":tokens.accent,"--preview-contrast":tokens.onAccent}} aria-label={`Preview for ${data.displayName}`}><strong>{data.displayName}</strong>{layout === "curated-shelf"&&<h3>{data.headline}</h3>}<div className={styles.productGrid}>{(data.products||[]).slice(0,layout==="curated-shelf"?4:1).map((p,i)=><div key={p.id}><div className={styles.productPhoto}><Image url={p.imageUrl || (i===0?data.coverImageUrl:"")} assets={p.assets?.length?p.assets:data.categoryAssets}/></div><b>{p.name}</b><small>{p.price || ["₦18,000","₦8,500","₦12,000","₦16,500"][i]}</small></div>)}</div><span className={styles.productAction}>{layout==="curated-shelf"?"Ask about a product":"Order on WhatsApp"}</span></div>;
 if (["contact-sheet","side-note"].includes(layout)) return <div className={styles.quietCard} data-preview-layout={layout} aria-label={`Preview for ${data.displayName}`} style={{"--preview-brand":tokens.accent,"--preview-contrast":tokens.onAccent,"--preview-soft":tokens.soft}}>
 {layout === "contact-sheet" && data.visibility?.cover !== false && <div className={styles.quietPhoto}><Image url={data.coverImageUrl} assets={data.categoryAssets}/></div>}
 <div className={styles.quietSplit}><div className={styles.quietIdentity}><strong>{data.displayName}</strong><small>{data.categoryLabel}</small>{layout === "side-note" && <p>{data.headline}</p>}</div>{layout === "side-note" && data.visibility?.cover !== false && <div className={styles.quietPhoto}><Image url={data.coverImageUrl} assets={data.categoryAssets}/></div>}</div>
 <div className={styles.quietBody}>{data.visibility?.description === true && <p>{data.description}</p>}<div className={styles.miniForm} aria-hidden="true"><strong>{data.form?.formTitle}</strong><span>Your name</span><div>Enter your name</div><span>WhatsApp number</span><div>+2348012345678</div><b>{data.form?.submitLabel}</b></div></div><small className={styles.quietFooter}>Made with MyTikLink</small></div>;
 if (["personal-intro","enquiry-desk"].includes(layout)) return <div className={styles.formCard} data-preview-layout={layout} aria-label={`Preview for ${data.displayName}`} style={{"--preview-brand":tokens.accent,"--preview-contrast":tokens.onAccent,"--preview-soft":tokens.soft}}>
 <strong className={styles.formBrand}>{data.displayName}</strong>
 {layout === "enquiry-desk" && <div className={styles.formPhoto}><Image url={data.coverImageUrl} assets={data.categoryAssets}/></div>}
 <small className={styles.formCategory}>{data.categoryLabel}</small><strong className={styles.formHeadline}>{data.headline || "Tell us what you have in mind."}</strong>
 {layout === "personal-intro" && <div className={styles.formPhoto}><Image url={data.coverImageUrl} assets={data.categoryAssets}/></div>}
 <p className={styles.formDescription}>{data.description}</p>
 <div className={styles.miniForm} aria-hidden="true"><strong>{data.form?.formTitle || "Fill the form below"}</strong><span>Your name</span><div>Enter your name</div><span>WhatsApp number</span><div>+2348012345678</div><b>{data.form?.submitLabel || "Send enquiry"}</b></div>
 </div>;
 return <div className={styles.card} data-preview-layout={layout} aria-label={`Preview for ${data.displayName}`} style={{"--preview-brand":tokens.accent,"--preview-contrast":tokens.onAccent,"--preview-soft":tokens.soft}}>
  {(layout === "spotlight" || layout === "service") && <div className={styles.topline}>{data.categoryLabel || "Welcome"}<small>{layout === "service" ? "SERVICE PAGE" : "LINKS & MORE"}</small></div>}
  {layout !== "rhythm" && layout !== "service" && <div className={styles.cover}><Image url={data.coverImageUrl} assets={data.categoryAssets}/></div>}
  {layout === "studio" && <header className={styles.studioHeader}><strong>{data.displayName}</strong><span>{data.categoryLabel}</span></header>}
  <div className={styles.content}>
   {layout !== "studio" && layout !== "rhythm" && <div className={styles.avatar}><Image avatar url={(layout === "service" || layout === "campaign") ? "" : data.profileImageUrl} assets={data.categoryAssets} fit={data.profileFit} name={data.displayName}/></div>}
   {layout !== "studio" && <strong className={styles.name}>{data.displayName}</strong>}
   {(["campaign","rhythm","studio"].includes(layout)) && <strong className={styles.headline}>{data.headline || data.categoryLabel}</strong>}
   {layout === "rhythm" && <div className={styles.mosaic}>{[0,1,2].map(index=><div key={index} data-media-slot={index}><Image url={data.media?.[index]?.url || (index === 0 ? data.coverImageUrl : "")} assets={data.categoryAssets}/></div>)}</div>}
   <p className={styles.bio}>{data.description}</p>
   <div className={styles.actions} aria-hidden="true">{(data.actions||[]).filter(action=>action.visible!==false && (!["campaign","rhythm","studio"].includes(layout) || action.kind === "whatsapp")).slice(0,["campaign","rhythm","studio"].includes(layout) ? 1 : 3).map((action,index)=><span key={index} className={styles.action} data-style={action.style}><ActionIcon action={action} size={13}/><span>{action.label}</span></span>)}</div>
   {layout === "spotlight" && data.highlights?.length>0 && <div className={styles.highlights}>{data.highlights.slice(0,4).map((item,index)=><span key={index}><ActionIcon action={{icon:item.icon}} size={12}/>{item.label}</span>)}</div>}
  </div>
 </div>;
}
