import ThemeRenderer from "./ThemeRenderer";
import styles from "./ThemeStudio.module.css";
export default function ThemePreviewViewport({instance,device="desktop"}) {return <div className={styles.viewport}><div className={styles.previewPage} style={{width:device==="mobile"?390:1024,maxWidth:"100%"}}><ThemeRenderer instance={instance} preview/></div></div>;}
