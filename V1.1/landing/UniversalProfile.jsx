import ActionIcon from "./ActionIcon";
import { useState } from "react";
import CategoryCover from "../media/CategoryCover";
import { brandTokens } from "./themeModel";
import { validDestination, actionDestination } from "./personalization";
import styles from "./UniversalProfile.module.css";

export function Photo({ url, assets = [], avatar = false, name, position, fit }) {
  const [failed, setFailed] = useState([]);
  const custom = validDestination(url);
  const asset = assets.find(item => !failed.includes(item.categoryId));
  if (custom && !failed.includes(custom)) return <img src={custom} alt={avatar ? `${name} profile` : ""} width={avatar ? 88 : 1600} height={avatar ? 88 : 800} loading="eager" decoding="async" style={{objectFit:avatar ? fit : "cover",objectPosition:position || undefined}} onError={()=>setFailed(previous=>[...previous,custom])}/>;
  if (asset) return <CategoryCover asset={asset} alt={avatar ? `${name} category photograph` : asset.alt} priority sizes={avatar ? "88px" : "(max-width: 480px) 100vw, 480px"} style={{width:"100%",height:"100%",aspectRatio:avatar ? "1" : "2",...(position ? {objectPosition:position} : {})}} onError={()=>setFailed(previous=>[...previous,asset.categoryId])}/>;
  return avatar ? <span className={styles.initials}>{String(name || "?").trim().split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]).join("")}</span> : <div className={styles.neutral} role="img" aria-label="Abstract brand cover"><i/><i/><i/></div>;
}
export default function UniversalProfile({ instance, preview = false, verified = false }) {
  const data = instance.personalization || {};
  const spotlight=instance.templateId === "spotlight-profile" || instance.themeId === "spotlight-profile";
  const studio=instance.themeId === "studio-pass";
  const HeadlineTag=studio ? "h1" : "h2";
  const rhythm=instance.themeId === "rhythm-grid";
  const campaign=instance.themeId === "campaign-profile";
  const service=instance.themeId === "service-profile";
  const tokens = brandTokens(instance.colorOverride || data.brandColor);
  const visible = data.visibility || {};
  const candidates = (campaign || rhythm || studio) ? (data.actions || []).filter(action=>action.kind === "whatsapp").slice(0,1) : (data.actions || []);
  const actions = candidates.filter(action=>action.visible !== false && action.label?.trim() && (actionDestination(action,data) || (preview && action.kind === "whatsapp")));
  return <div className={styles.canvas} data-design={studio?"studio":rhythm?"rhythm":campaign?"campaign":service?"service":spotlight?"spotlight":"signature"} style={{"--brandPrimary":tokens.accent,"--brandPrimaryHover":tokens.hover,"--brandSoft":tokens.soft,"--brandContrast":tokens.onAccent,"--brandBorder":tokens.accent,"--surface":"#ffffff","--textPrimary":"#212126","--textSecondary":"#60606a"}}>
    <article className={styles.profile} data-template={studio?"studio-pass":rhythm?"rhythm-grid":campaign?"campaign-profile":service?"service-profile":spotlight?"spotlight-profile":"universal-profile"}>
      {(spotlight || service) && <div className={styles.topline}><span>{data.categoryLabel || "Welcome"}</span><small>{service?"SERVICE PAGE":"LINKS & MORE"}</small></div>}
      {!rhythm && !service && visible.cover !== false && <div className={styles.cover}><Photo url={data.coverImageUrl} assets={data.categoryAssets} name={data.displayName} position={data.imagePosition}/></div>}
      {studio && <header className={styles.studioHeader}><strong>{data.displayName}</strong><span>{data.categoryLabel}</span></header>}
      <div className={styles.content}>
        {!studio && !rhythm && visible.avatar !== false && <div className={styles.avatar} data-overlap={!campaign && !service && visible.cover !== false}><Photo avatar url={(service || campaign) ? "" : data.profileImageUrl} assets={data.categoryAssets} name={data.displayName} fit={data.profileFit || "contain"}/></div>}
        {!studio && <h1>{data.displayName}{verified && <span aria-label="Verified account" className={styles.verified}>✓</span>}</h1>}
        {(campaign || rhythm || studio) && <HeadlineTag className={styles.headline}>{data.headline || data.categoryLabel || data.displayName}</HeadlineTag>}
        {rhythm && visible.cover !== false && <div className={styles.mosaic}>{[0,1,2].map(index=><div key={index} data-media-slot={index}><Photo url={data.media?.[index]?.url || (index === 0 ? data.coverImageUrl : "")} assets={data.categoryAssets} name={data.displayName} position={data.media?.[index]?.position || ["center","left","right"][index]}/></div>)}</div>}
        {visible.description !== false && data.description && <p className={styles.description}>{data.description}</p>}
        <nav className={styles.actions} aria-label="Profile links">{actions.map((action,index)=>preview ? <span key={`${action.id}-${index}`} className={styles.button} data-style={action.style}><ActionIcon action={action}/><span>{action.label}</span></span> : <a key={`${action.id}-${index}`} className={styles.button} data-style={action.style} href={actionDestination(action,data)} rel="noopener noreferrer"><ActionIcon action={action}/><span>{action.label}</span></a>)}</nav>
        {spotlight && data.highlights?.length > 0 && <div className={styles.highlights}>{data.highlights.filter(item=>item.label?.trim()).slice(0,4).map((item,index)=><div key={index}><ActionIcon action={{icon:item.icon || "link"}} size={18}/><span>{item.label}</span></div>)}</div>}
        <footer className={styles.footer}>Made with <strong>MyTikLink</strong></footer>
      </div>
    </article>
  </div>;
}
