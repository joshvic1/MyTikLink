import styles from "./Testimonials.module.css";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function Testimonials() {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    const slider = sliderRef.current;

    const handleScroll = () => {
      const cardWidth = slider.children[0].offsetWidth + 20; // gap = 20
      const index = Math.round(slider.scrollLeft / cardWidth);
      setActiveIndex(index);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const slider = sliderRef.current;

    const startScroll = () => {
      intervalRef.current = setInterval(() => {
        if (!slider) return;

        slider.scrollLeft += 0.6; // 🔥 control speed

        // loop back to start
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
          slider.scrollTo({ left: 0, behavior: "auto" });
        }
      }, 16);
    };

    if (!isPaused) {
      startScroll();
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);
  const handlePause = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    setTimeout(() => {
      setIsPaused(false);
    }, 1500); // delay before resume
  };
  const scrollToIndex = (index) => {
    const slider = sliderRef.current;
    const cardWidth = slider.children[0].offsetWidth + 20;

    slider.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* TOP */}
        <div className={styles.top}>
          <div className={styles.badge}>
            <span>Testimonials</span>
            <div className={styles.badgeArrow}>
              <ArrowRight size={14} />
            </div>
          </div>

          <h2>Trusted by Businesses & Influencers</h2>
        </div>

        {/* SLIDER */}
        <div
          className={styles.slider}
          ref={sliderRef}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          {[...Array(2)].map((_, i) => (
            <>
              {/* 👇 KEEP ALL YOUR EXISTING CARDS HERE EXACTLY */}
              {/* CARD 1 */}
              <div className={`${styles.card} ${styles.red}`}>
                <div className={styles.cardTop}>
                  <img src="/user1.png" alt="" />
                  <div>
                    <h4>Joshspot Media</h4>
                    <span>Digital Marketer</span>
                  </div>
                </div>

                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I was using Tiktok Dm's for my ads where most people won't
                      reply. Until i started using Mytiklink , Omo everything
                      just changed, increase in income and quality leads.
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>95%</h3>
                    <p>Increment in quality leads</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* CARD 1 */}
              <div className={`${styles.card} ${styles.purple}`}>
                <div className={styles.cardTop}>
                  <img src="/user2.png" alt="" />
                  <div>
                    <h4>Chinedu Isaac</h4>
                    <span>Business Owner</span>
                  </div>
                </div>

                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I used to send people straight to Tiktok dm for my ads and
                      most of them won't reply. Once I started using MytikLInk,
                      I noticed people coming in are already interested. It just
                      made everything easier.
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>82%</h3>
                    <p>Increment in quality leads</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div className={`${styles.card} ${styles.pink}`}>
                <div className={styles.cardTop}>
                  <img src="/user3.png" alt="" />
                  <div>
                    <h4>Aisha Bello</h4>
                    <span>Skincare Vendor</span>
                  </div>
                </div>

                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I've been getting imaginary clicks on my ads for a while
                      now until oi discovered this website and now the clicks
                      are realand my sales have increased in just few days. The
                      subscription plan is worth it
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>50%</h3>
                    <p>Increase in sales</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 3 */}
              <div className={`${styles.card} ${styles.blue}`}>
                <div className={styles.cardTop}>
                  <img src="/user4.png" alt="" />
                  <div>
                    <h4>Daniel James</h4>
                    <span>Digital Marketer</span>
                  </div>
                </div>
                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I run ads for clients and this helped me a lot. I can
                      easily create a landing page for my clients and send
                      traffic there. It also helps me capture leads and close
                      sales for my clients.
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>4x</h3>
                    <p>Conversion rate increase</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* CARD 4 */}
              <div className={`${styles.card} ${styles.brown}`}>
                <div className={styles.cardTop}>
                  <img src="/user5.png" alt="" />
                  <div>
                    <h4>Tobi Adeyemi</h4>
                    <span>Social Media Influencer</span>
                  </div>
                </div>
                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I used Mytiklink to grow my telegram channel to 50k
                      members in few weeks. Kudos to the team and the marketing
                      guy Josh. God bless you guys.
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>50k+</h3>
                    <p>Members gotten in telegram channel</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* CARD 5 */}
              <div className={`${styles.card} ${styles.red}`}>
                <div className={styles.cardTop}>
                  <img src="/user6.png" alt="" />
                  <div>
                    <h4>Titilayo Grace</h4>
                    <span>Whatsapp Vendor</span>
                  </div>
                </div>
                <div className={styles.contentRow}>
                  {/* LEFT TEXT */}
                  <div className={styles.leftText}>
                    <p>
                      I filled my whatsapp group with interested buyers using
                      the Landing page I created from Mytiklink. This is very
                      amazing, I recommend it to every online seller out there.
                    </p>
                  </div>

                  {/* RIGHT STAT */}
                  <div className={styles.rightStat}>
                    <h3>1,000+</h3>
                    <p>Leads captured in few days</p>

                    <button className={styles.link}>
                      Read the story <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>

        {/* DOTS */}
        <div className={styles.dots}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <span
              key={i}
              className={activeIndex === i ? styles.active : ""}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
