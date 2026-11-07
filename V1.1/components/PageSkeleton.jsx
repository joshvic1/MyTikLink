import styles from './PageSkeleton.module.css';
export default function PageSkeleton(){return <div className={styles.skeleton} role="status" aria-label="Loading page content"><span className={styles.title}/><span className={styles.search}/><div className={styles.cards}>{[0,1,2].map(i=><span key={i}/>)}</div></div>}
