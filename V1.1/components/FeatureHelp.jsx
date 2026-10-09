import { Button, Modal } from "./UI";
import styles from "../styles/v11.module.css";
export function FeatureHelp({ feature, onClose, onStart }) {
  const Icon = feature.Icon;
  return <Modal className={`${styles.featureHelpModal} ${styles[feature.modalClass]}`} title={feature.dashboardTitle} description={feature.shortDescription} onClose={onClose} footer={<Button onClick={onStart}>Get started</Button>}>
    <div className={styles.featureHelpHero}><Icon/><span>{feature.title}</span></div>
    <div className={styles.featureExplainer}><section><b>When to use it</b><p>{feature.helpDescription}</p></section><section><b>How it works</b><p>{feature.example}</p></section><aside>You can edit your content and check its performance from your dashboard at any time.</aside></div>
  </Modal>;
}
