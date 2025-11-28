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

  const testimonialsTop = [
    "This platform really helped me reduce all the back-and-forth I usually have with customers. People now join my WhatsApp group directly from TikTok without any stress, and everything works smoothly even for just 2k. I’m honestly impressed because it has removed a big load from my head. Thank you so much boss 🙏🏿. I’ll definitely be coming back soon to upgrade to the pro once I finish setting up everything properly.",

    "Good evening sir. I finally got my way around the setup and the whole thing is surprisingly easy and extremely fast. I didn’t expect it to be this straightforward at all. Thank you so much... you’ve genuinely made my day easier like this 🥹. And abeg forgive my impatience earlier 😅. The link is working perfectly well now and customers are flowing in without any stress at all.",

    "This link made it very easy for people to message me directly on WhatsApp without that usual problem of asking them to download the app first. I’m honestly so happy because I’ve tried several links before and it always gave the same story.. issues, errors, or confusion. But this one is different, fast, reliable, and extremely easy for customers to use. I really love it, truly.",

    "I honestly need to commend the people that created this website. God bless them because they really thought about business owners. My business has not moved this smoothly and easily in a long while. Everything works fast, clean, and without stress. It has removed so many small issues I used to face on TikTok and has made customer conversion very straightforward for me.",

    "Omo! Other websites go think say na AI 😂. This one is too smooth and it’s a hotcake. I’m not even ready to cast it because once too many people see it, they might increase the price for us. The link is clean, fast, and very reliable. I love how professional everything feels and how it has helped my page grow without any stress.",
  ];

  const testimonialsBottom = [
    "So there’s actually a website like this and nobody told us? 😭 Nigerians and hoarding updates sha. This thing is extremely helpful, especially for small business owners like me. My old TikTok link was basically for decoration because it never worked. But once I switched to this one, everything changed. Nobody even enters my TikTok DM anymore — they go straight to WhatsApp smoothly.",

    "Finally! A TikTok link-in-bio that ACTUALLY works 🤭. No glitches, no long story, everything is smooth and professional. I really love how fast the redirect is and how customers don’t even complain. It feels like something every seller should be using because it just makes everything easier and more organized.",

    "You can tell the person who built this website really had business owners in mind. It has removed the stress of adding customers to my WhatsApp group one by one. Now people just join directly from my bio without me lifting a finger. The whole process is fast, simple, and honestly well-thought-out.",

    "The dashboard is clean, fast and stress-free. I especially love the templates section, it makes my link page look very organized and professional without me stressing myself. Everything loads instantly and customers navigate without any issues. I honestly recommend it for anyone selling on TikTok.",

    "Honestly, I wasn’t expecting this to work the way it’s been working. I thought it would lag or give errors like the other platforms I’ve tried, but it has been perfect so far. Smooth redirects, zero problems, and very dependable. I didn’t think it would be this reliable, but it has exceeded my expectations. I fully recommend it!",
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
          <h2 className={styles.title}>Testimonials</h2>
          <p className={styles.sub}>
            Reviews from some of the creators and business owners thats used
            TikLink to change their TikTok to WhatsApp link experience.
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
            {testimonialsTop.concat(testimonialsTop).map((text, index) => (
              <div key={`row1-${index}`} className={styles.card}>
                <span className={styles.quoteMark}>"</span>

                <p>{text}</p>

                <div className={styles.profile}>
                  <div className={styles.badge}>
                    {text.trim().charAt(0).toUpperCase()}
                  </div>

                  <div className={styles.profileText}>
                    <span className={styles.name}>TikLink User</span>
                    {/* <span className={styles.role}>Small Business Owner</span> */}
                  </div>
                </div>
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
            {testimonialsBottom
              .concat(testimonialsBottom)
              .map((text, index) => (
                <div key={`row2-${index}`} className={styles.cardAlt}>
                  <span className={styles.quoteMark}>"</span>

                  <p>{text}</p>

                  <div className={styles.profile}>
                    <div className={styles.badge}>
                      {text.trim().charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.profileText}>
                      <span className={styles.name}>TikLink User</span>
                      <span className={styles.role}>Content Creator</span>
                    </div>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
