"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Showcase.module.css";

export default function Showcase() {
  const row1 = useRef(null);
  const row2 = useRef(null);

  useEffect(() => {
    let frame1 = null;
    let frame2 = null;

    const startScroll = (el, dir, setFrame) => {
      let x = 0;

      const animate = () => {
        x += 0.5 * dir; // scroll speed (nice and slow)
        const max = el.scrollWidth / 2;

        if (dir === 1 && x >= max) x = 0;
        if (dir === -1 && x <= 0) x = max;

        el.scrollTo(x, 0);
        const id = requestAnimationFrame(animate);
        setFrame(id);
      };

      animate();
    };

    if (row1.current) {
      startScroll(row1.current, 1, (id) => {
        frame1 = id;
      });
    }

    if (row2.current) {
      startScroll(row2.current, -1, (id) => {
        frame2 = id;
      });
    }

    return () => {
      if (frame1 !== null) cancelAnimationFrame(frame1);
      if (frame2 !== null) cancelAnimationFrame(frame2);
    };
  }, []);

  const rowTop = [
    "/images/showcase-tiktok-flow.png",
    "/images/feature-templates.png",
    "/images/how-1.png",
    "/images/how-2.png",
    "/images/how-3.png",
  ];

  const rowBottom = [
    "/images/feature-analytics.png",
    "/images/showcase-tiktok-flow.png",
    "/images/how-3.png",
    "/images/feature-templates.png",
    "/images/how-2.png",
  ];

  const headerVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const rowLeft = {
    hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const rowRight = {
    hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Heading */}
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.title}>See TikLink in action</h2>
          <p className={styles.sub}>
            Real previews of how TikTok clicks move instantly to WhatsApp, no
            lag, just smooth connection.
          </p>
        </motion.div>

        {/* Floating gradient background */}
        <div className={styles.bgGlow}></div>

        {/* Auto-scrolling rows */}
        <div className={styles.scrollerWrapper}>
          <motion.div
            className={styles.row}
            ref={row1}
            variants={rowLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {rowTop.concat(rowTop).map((src, index) => (
              <div key={`row1-${index}`} className={styles.card}>
                <img src={src} alt="" />
              </div>
            ))}
          </motion.div>

          <motion.div
            className={styles.rowAlt}
            ref={row2}
            variants={rowRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {rowBottom.concat(rowBottom).map((src, index) => (
              <div key={`row2-${index}`} className={styles.cardAlt}>
                <img src={src} alt="" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
