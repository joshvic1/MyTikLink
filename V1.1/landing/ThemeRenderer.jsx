import BrandCredit from "../../components/marketing/BrandCredit";
import {visibleText} from "./textVisibility";
import ProductProfile from "./ProductProfile";
import FormProfile from "./FormProfile";
import UniversalProfile from "./UniversalProfile";
import CategoryCover from "../media/CategoryCover";
import { findCategoryCoverByUrl } from "../media/categoryImages";
import LeadForm from "./ThemeLeadForm";
import ShortThemeRenderer from "./ShortThemeRenderer";
import { brandTokens, safeUrl } from "./themeModel";
import styles from "./ThemeRenderer.module.css";

function Art({ section, family, position, eager = false }) {
  const src = safeUrl(section.image, true);
  const candidate=section.categoryCover || findCategoryCoverByUrl(src);
  const asset=candidate?.variants?.some(v=>v.url===src)?candidate:null;
  return <figure className={styles.art} data-art={family} data-editor-image={section.id}>
    {asset ? <CategoryCover asset={asset} alt={section.imageAlt} priority={eager} style={{objectPosition:position,aspectRatio:"auto"}}/> : src ? <img src={src} alt={section.imageAlt || section.title || "Page image"} loading={eager ? "eager" : "lazy"} decoding="async" style={{objectPosition: position}}/> : <><div className={styles.sculpture}><i/><i/><i/></div><figcaption>{section.imageAlt || "Your image"} · placeholder</figcaption></>}
  </figure>;
}
function Action({ url, children, secondary, preview }) {
  if(!children)return null;
  const destination = safeUrl(url);
  if (!destination || preview) return <span data-editor-button={typeof children === "string" ? children : undefined} className={secondary ? styles.secondary : styles.action}>{children} </span>;
  return <a className={secondary ? styles.secondary : styles.action} href={destination}>{children}</a>;
}
export default function ThemeRenderer({ instance, page, preview = false }) {
  instance=visibleText(instance);
  if (!instance || instance.version !== 1) return <p>This page design requires a newer renderer.</p>;
  if (["product-spotlight","curated-shelf"].includes(instance.themeId)) return <ProductProfile key={instance.themeId} instance={instance} preview={preview}/>;
  if (["personal-intro","enquiry-desk","contact-sheet","side-note"].includes(instance.themeId)) return <FormProfile instance={instance} page={page} preview={preview}/>;
  if (instance.renderer === "universal-profile") return <UniversalProfile instance={instance} preview={preview}/>;
  if (instance.renderer === "short-form") return <ShortThemeRenderer instance={instance} page={page} preview={preview}/>;
  const tokens = brandTokens(instance.colorOverride || instance.profileColor);
  const ownerUrl = /^\+?[1-9]\d{7,14}$/.test(instance.ownerWhatsapp || "") ? `https://wa.me/${instance.ownerWhatsapp.replace(/\D/g, "")}` : "";
  return <article className={styles.page} data-family={instance.family} data-rounded={instance.layout?.rounded || false} style={{"--accent":tokens.accent,"--on-accent":tokens.onAccent,"--accent-hover":tokens.hover,"--soft":tokens.soft}}>
    <header className={styles.header}><span className={styles.brand}>{safeUrl(instance.logo,true) && <img src={safeUrl(instance.logo,true)} alt="" width="36" height="36"/>}{instance.name}</span><span>{instance._hidden?.categoryLabel ? "" : instance.categoryLabel || (instance.variant === "lead" ? "ENQUIRIES OPEN" : "EXPLORE & CONNECT")}</span></header>
    {instance.sections.filter(s => s.visible !== false).map(section => {
      if (section.type === "hero") return <section className={styles.hero} key={section.id}>
        <Art section={section} family={instance.family} position={instance.layout?.imagePosition} eager/>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>{section.eyebrow}</span><h1>{section.title}</h1><p>{section.description}</p><div className={styles.actions}><Action url={section.primaryUrl === "owner" ? ownerUrl : section.primaryUrl} preview={preview}>{section.primary}</Action><Action url={section.secondaryUrl === "owner" ? ownerUrl : section.secondaryUrl} secondary preview={preview}>{section.secondary}</Action></div></div>
        {instance.variant === "lead" && <LeadForm section={section} page={page} preview={preview} name={instance.name}/>}
      </section>;
      if (section.type === "collection") return <section className={styles.collection} id={preview ? undefined : section.id} key={section.id}><div className={styles.sectionHeading}><span className={styles.eyebrow}>{section.eyebrow}</span><h2>{section.title}</h2></div><div className={styles.items}>{section.items.map((item,i) => <div className={styles.item} key={item.id}><Art section={item} family={instance.family} position={instance.layout?.imagePosition}/><div className={styles.itemText}><small>{String(i+1).padStart(2,"0")}</small><h3>{item.title}</h3><p>{item.description}</p>{item.price && <strong>{item.price}</strong>}<Action url={item.url === "owner" ? ownerUrl : item.url} secondary preview={preview}>{item.label}</Action></div></div>)}</div></section>;
      if (section.type === "about") return <section className={styles.about} id={preview ? undefined : section.id} key={section.id}><span className={styles.eyebrow}>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.description}</p>{section.image && <Art section={section} family={instance.family}/>}<Action url={section.url === "owner" ? ownerUrl : section.url || ownerUrl} secondary preview={preview}>{section.label}</Action></section>;
      return null;
    })}
    <footer className={styles.footer}>{instance.name}<span><BrandCredit preview={preview}>Made with MyTikLink</BrandCredit></span></footer>
  </article>;
}
