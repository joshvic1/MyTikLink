"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";

export default function Hero({ openAuth, isLoggedIn = false }) {
  const router = useRouter();

  const goToDashboardOrRegister = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
      return;
    }

    openAuth("register");
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1 className={styles.heading}>
            <span>Turn your ads clicks into</span>
            <span>Sales & Traffic</span>
          </h1>

          <p className={styles.sub}>
            Create high-converting pages in minutes, capture people, make sales
            or send traffic to WhatsApp, Telegram or anywhere you want.
          </p>

          <div className={styles.cta}>
            <button
              className={styles.primaryBtn}
              onClick={goToDashboardOrRegister}
            >
              Get Started Free
            </button>

            <button
              className={styles.primaryBtn2}
              onClick={() => openAuth("login")}
            >
              Login
            </button>
          </div>

          <div className={styles.cards}>
            {[
              "Landing Page",
              "Lead Capture",
              "Link in bio",
              "Analytics",
              "Integrations",
            ].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.mock}>
            <Image
              src="/hero2.png"
              alt="Mytiklink page builder preview"
              width={760}
              height={1350}
              priority
              sizes="(max-width: 700px) 92vw, 380px"
              className={styles.image}
            />

            <div className={styles.videoOverlay}>
              <div className={styles.playButton}>▶</div>

              <div className={styles.videoText}>
                <span className={styles.playSmall}>Play this video</span>
                <span className={styles.playBig}>
                  Watch how MyTikLink works
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
