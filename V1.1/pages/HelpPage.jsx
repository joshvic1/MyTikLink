import { BookOpen, CircleHelp, MessageCircle } from "lucide-react";
import { PageHeader } from "../components/UI";
import styles from "../styles/v11.module.css";

export function HelpPage() {
  return <div className={styles.page}><PageHeader eyebrow="HELP & SUPPORT" title="Get unstuck quickly." description="Choose the kind of help you need."/><div className={styles.helpGrid}><a href="/FAQ" target="_blank"><span><CircleHelp/></span><h2>Frequently asked questions</h2><p>Find clear answers about pages, links, stores and plans.</p><strong>Browse answers →</strong></a><a href="https://wa.me/234" target="_blank" rel="noreferrer"><span><MessageCircle/></span><h2>Chat with support</h2><p>Talk to the MyTikLink team on WhatsApp.</p><strong>Open WhatsApp →</strong></a><a href="/store-tutorial" target="_blank"><span><BookOpen/></span><h2>Storefront guide</h2><p>Learn how to set up products and receive orders.</p><strong>View guide →</strong></a></div></div>;
}
