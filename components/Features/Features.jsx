import styles from "./Features.module.css";
import { motion } from "framer-motion";
import {
  Rocket,
  Users,
  BarChart3,
  Megaphone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  SquareStack,
  FileText,
  LayoutTemplate,
  Link,
  Share2,
  Layers,
  Send,
  ArrowRightCircle,
  Navigation,
  UserPlus,
  Inbox,
  Download,
  Activity,
  LineChart,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

export default function Features() {
  return (
    <motion.section
      className={styles.section}
      id="features"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className={styles.container}>
        {/* TOP TEXT */}
        <motion.div
          className={styles.top}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <div className={styles.badge} id="features">
              <span className={styles.badgeText}>Our Features</span>
              <div className={styles.badgeArrow}>
                <ArrowRight size={14} />
              </div>
            </div>
            <h2>Everything you can do With MytikLink</h2>
          </div>

          {/* <p>
            MytikLink is built to help you capture real leads and close more
            sales on WhatsApp. Here’s how we do it:MytikLink is built to help
            you capture real leads and close more sales on WhatsApp. Here’s how
            we do it:MytikLink is built to help you capture real leads and close
            more sales on WhatsApp. Here’s how we do it:MytikLink is built to
            help you
          </p> */}
        </motion.div>

        {/* GRID */}
        <motion.div
          className={styles.grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {/* BIG CARD */}
          <motion.div
            className={`${styles.card} ${styles.big} ${styles.teal}`}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--x",
                `${e.clientX - rect.left}px`,
              );
              e.currentTarget.style.setProperty(
                "--y",
                `${e.clientY - rect.top}px`,
              );
            }}
          >
            <div className={styles.cardTop}>
              <div className={styles.icon}>
                <SquareStack size={14} />
              </div>

              <div className={`${styles.arrow} ${styles.tealArrow}`}>
                <ArrowRight size={14} />
              </div>
            </div>

            <h3>Create pages in minutes</h3>
            <p>
              Launch clean, ready-to-use pages fast, no technical setup neeeded.
            </p>
            <div className={styles.imgWrap}>
              <motion.img
                src="/image0.png"
                alt=""
                className={styles.featureImg}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>
            <motion.div
              className={`${styles.card} ${styles.yellow}`}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--x",
                  `${e.clientX - rect.left}px`,
                );
                e.currentTarget.style.setProperty(
                  "--y",
                  `${e.clientY - rect.top}px`,
                );
              }}
            >
              <div className={styles.cardTop}>
                <div className={styles.icon}>
                  <Link size={14} />
                </div>
                <div className={`${styles.arrow} ${styles.yellowArrow}`}>
                  <ArrowRight size={14} />
                </div>
              </div>

              <h3>One Link For Everything</h3>
              <p>
                Add all your links (WhatsApp, Instagram, website, etc.) in one
                place.
              </p>
              <div className={styles.imgWrap2}>
                <motion.img
                  src="/image2.png"
                  alt=""
                  className={styles.featureImg2}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>

            <motion.div
              className={`${styles.card} ${styles.green}`}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--x",
                  `${e.clientX - rect.left}px`,
                );
                e.currentTarget.style.setProperty(
                  "--y",
                  `${e.clientY - rect.top}px`,
                );
              }}
            >
              <div className={styles.cardTop}>
                <div className={styles.icon}>
                  <Send size={14} />
                </div>
                <div className={`${styles.arrow} ${styles.greenArrow}`}>
                  <ArrowRight size={14} />
                </div>
              </div>

              <h3>Send People Anywhere You Want</h3>
              <p>
                Direct your traffic to Whatsapp, Telegram, Instagram, or any
                other destination.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* BOTTOM GRID */}
        <div className={styles.bottomGrid}>
          <motion.div
            className={`${styles.card} ${styles.purple}`}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--x",
                `${e.clientX - rect.left}px`,
              );
              e.currentTarget.style.setProperty(
                "--y",
                `${e.clientY - rect.top}px`,
              );
            }}
          >
            <div className={styles.cardTop}>
              <div className={`${styles.icon} ${styles.purpleIcon}`}>
                <Download size={14} />
              </div>
              <div className={`${styles.arrow} ${styles.purpleArrow}`}>
                <ArrowRight size={14} />
              </div>
            </div>
            <h3>Capture People Before They Leave</h3>
            <p>Collect names and contacts from your visitors easily.</p>
            <div className={styles.imgWrap2}>
              <motion.img
                src="/image4.png"
                alt=""
                className={styles.featureImg2}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          <motion.div
            className={`${styles.card} ${styles.blue}`}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--x",
                `${e.clientX - rect.left}px`,
              );
              e.currentTarget.style.setProperty(
                "--y",
                `${e.clientY - rect.top}px`,
              );
            }}
          >
            <div className={styles.cardTop}>
              <div className={`${styles.icon} ${styles.blueIcon}`}>
                <Zap size={14} />
              </div>
              <div className={`${styles.arrow} ${styles.blueArrow}`}>
                <ArrowRight size={14} />
              </div>
            </div>
            <h3>Works with TikTok & Meta ads</h3>
            <p>
              Designed to help your ad clicks turn into real sales and traffic
            </p>
            <div className={styles.imgWrap2}>
              <motion.img
                src="/image5.png"
                alt=""
                className={styles.featureImg2}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          <motion.div
            className={`${styles.card} ${styles.gray}`}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--x",
                `${e.clientX - rect.left}px`,
              );
              e.currentTarget.style.setProperty(
                "--y",
                `${e.clientY - rect.top}px`,
              );
            }}
          >
            <div className={styles.cardTop}>
              <div className={`${styles.icon} ${styles.grayIcon}`}>
                <Activity size={14} />
              </div>
              <div className={`${styles.arrow} ${styles.grayArrow}`}>
                <ArrowRight size={14} />
              </div>
            </div>
            <h3>Pixel Ready For Better Tracking</h3>
            <p>Install your ad pixels easily and track performance properly</p>
            <div className={styles.imgWrap2}>
              <motion.img
                src="/image6.png"
                alt=""
                className={styles.featureImg2}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
