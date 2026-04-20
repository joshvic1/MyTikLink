import styles from "./FinalCta.module.css";

export default function FinalCTA() {
  // Link button to dashbooard
  const handleGetStarted = () => {
    // Implementation for linking to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2>Start Building Your Pages and See Results For Yourself</h2>

        <div className={styles.buttons}>
          <button className={styles.primary} onClick={handleGetStarted}>
            Get Started
          </button>
          <button className={styles.secondary}>Ask a Question</button>
        </div>
      </div>
    </section>
  );
}
