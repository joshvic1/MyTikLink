import {useEffect,useLayoutEffect,useRef,useState,useId} from "react";
import {createPortal} from "react-dom";
import {MoreHorizontal,Copy,ExternalLink,Pencil,Trash2,Users,CopyPlus,Eye,MousePointer2,BarChart3,Link2} from "lucide-react";
import styles from "./LandingPageCard.module.css";
const shorten = (value, limit) => { const characters = Array.from(String(value || "")); return characters.length > limit ? characters.slice(0, limit).join("") + "…" : characters.join(""); };
export default function LandingPageCard({page,thumbnail,fallback,url,index=0,entity="page",price,statusLabel,onCopy,onEdit,onDelete,onDuplicate,onToggle,onLeads,onStats,busy}){
 const [open,setOpen]=useState(false),[position,setPosition]=useState(null),root=useRef(null),menu=useRef(null),trigger=useRef(null),id=useId();
 useLayoutEffect(()=>{
  if(!open)return;
  let frame;
  const place=()=>{
   const anchor=trigger.current?.getBoundingClientRect(),panel=menu.current;if(!anchor||!panel)return;
   const viewport=window.visualViewport,topEdge=(viewport?.offsetTop || 0)+8;
   const leftEdge=(viewport?.offsetLeft || 0)+8,rightEdge=(viewport?.offsetLeft || 0)+(viewport?.width || window.innerWidth)-8;
   let bottomEdge=(viewport?.offsetTop || 0)+(viewport?.height || window.innerHeight)-8;
   for(const nav of document.querySelectorAll('nav')){const style=getComputedStyle(nav),rect=nav.getBoundingClientRect();if(['fixed','sticky'].includes(style.position)&&rect.width>window.innerWidth/2&&rect.height>0&&rect.top>topEdge&&rect.bottom>=bottomEdge)bottomEdge=Math.min(bottomEdge,rect.top-8)}
   if(anchor.bottom<topEdge||anchor.top>bottomEdge){setOpen(false);return}
   const width=Math.min(169,rightEdge-leftEdge),height=panel.scrollHeight;
   const below=bottomEdge-anchor.bottom-6,above=anchor.top-topEdge-6;
   const up=below<height&&above>below,maxHeight=Math.max(0,up?above:below);
   const renderedHeight=Math.min(height,maxHeight);
   setPosition({left:Math.max(leftEdge,Math.min(anchor.right-width,rightEdge-width)),top:up?anchor.top-6-renderedHeight:anchor.bottom+6,width,maxHeight,up});
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(place)};
  place();menu.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus({preventScroll:true});
  window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule)};
 },[open]);
 useEffect(()=>{if(!open)return;const close=e=>{if(!root.current?.contains(e.target)&&!menu.current?.contains(e.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
 const active=page.availability==='active';
 const action=fn=>()=>{setOpen(false);trigger.current?.focus();fn()};
 const palette=['rose','peach','mint','violet'][Array.from(page._id || page.title || '').reduce((sum,c)=>sum+c.charCodeAt(0),0)%4];
 return <article style={{"--card-delay": `${Math.min(index,7)*35}ms`}} className={`${styles.card} ${styles[palette]} ${open ? styles.menuOpen : ""}`}>
  <div className={styles.art}><span className={styles.thumbnail}>{thumbnail?<img src={thumbnail} alt="" loading="lazy"/>:<b>{fallback}</b>}</span></div>
  <div className={styles.identity}><h3 title={page.title}>{shorten(page.title || 'Untitled page',24)}</h3>{price != null ? <div className={styles.price}>{price}</div> : url ? <div className={styles.link}><Link2 aria-hidden="true"/><a href={url} target="_blank" rel="noreferrer" title={url} aria-label={`Open ${page.title || "landing page"}: ${url}`}>/{shorten(page.slug,7)}</a><button type="button" onClick={onCopy} aria-label={`Copy link for ${page.title}`}><Copy/></button></div> : <div className={styles.link}/> }
  <button type="button" role={onToggle ? "switch" : undefined} aria-checked={onToggle ? active : undefined} aria-label={`${active?'Deactivate':'Activate'} ${page.title}`} title={active?'Click to deactivate':'Click to activate'} disabled={!onToggle || busy || page.availability==='plan_required'} className={`${styles.badge} ${active?styles.active:styles.inactive}`} onClick={()=>onToggle?.(!active)}><span/>{statusLabel || (active?'Active':page.availability==='plan_required'?'Plan required':'Inactive')}</button></div>
  <div ref={root} className={styles.more} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=[...menu.current.querySelectorAll('[role="menuitem"]:not(:disabled)')];const n=items.indexOf(document.activeElement);items[e.key==='Home'?0:e.key==='End'?items.length-1:(n+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus()}if(e.key==='Tab')setOpen(false)}}><button ref={trigger} className={styles.trigger} aria-label={`More actions for ${page.title}`} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={()=>{setPosition(null);setOpen(!open)}}><MoreHorizontal/></button>
  {open&&createPortal(<div ref={menu} style={{position:"fixed",left:position?.left || 0,top:position?.top || 0,right:"auto",width:position?.width || 169,maxHeight:position?.maxHeight,visibility:position?"visible":"hidden",transformOrigin:position?.up?"bottom right":"top right"}} id={id} role="menu" aria-label="Page actions" className={`${styles.menu} ${styles.portalMenu}`}>{[[BarChart3,entity==='link'?'Click statistics':'Views & clicks',onStats],[CopyPlus,`Duplicate ${entity}`,onDuplicate],[Copy,'Copy link',url?onCopy:null],[Pencil,`Edit ${entity}`,onEdit],[ExternalLink,`View ${entity}`,url?()=>window.open(url,'_blank','noopener,noreferrer'):null],...(page.hasLeadForm&&onLeads?[[Users,`View leads (${page.leadsCount || 0})`,onLeads]]:[]),[Trash2,`Delete ${entity}`,onDelete]].filter(([, ,fn])=>typeof fn==='function').map(([Icon,label,fn])=><button key={label} role="menuitem" disabled={busy} className={label.startsWith('Delete ')?styles.danger:''} onClick={action(fn)}><Icon/>{label}</button>)}</div>,document.body)}</div>
  <div className={styles.actions}><button type="button" className={styles.edit} onClick={onEdit}><Pencil aria-hidden="true"/>Edit</button>{onStats && <button type="button" className={styles.analytics} onClick={onStats} aria-label={`View statistics: ${page.viewsCount || 0} views, ${page.clicksCount || 0} clicks`} title={`${page.viewsCount || 0} views · ${page.clicksCount || 0} clicks`}><BarChart3 aria-hidden="true"/></button>}</div>
 </article>;
}
