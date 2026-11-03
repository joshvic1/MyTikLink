import { MessageCircle } from "lucide-react";
import { Photo } from "./UniversalProfile";
import LeadForm from "./ThemeLeadForm";
import { brandTokens } from "./themeModel";
import styles from "./FormProfile.module.css";
export default function FormProfile({instance,page,preview=false}) {
 const data=instance.personalization || {}, desk=instance.themeId === "enquiry-desk";
 const sheet=instance.themeId === "contact-sheet", side=instance.themeId === "side-note";
 const tokens=brandTokens(instance.colorOverride || data.brandColor);
 const photo=<div className={styles.photo}><Photo url={data.coverImageUrl} assets={data.categoryAssets} name={data.displayName} position={data.imagePosition}/></div>;
 if(sheet || side) return <div className={styles.canvas} data-design={sheet?"sheet":"side"} style={{"--accent":tokens.accent,"--on-accent":tokens.onAccent,"--soft":tokens.soft}}><article className={styles.page} data-template={instance.themeId}>
 {sheet && data.visibility?.cover !== false && photo}
 <div className={styles.split} data-no-photo={data.visibility?.cover === false}>
 <div className={styles.identity}>
 <header className={styles.header}>{sheet && data.visibility?.avatar !== false && <div className={styles.logo}><Photo avatar url={data.profileImageUrl} assets={data.categoryAssets} name={data.displayName} fit={data.profileFit}/></div>}<div><h1>{data.displayName}</h1><span className={styles.category}>{data.categoryLabel}</span></div></header>
 {side && <p className={styles.shortHeadline}>{data._hidden?.headline ? "" : data.headline || "A quick call. A fresh start."}</p>}
 </div>{side && data.visibility?.cover !== false && photo}</div>
 <div className={styles.body}>{data.visibility?.description === true && <p className={styles.description}>{data.description}</p>}<div className={styles.panel}><LeadForm compact interactivePreview className={styles.form} section={{formTitle:sheet?"Request a callback":"Fill the form below",submitLabel:sheet?"Send my details":"Request a call",...data.form,showConsent:false}} page={page} preview={preview || !page?.slug}/></div></div>
 <footer className={styles.footer}>Made with <strong>MyTikLink</strong></footer>
 </article></div>;
 return <div className={styles.canvas} data-design={desk?"desk":"intro"} style={{"--accent":tokens.accent,"--on-accent":tokens.onAccent,"--soft":tokens.soft}}><article className={styles.page} data-template={instance.themeId}>
  <header className={styles.header}>{data.visibility?.avatar !== false && <div className={styles.logo}><Photo avatar url={data.profileImageUrl} assets={data.categoryAssets} name={data.displayName} fit={data.profileFit}/></div>}<strong>{data.displayName}</strong></header>
  {desk && data.visibility?.cover !== false && photo}
  <div className={styles.intro}><span className={styles.category}>{data.categoryLabel}</span><h1>{data._hidden?.headline ? "" : data.headline || "Tell us what you have in mind."}</h1></div>
  {!desk && data.visibility?.cover !== false && photo}
  <div className={styles.body}>{data.visibility?.description !== false && <p className={styles.description}>{data.description}</p>}
   <div className={styles.panel}>{desk && <MessageCircle className={styles.chatIcon} size={25} aria-hidden="true"/>}<LeadForm compact interactivePreview className={styles.form} section={{formTitle:"Fill the form below",submitLabel:desk?"Send my details":"Send enquiry",...data.form,showConsent:false}} name={data.displayName} page={page} preview={preview || !page?.slug}/></div>
  </div><footer className={styles.footer}>Made with <strong>MyTikLink</strong></footer>
 </article></div>;
}
