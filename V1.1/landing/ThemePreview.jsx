import dynamic from "next/dynamic";
import PersonalizedPreview from "./PersonalizedPreview";
import { resolvePersonalization } from "./personalization";
import { useState, useEffect, useRef } from "react";
import { brandTokens, createThemeInstance } from "./themeModel";
const ThemeRenderer = dynamic(()=>import("./ThemeRenderer"));
import styles from "./ThemePreview.module.css";
function Miniature({children}) {
 const host=useRef(null),[width,setWidth]=useState(160);
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(el);return()=>observer.disconnect();},[]);
 return <div ref={host} className={styles.preview} aria-hidden="true" inert=""><div className={styles.scaled} style={{transform:`scale(${width/390})`}}>{children}</div></div>;
}
export function ThemePreview({ theme, instance, profile = {}, registry = [] }) {
 const [failedImage,setFailedImage]=useState("");
 if(theme?.renderer === "short-form") {
 const page=instance || createThemeInstance(theme,profile,registry);
 const colors=brandTokens(page.colorOverride || page.profileColor || theme.defaultTokens?.accent);
 const hero=page.sections.find(section=>section.type==="hero") || {};
 return <Miniature><article className={styles.shortCard} data-family={page.family} style={{"--preview-accent":colors.accent,"--preview-on-accent":colors.onAccent}}>
 <header>{page.name || "Your brand"}<small>{page.variant==="lead"?"LET’S CONNECT":"EXPLORE THE EDIT"}</small></header>
 {hero.image && <img className={styles.shortPhoto} src={hero.image} alt="" loading="lazy" decoding="async"/>}
 <div className={styles.shortContent}><small>{hero.eyebrow}</small><h3>{hero.title}</h3><p>{hero.description}</p>
 {page.variant==="lead"?<div className={styles.sampleForm}><span>Your name</span><span>WhatsApp number</span><b>{hero.submitLabel || hero.primary}</b></div>:<b className={styles.sampleAction}>{hero.primary}</b>}
 </div></article></Miniature>;
 }
 if (theme?.preview?.cardLayout || theme?.renderer === "universal-profile" || Boolean(theme?.version)) {
 const data=instance?.personalization || resolvePersonalization({template:theme,profile,registry});
 return <Miniature><PersonalizedPreview data={data} color={instance?.colorOverride} layout={theme.preview?.cardLayout || "profile"}/></Miniature>;
 }
 if(theme?.preview?.image && failedImage !== theme.preview.image) return <div className={styles.preview} style={{background:"#eee8f4"}}><img src={theme.preview.image} alt={theme.preview.label || `${theme.title} template preview`} width={theme.preview.width || 480} height={theme.preview.height || 606} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setFailedImage(theme.preview.image)}/></div>;
 return <Miniature><ThemeRenderer instance={instance || createThemeInstance(theme,profile,registry)} preview/></Miniature>;
}
