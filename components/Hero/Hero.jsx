import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Heading */}
        <h1 className={styles.heading}>
          Turn Your Ad Clicks Into <br />
          <span>Real Customers</span>
        </h1>

        {/* Sub */}
        <p className={styles.sub}>
          Run TikTok & Facebook ads → send people to a simple page → collect
          leads → close on WhatsApp.
        </p>

        <p className={styles.trust}>No coding • No stress • Works in minutes</p>

        {/* CTA */}
        <div className={styles.cta}>
          <button className={styles.primaryBtn}>Get Started Free</button>
          <button className={styles.secondaryBtn}>Watch Demo</button>
        </div>

        {/* Cards */}
        <div className={styles.cards}>
          <div className={styles.card}>Landing Page</div>
          <div className={styles.card}>Lead Capture</div>
          <div className={styles.card}>WhatsApp</div>
          <div className={styles.card}>Analytics</div>
        </div>
      </div>
    </section>
  );
}
