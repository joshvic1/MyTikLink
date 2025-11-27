import styles from "@/styles/Footer.module.css";
import { FaTwitter, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.inner}>
        {/* Column 1 - Brand */}
        <div className={styles.col}>
          <h3 className={styles.logo}>
            <span className={styles.accent}>Tik</span>Link
          </h3>
          <p className={styles.desc}>
            Smart links & analytics built for creators and businesses on TikTok
          </p>

          <b className={styles.desc}>Email: support@MyTikLink.com</b>

          <div className={styles.social}>
            <a href="/" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
          </div>
        </div>

        {/* Column 2 - Links */}
        <div className={styles.col}>
          <h4>Product</h4>
          <ul>
            <li>
              <a href="/#features">Features</a>
            </li>
            <li>
              <a href="/#pricing">Pricing</a>
            </li>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/#contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* Column 3 - Legal */}
        <div className={styles.col}>
          <h4>Company</h4>
          <ul>
            <li>
              <a href="/#about">About Us</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Use</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} TikLink - All rights reserved.
      </div>
    </footer>
  );
}
