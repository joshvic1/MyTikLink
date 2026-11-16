"use client";
import styles from "@/styles/Privacy.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        {/* Header */}
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          Last Updated: <span>[28/11/2025]</span>
        </p>

        <section id="referral-program" style={{scrollMarginTop:100,padding:'20px',border:'1px solid #e6dcf3',borderRadius:16,background:'#faf7ff',marginBottom:24}}>
          <h2 className={styles.sectionTitle}>Referrals and your information</h2>
          <p className={styles.text}>When you register using a referral link or code, MyTikLink may share your name, business name, joining date, subscription plan and referral conversion status with the person who referred you. They can also see the reward earned from your qualifying purchases. Your email address is not shared through the referral list.</p>
          <p className={styles.text}>Your WhatsApp number is shared only if you separately allow referral-related contact in Affiliate &amp; referrals → Your referral contact preference. We use the WhatsApp number already saved to your account. Agreeing to these terms or receiving MyTikLink marketing emails does not grant that permission. You can turn it off at any time; your number will no longer be available to your referrer through MyTikLink.</p>
          <p className={styles.text}>Referrers may use authorised contact details only to help you with MyTikLink. Harassment, spam, resale, third-party sharing and unrelated marketing are prohibited. They must stop contacting you when you withdraw permission. Contact support@mytiklink.com to object to contact or report misuse. <a href="/privacy#referral-program">Read the referral privacy provisions.</a></p>
        </section>
        {/* Body */}
        <section>
          <p className={styles.text}>
            Your privacy is important to us. This Privacy Policy explains how
            <strong> TikLink </strong> collects, uses, stores, and protects your
            information when using our platform, websites, and related services.
          </p>

          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>

          <p className={styles.text}>We may collect the following:</p>

          <ul className={`${styles.list} ${styles.text}`}>
            <li>
              <strong>Account Information:</strong> Name, email address,
              password.
            </li>
            <li>
              <strong>Usage Data:</strong> Clicks, redirects, device
              information.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, OS,
              cookies.
            </li>
            <li>
              <strong>Payment Data:</strong> Billing information (processed by
              secure third-party providers).
            </li>
          </ul>

          <h2 className={styles.sectionTitle}>2. How We Use Information</h2>

          <div className={styles.block}>
            <ul className={`${styles.list} ${styles.text}`}>
              <li>To create and manage your TikLink account</li>
              <li>To generate analytics and insights for your links</li>
              <li>To personalize your dashboard experience</li>
              <li>To prevent fraudulent or abusive activity</li>
              <li>To process payments securely</li>
              <li>To improve platform stability and performance</li>
            </ul>
          </div>

          <h2 className={styles.sectionTitle}>3. Cookies & Tracking</h2>
          <p className={styles.text}>
            We use cookies, device identifiers, and tracking technologies to
            improve user experience, analyze performance, and ensure security.
          </p>

          <h2 className={styles.sectionTitle}>4. How We Share Your Data</h2>
          <p className={styles.text}>
            We do <strong>not</strong> sell your data. However, we may share
            information with:
          </p>

          <ul className={`${styles.list} ${styles.text}`}>
            <li>Payment processors (for subscriptions)</li>
            <li>Analytics tools</li>
            <li>Fraud/abuse prevention services</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2 className={styles.sectionTitle}>5. Data Security</h2>
          <p className={styles.text}>
            We implement industry-standard measures, including encryption,
            access control, and secure storage practices. However, no system is
            100% secure.
          </p>

          <h2 className={styles.sectionTitle}>6. Your Rights</h2>
          <p className={styles.text}>
            Depending on your region, you may have the right to:
          </p>

          <ul className={`${styles.list} ${styles.text}`}>
            <li>Access data we store about you</li>
            <li>Request correction or deletion</li>
            <li>Disable cookies or tracking</li>
            <li>Request a copy of your data</li>
          </ul>

          <h2 className={styles.sectionTitle}>7. Data Retention</h2>
          <p className={styles.text}>
            We keep your information only as long as needed for account
            functionality, legal obligations, and security purposes.
          </p>

          <h2 className={styles.sectionTitle}>8. Children's Privacy</h2>
          <p className={styles.text}>
            TikLink is not intended for children under 13. We do not knowingly
            collect information from minors.
          </p>

          <h2 className={styles.sectionTitle}>9. Updates to This Policy</h2>
          <p className={styles.text}>
            We may update this Privacy Policy at any time. Significant changes
            will be communicated through email or platform notifications.
          </p>

          <h2 className={styles.sectionTitle}>10. Contact Us</h2>
          <p className={styles.text}>
            If you have questions or requests, reach out at:{" "}
            <strong>privacy@mytiklink.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
