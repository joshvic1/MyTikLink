import {useLayoutEffect} from "react";
import {createPortal} from "react-dom";
const modalStack=[];
let restoreModalScroll=null;
function lockModalScroll(){
 const body=document.body,root=document.documentElement,x=window.scrollX,y=window.scrollY;
 const properties=['position','top','left','right','width','overflow','padding-right'];
 const saved=properties.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)]);
 const gap=Math.max(0,window.innerWidth-root.clientWidth);
 const padding=parseFloat(getComputedStyle(body).paddingRight)||0;
 body.style.setProperty('position','fixed','important');body.style.setProperty('top',`-${y}px`,'important');body.style.setProperty('left',`-${x}px`,'important');body.style.setProperty('right','0','important');body.style.setProperty('width','100%','important');body.style.setProperty('overflow','hidden','important');
 if(gap)body.style.setProperty('padding-right',`${padding+gap}px`,'important');
 return()=>{saved.forEach(([name,value,priority])=>{if(value)body.style.setProperty(name,value,priority);else body.style.removeProperty(name);});const behavior=root.style.getPropertyValue('scroll-behavior'),priority=root.style.getPropertyPriority('scroll-behavior');root.style.setProperty('scroll-behavior','auto','important');window.scrollTo(x,y);if(behavior)root.style.setProperty('scroll-behavior',behavior,priority);else root.style.removeProperty('scroll-behavior');};
}
import popup from "./PopupChrome.module.css";
import { Breadcrumbs } from "./Breadcrumbs";
import styles from "../styles/v11.module.css";
import { AlertCircle, ArrowRight, FileText, Link2, ShoppingBag, Sparkles, ShieldAlert, X } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

export function Button({ variant = "primary", className = "", children, ...props }) {
  return <button data-popup-action={variant} className={`${styles.button} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export const IconButton = forwardRef(function IconButton({ label, children, className = "", ...props }, ref) {
  return <button ref={ref} aria-label={label} className={`${styles.iconButton} ${className}`} {...props}>{children}</button>;
});

export function Badge({ tone = "neutral", className = "", children }) {
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]} ${className}`}>{children}</span>;
}

export function DashboardActionCard({ count, title, description, action, tone = "violet", onClick }) {
  return <button type="button" className={`${styles.dashboardActionCard} ${styles[`dashboardAction_${tone}`]}`} onClick={onClick}>
    <span className={styles.dashboardActionCount}>{count}</span>
    <span className={styles.dashboardActionBody}>
      <b>{title}</b>
      <small>{description}</small>
      <strong>{action} <ArrowRight aria-hidden="true"/></strong>
    </span>
  </button>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <header className={styles.pageHeader}><div><Breadcrumbs/><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className={styles.headerActions}>{actions}</div>}</header>;
}

export function EmptyState({ icon, title, description, action }) {
  const resolvedIcon = typeof icon !== "string" ? icon : icon === "▣" ? <FileText/> : icon === "↗" ? <Link2/> : icon === "◇" ? <ShoppingBag/> : <Sparkles/>;
  return <div className={styles.emptyState}><span className={styles.emptyIcon}>{resolvedIcon || <Sparkles/>}</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = "Preparing your workspace...", progress }) {
  const hasMeasuredProgress = Number.isFinite(progress);
  const target = hasMeasuredProgress ? Math.max(0, Math.min(100, progress)) : null;
  const [visibleProgress, setVisibleProgress] = useState(hasMeasuredProgress ? 0 : null);
  useEffect(() => { if (target !== null) setVisibleProgress((current) => current === null ? target : Math.max(current, target)); }, [target]);
  return <div className={styles.loadingState} role="status" aria-busy="true" aria-label={label}><div className={styles.loadingScene} aria-hidden="true"><span className={styles.loadingBrandFrame}><img className={styles.loadingBrand} src="/images/mytiklink-mark-black.png" alt="" width="56" height="56"/></span></div><span className={styles.loadingProgress} role={hasMeasuredProgress ? "progressbar" : undefined} aria-label={hasMeasuredProgress ? "Loading progress" : undefined} aria-valuemin={hasMeasuredProgress ? 0 : undefined} aria-valuemax={hasMeasuredProgress ? 100 : undefined} aria-valuenow={hasMeasuredProgress ? visibleProgress : undefined}><span className={styles.loadingProgressFill} style={visibleProgress === null ? undefined : { width: `${visibleProgress}%` }}/></span><span className={styles.loadingLabel}>{label}</span></div>;
}

export function ErrorState({ title = "We couldn’t load this", message, onRetry }) {
  return <div className={styles.errorState}><span><AlertCircle/></span><div><h2>{title}</h2><p>{message || "Check your connection and try again."}</p></div>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}

export function Field({ label, hint, error, children }) {
  return <label className={styles.field}><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className={styles.fieldError}>{error}</small>}</label>;
}

export function Modal({ tone = "purple", title, description, headerContent, headerIcon, headerActions, hideCloseButton = false, onClose, children, footer, wide = false, className = "", style, backdropClassName = "" }) {
  const dialogRef = useRef(null);
  const backdropRef=useRef(null);
  useLayoutEffect(()=>{
   const element=backdropRef.current,viewport=window.visualViewport;
   const update=()=>{if(!element||!window.matchMedia('(max-width:640px), (any-pointer:coarse)').matches)return;if(viewport&&Math.abs(viewport.scale-1)>.05)return;
    element.style.setProperty('--sheet-visible-height',`${viewport?.height||window.innerHeight}px`);
    element.style.setProperty('--sheet-visible-top',`${viewport?.offsetTop||0}px`);
   };update();viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);
   return()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[]);

  const previousFocus = useRef(typeof document!=="undefined"?document.activeElement:null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = previousFocus.current;
    if(!modalStack.length) restoreModalScroll=lockModalScroll();
    const dialog = dialogRef.current;
    modalStack.push(dialog);
    if(backdropRef.current)backdropRef.current.style.zIndex=String(10050+modalStack.length);
    modalStack.forEach(item=>{item.inert=item!==dialog;});
    const focusable = () => [...(dialog?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])];
    focusable()[0]?.focus({preventScroll:true});
    const keydown = (event) => { if(modalStack.at(-1)!==dialog)return; if (event.key === "Escape") closeRef.current(); if (event.key === "Tab") { const nodes = focusable(); if (!nodes.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); const index=modalStack.indexOf(dialog);if(index>=0)modalStack.splice(index,1);modalStack.forEach(item=>{item.inert=item!==modalStack.at(-1);});if(!modalStack.length){restoreModalScroll?.();restoreModalScroll=null;}if(previous?.isConnected)previous.focus?.({preventScroll:true}); };
  }, []);
  return typeof document!=="undefined"?createPortal(<div ref={backdropRef} data-keyboard-sheet="" className={`${styles.modalBackdrop} ${backdropClassName}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} style={style} data-popup-tone={tone} className={`${styles.modal} ${popup.surface} ${wide ? styles.modalWide : ""} ${className}`} role="dialog" aria-modal="true" aria-label={title}><header className={popup.header}><div className={headerIcon ? styles.modalHeadingWithIcon : ""}>{headerIcon && <span className={styles.modalHeaderIcon}>{headerIcon}</span>}<div><h2>{title}</h2>{description && <p>{description}</p>}{headerContent}</div></div>{headerActions?<div style={{display:"flex",alignItems:"center",gap:8}}>{headerActions}{!hideCloseButton&&<IconButton label="Close" onClick={onClose}><X/></IconButton>}</div>:!hideCloseButton&&<IconButton label="Close" onClick={onClose}><X/></IconButton>}</header><div className={`${styles.modalBody} ${/delete|deactivate|activate this/i.test(title)?styles.confirmationBody:""}`}>{/delete|deactivate|activate this/i.test(title)&&<div className={styles.confirmationIntro}><span><ShieldAlert size={23}/></span><div><b>{/delete/i.test(title)?"Review before deleting":"You’re in control"}</b><small>{/delete/i.test(title)?"This action cannot be undone.":"Confirm the visibility change below."}</small></div></div>}{children}</div>{footer && <footer className={popup.footer}>{footer}</footer>}</section></div>,document.body):null;
}
