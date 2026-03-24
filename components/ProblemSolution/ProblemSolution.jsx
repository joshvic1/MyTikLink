import styles from "./ProblemSolution.module.css";

export default function ProblemSolution() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Heading */}
        <h2 className={styles.heading}>
          Stop Wasting Your <span className={styles.highlight}>Ad Traffic</span>
        </h2>

        {/* Sub */}
        <p className={styles.sub}>Turn every click into a real customer.</p>

        {/* Tags */}
        <div className={styles.tags}>
          <span className={styles.tag}>Landing page</span>
          <span className={styles.tag}>Lead capture form</span>
          <span className={styles.tag}>WhatsApp redirect</span>
          <span className={styles.tag}>Track results</span>
        </div>

        {/* CTA */}
        <button className={styles.button}>👉 Create Your First Page</button>
      </div>
    </section>
  );
}
