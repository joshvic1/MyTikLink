import CategoryCover from "../media/CategoryCover";
import { findCategoryCoverByUrl } from "../media/categoryImages";
import { shortThemeTokens, safeUrl } from './themeModel';
import ThemeLeadForm from './ThemeLeadForm';
import styles from './ShortThemeRenderer.module.css';

export function shortActionDestination(instance, section, preview = false) {
  if (section.primaryUrl === 'owner') {
    const number = String(instance.ownerWhatsapp || '').replace(/[\s()-]/g,'');
    if (/^\+?[1-9]\d{7,14}$/.test(number)) return `https://wa.me/${number.replace(/\D/g,'')}`;
  } else {
    const url = safeUrl(section.primaryUrl);
    if (url && !url.startsWith('#')) return url;
  }
  return preview ? `/v1-1/themes/action-demo?theme=${encodeURIComponent(instance.themeId)}` : '';
}
function Photo({section,position,className}) {
  const src=safeUrl(section.image,true);
  const candidate=section.categoryCover || findCategoryCoverByUrl(src);
  const asset=candidate?.variants?.some(v=>v.url===src)?candidate:null;
  if(asset)return <CategoryCover asset={asset} alt={section.imageAlt} className={className} priority style={{objectPosition:position||"center",aspectRatio:"auto"}}/>;
  const generated=/^\/v1-1\/themes\/phase-1b\/[a-z]+-960\.webp$/.test(src);
  return src ? <img className={className} src={src} srcSet={generated?`${src.replace('-960','-480')} 480w, ${src} 960w`:undefined} sizes="(max-width: 600px) 100vw, 50vw" alt={section.imageAlt || ''} width="960" height="1200" decoding="async" loading="eager" style={{objectPosition:position || 'center'}}/> : <div className={styles.emptyPhoto}>Add your photograph</div>;
}
function WorkspaceGraphic() {
 return <div className={styles.workspace} role="img" aria-label="Illustrative workspace with a project plan, notes and tasks"><div className={styles.windowBar}><i/><i/><i/><span>YOUR WORKSPACE</span></div><div className={styles.workspaceBody}><small>MAKE SPACE FOR WHAT MATTERS</small><strong>A clearer day.</strong><div className={styles.board}><div><b>IDEAS</b><p>That next big thing</p><p>A fresh perspective</p></div><div><b>IN FOCUS</b><p>One step at a time</p><p>Make it happen ↗</p></div></div><div className={styles.progress}><span/> Your next chapter</div></div></div>;
}
export default function ShortThemeRenderer({instance,page,preview=false}) {
 const section=instance.sections.find(s=>s.type==='hero'&&s.visible!==false);
 if(!section)return null;
 const tokens=shortThemeTokens(instance.colorOverride||instance.profileColor),family=instance.family;
 const url=shortActionDestination(instance,section,preview);
 return <article className={styles.page} data-short-family={family} data-rounded={instance.layout?.rounded||false} style={{'--primary':tokens.primary,'--cta':tokens.cta,'--accent':tokens.accent,'--on-accent':tokens.onAccent,'--soft':tokens.subtleSurface,'--focus':tokens.focus,'--hover':tokens.hover}}>
   <header className={styles.header}><span>{safeUrl(instance.logo,true)&&<img src={safeUrl(instance.logo,true)} alt="" width="28" height="28"/>}{instance.name}</span><small>{instance.categoryLabel || (instance.variant==='lead'?'LET’S CONNECT':'EXPLORE THE EDIT')}</small></header>
   <section className={styles.stage}>
    <div className={styles.visual}>{family==='short-digital'&&!section.image?<WorkspaceGraphic/>:<Photo section={section} position={instance.layout?.imagePosition} className={styles.photo}/>}{family==='short-footwear'&&<div className={styles.detailCrop} aria-hidden="true"><Photo section={{...section,imageAlt:''}} position="bottom" className={styles.photo}/></div>}{family==='short-photography'&&<div className={styles.filmStrip} aria-hidden="true"><Photo section={{...section,imageAlt:''}} position="top" className={styles.photo}/><Photo section={{...section,imageAlt:''}} position="bottom" className={styles.photo}/></div>}</div>
    <div className={styles.content}><span className={styles.eyebrow}>{section.eyebrow}</span><h1>{section.title}</h1><p className={styles.description}>{section.description}</p>
      {!!section.facts?.length&&<dl className={styles.facts}>{section.facts.map((fact,i)=><div key={i}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
      {instance.variant==='lead'?<ThemeLeadForm section={section} page={page} preview={preview}/>:url?<a className={styles.action} href={url} target={preview?'_blank':undefined} rel={preview?'noopener noreferrer':undefined}>{section.primary}<span aria-hidden="true">↗</span></a>:<p className={styles.unavailable}>Contact details coming soon.</p>}
    </div>
   </section>
 </article>;
}
