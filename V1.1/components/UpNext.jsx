import StarterPageThumbnail from "./StarterPageThumbnail";
import { ArrowRight, X } from "lucide-react";
import { Button } from "./UI";
import styles from "../styles/v11.module.css";
import card from "./UpNext.module.css";

export function UpNext({ action, onAction, onDismiss, onSecondary, page, thumbnail, secondaryLabel="Preview" }) {
  if (action.kind === "referral") return <section className={`${styles.upNextCard} ${card.referralBanner}`} aria-label="Referral invitation">
    <div className={card.referralComposition}><img className={card.referralArtwork} src="/images/affiliate/referral-dashboard-v2.webp" alt="Refer 1 person, earn ₦1,000. Invite someone to MyTikLink. Earn ₦1,000 when they make their first Pro Monthly purchase." width="1200" height="600" decoding="async"/>
    <button className={`${styles.upNextDismiss} ${card.referralDismiss}`} type="button" aria-label="Dismiss this suggestion" onClick={onDismiss}><X/></button>
    <div className={card.referralCta}><Button onClick={onAction}>{action.ctaLabel || 'Get your referral link'}<ArrowRight size={14}/></Button></div></div>
  </section>;
  return <section className={`${styles.upNextCard} ${styles[`upNext_${action.tone}`]} ${card.card}`} aria-label="Up next">
    <div className={styles.upNextVisual} aria-hidden="true">{thumbnail || page ? <div className={card.previewMiniature}>{thumbnail || <StarterPageThumbnail page={page}/>}</div> : <img src={action.image} width="640" height="427" alt="" decoding="async"/>}</div>
    <div className={styles.upNextContent}><button className={styles.upNextDismiss} type="button" aria-label="Dismiss this suggestion" onClick={onDismiss}><X/></button><span className={styles.eyebrow}>UP NEXT</span><h2>{action.title}</h2><p>{action.description}</p><div className={styles.upNextActions}><Button onClick={onAction}>{["starter-upgrade","store-upgrade"].includes(action.kind)?"Upgrade":action.ctaLabel || action.action}<ArrowRight/></Button>{onSecondary&&<button className={styles.sectionLink} onClick={onSecondary}>{secondaryLabel} <ArrowRight size={14}/></button>}</div></div>
  </section>;
}
