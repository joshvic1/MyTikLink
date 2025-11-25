"use client";
import { ArrowRight } from "lucide-react";
import styles from "@/styles/FinalCTA.module.css";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function FinalCTA() {
  const router = useRouter();
  const { isLoggedIn } = useAuth() || {};

  const handleClick = () => {
    isLoggedIn ? router.push("/dashboard") : router.push("/dashboard");
  };

  return (
    <section className={styles.section}>
      <div className={styles.overlay} />

      <div className={styles.container}>
        <h2 className={styles.title}>Never lose a TikTok click again</h2>
        <p className={styles.sub}>
          Turn your TikTok bio into a direct WhatsApp chat. Create your link in
          seconds.
        </p>
        <button className={styles.btn} onClick={handleClick}>
          Create Free Link <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
