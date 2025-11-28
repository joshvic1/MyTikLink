"use client";
import styles from "@/styles/Terms.module.css";

export default function TermsAndConditions() {
  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        {/* Heading */}
        <h1 className={styles.title}>Terms & Conditions</h1>
        <p className={styles.subtitle}>
          Last Updated: <span>[28/11/2025]</span>
        </p>

        {/* Body */}
        <section>
          <p className={styles.text}>
            These Terms & Conditions (“Terms”) govern your use of{" "}
            <strong>TikLink</strong>
            -and all related services. By accessing or using our platform, you
            agree to these Terms in full.
          </p>

          <h2 className={styles.sectionTitle}>1. Eligibility</h2>
          <p className={styles.text}>
            You must be at least 13 years old and legally able to create an
            account.
          </p>

          <h2 className={styles.sectionTitle}>2. Account Responsibilities</h2>
          <ul className={`${styles.list} ${styles.text}`}>
            <li>
              You are responsible for safeguarding your login credentials.
            </li>
            <li>
              You accept liability for all activity that occurs under your
              account.
            </li>
            <li>
              You must notify us immediately of unauthorized access or misuse.
            </li>
          </ul>

          <h2 className={styles.sectionTitle}>3. Acceptable Use</h2>
          <p className={styles.text}>You agree NOT to use TikLink for:</p>
          <ul className={`${styles.list} ${styles.text}`}>
            <li>Fraud, phishing, spam, or any illegal activities.</li>
            <li>Distribution of malware, harmful content, or exploits.</li>
            <li>Impersonation or deceptive redirect behavior.</li>
            <li>Interference with platform systems, analytics, or security.</li>
          </ul>

          <h2 className={styles.sectionTitle}>4. Subscription & Billing</h2>
          <div className={styles.block}>
            <ul className={`${styles.list} ${styles.text}`}>
              <li>Paid plans renew automatically unless canceled.</li>
              <li>Payments are handled by trusted third-party processors.</li>
              <li>Chargebacks may result in immediate account suspension.</li>
            </ul>
          </div>

          <h2 className={styles.sectionTitle}>5. Redirect Services</h2>
          <p className={styles.text}>
            You are responsible for ensuring your redirect destinations comply
            with all laws and do not violate platform rules. Abusive patterns
            may result in redirect throttling or suspension.
          </p>

          <h2 className={styles.sectionTitle}>6. Service Availability</h2>
          <p className={styles.text}>
            We strive for high uptime but do not guarantee uninterrupted access,
            error-free performance, or real-time analytics accuracy.
          </p>

          <h2 className={styles.sectionTitle}>7. Termination</h2>
          <p className={styles.text}>
            We may suspend or terminate accounts that violate these Terms or
            engage in harmful usage.
          </p>

          <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
          <p className={styles.text}>
            TikLink is not liable for direct, indirect, incidental, or
            consequential damages, including lost revenue, data loss, or
            business interruption.
          </p>

          <h2 className={styles.sectionTitle}>9. Changes to These Terms</h2>
          <p className={styles.text}>
            We may update these Terms at any time. Continued use of the platform
            indicates acceptance of the updated Terms.
          </p>

          <h2 className={styles.sectionTitle}>10. Contact Us</h2>
          <p className={styles.text}>
            For questions or support, email us at:{" "}
            <strong>support@mytiklink.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
