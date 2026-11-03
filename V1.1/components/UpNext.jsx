import StarterPageThumbnail from "./StarterPageThumbnail";
import { ArrowRight, X } from "lucide-react";
import { Button } from "./UI";
import styles from "../styles/v11.module.css";
import card from "./UpNext.module.css";

export function UpNext({ action, onAction, onDismiss, onSecondary, page }) {
  return <section className={`${styles.upNextCard} ${styles[`upNext_${action.tone}`]} ${card.card}`} aria-label="Up next">
    <div className={styles.upNextVisual} aria-hidden="true">{page?<StarterPageThumbnail page={page}/>:<img src={action.image} width="640" height="427" alt="" decoding="async"/>}</div>
    <div className={styles.upNextContent}><button className={styles.upNextDismiss} type="button" aria-label="Dismiss this suggestion" onClick={onDismiss}><X/></button><span className={styles.eyebrow}>UP NEXT</span><h2>{action.title}</h2><p>{action.description}</p><div className={styles.upNextActions}><Button onClick={onAction}>{action.ctaLabel || action.action}<ArrowRight/></Button>{onSecondary&&<button className={styles.sectionLink} onClick={onSecondary}>Preview landing page <ArrowRight size={14}/></button>}</div></div>
  </section>;
}
