import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>MyTikLink</div>

        {/* Links */}
        <nav className={styles.navLinks}>
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">How It Works</a>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.secondaryBtn}>Watch Demo</button>
          <button className={styles.primaryBtn}>Get Started Free</button>
        </div>
      </div>
    </header>
  );
}
