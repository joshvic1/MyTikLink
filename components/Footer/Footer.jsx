import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top */}
        <div className={styles.top}>
          <div className={styles.logo}>MyTikLink</div>

          <div className={styles.links}>
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">How It Works</a>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} MyTikLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
