import dynamic from "next/dynamic";
import PersonalizedPreview from "./PersonalizedPreview";
import { resolvePersonalization } from "./personalization";
import { useState } from "react";
import { createThemeInstance } from "./themeModel";
const ThemeRenderer = dynamic(()=>import("./ThemeRenderer"));
import styles from "./ThemePreview.module.css";
export function ThemePreview({ theme, instance, profile = {}, registry = [] }) {
 const [failedImage,setFailedImage]=useState("");
 if (theme?.preview?.cardLayout || theme?.renderer === "universal-profile" || Boolean(theme?.version)) {
 const data=instance?.personalization || resolvePersonalization({template:theme,profile,registry});
 return <PersonalizedPreview data={data} color={instance?.colorOverride} layout={theme.preview?.cardLayout || "profile"}/>;
 }
 if(theme?.preview?.image && failedImage !== theme.preview.image) return <div className={styles.preview} style={{height:320,background:"#eee8f4"}}><img src={theme.preview.image} alt={theme.preview.label || `${theme.title} template preview`} width={theme.preview.width || 480} height={theme.preview.height || 606} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setFailedImage(theme.preview.image)}/></div>;
 return <div className={styles.preview} style={(instance?.renderer || theme?.renderer)==="short-form"?{height:320}:undefined} aria-hidden="true" inert><div className={styles.scaled}><ThemeRenderer instance={instance || createThemeInstance(theme)} preview/></div></div>;
}
