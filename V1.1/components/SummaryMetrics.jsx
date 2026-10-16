import styles from "../styles/v11.module.css";

export function SummaryMetrics({ label, items }) {
  return <section className={styles.summaryMetricGrid} aria-label={label}>
    {items.map(({ label, value }) => <div className={styles.summaryMetricCard} key={label}>
      <span>{label}</span>
      <strong>{value == null ? "—" : Number(value).toLocaleString()}</strong>
    </div>)}
  </section>;
}
