import styles from "../styles/v11.module.css";
import { AlertCircle, ArrowRight, FileText, Link2, ShoppingBag, Sparkles, X } from "lucide-react";
import { forwardRef, useEffect, useRef } from "react";

export function Button({ variant = "primary", className = "", children, ...props }) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}>{children}</button>;
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
  return <header className={styles.pageHeader}><div>{eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className={styles.headerActions}>{actions}</div>}</header>;
}

export function EmptyState({ icon, title, description, action }) {
  const resolvedIcon = typeof icon !== "string" ? icon : icon === "▣" ? <FileText/> : icon === "↗" ? <Link2/> : icon === "◇" ? <ShoppingBag/> : <Sparkles/>;
  return <div className={styles.emptyState}><span className={styles.emptyIcon}>{resolvedIcon || <Sparkles/>}</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = "Loading your workspace…" }) {
  return <div className={styles.loadingState} aria-busy="true" aria-label={label}><div className={styles.loadingSkeleton}><span className={styles.skeletonLogo}/><span className={styles.skeletonLine}/><span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}/><div className={styles.skeletonGrid}>{[0,1,2].map((item) => <span key={item} className={styles.skeletonCard}/>)}</div></div><p>{label}</p></div>;
}

export function ErrorState({ title = "We couldn’t load this", message, onRetry }) {
  return <div className={styles.errorState}><span><AlertCircle/></span><div><h2>{title}</h2><p>{message || "Check your connection and try again."}</p></div>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}

export function Field({ label, hint, error, children }) {
  return <label className={styles.field}><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className={styles.fieldError}>{error}</small>}</label>;
}

export function Modal({ title, description, onClose, children, footer, wide = false }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () => [...(dialog?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])];
    focusable()[0]?.focus();
    const keydown = (event) => { if (event.key === "Escape") onClose(); if (event.key === "Tab") { const nodes = focusable(); if (!nodes.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = originalOverflow; previous?.focus?.(); };
  }, [onClose]);
  return <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} className={`${styles.modal} ${wide ? styles.modalWide : ""}`} role="dialog" aria-modal="true" aria-label={title}><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div><IconButton label="Close" onClick={onClose}><X/></IconButton></header><div className={styles.modalBody}>{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}
