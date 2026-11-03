import styles from './CompactLoading.module.css';
export default function CompactLoading({label='Getting things ready…'}) {
  return <div className={styles.loading} role="status" aria-live="polite"><span className={styles.orbit} aria-hidden="true"><i/><i/><i/></span><span>{label}</span></div>;
}
