import { FaWhatsapp } from "react-icons/fa";
import styles from "./Footer.module.css";
import {
  Instagram,
  Youtube,
  Send, // Telegram
  MessageCircle, // WhatsApp
  Music2, // TikTok vibe
} from "lucide-react";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* TOP GRID */}
        <div className={styles.grid}>
          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Templates</a>
            <a href="#">New/Upcoming features</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="/blog">Blog</a>
            <a href="#">Affiliate Program</a>
            <a href="#">Contact us</a>
          </div>

          <div>
            <h4>Resources</h4>
            <a href="#">Help Center</a>
            <a href="#features">How it Works</a>
            <a href="#">Ads Stategy Guide</a>
            <a href="#">Community</a>
          </div>

          <div>
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="#">Cookies</a>
            <a href="#">Security</a>
          </div>
        </div>

        {/* DIVIDER */}
        <div className={styles.divider} />

        {/* BOTTOM */}
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} MytikLink. All rights reserved.</p>

          <div className={styles.socials}>
            <a href="/p/mytiklink">
              <FaWhatsapp size={18} />
            </a>
            <a
              href="https://t.me/mytiklink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send size={18} />
            </a>
            <a
              href="https://www.instagram.com/mytiklink/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@mytiklink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Music2 size={18} />
            </a>
            <a href="#">
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
