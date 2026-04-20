"use client";
import { useState } from "react";
import styles from "./FAQ.module.css";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is MyTikLink and how does it work?",
    a: "MyTikLink helps you turn your ad clicks into real results. You create a simple page, guide your visitors, and send them to WhatsApp, Telegram, your website, or anywhere you want.",
  },
  {
    q: "Do I need any technical skills to use this?",
    a: "No. Everything is designed to be simple. You can create your page and start using it in minutes without any coding or technical setup.",
  },
  {
    q: "Can I use this with TikTok or Meta ads?",
    a: "Yes. MyTikLink is built basically for TikTok & Meta ads traffic conversion.",
  },
  {
    q: "Will I get real people?",
    a: "Yes. You collect qualified leads before they reach your destination.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes, you can start for free and upgrade as you grow.",
  },
  {
    q: "Can I use this for any type of business?",
    a: "MyTikLink works for e-commerce, local businesses, coaches, agencies, influenecers and more. If you run ads and want to convert clicks into real results, this is for you.",
  },
  {
    q: "Can I track my results and performance?",
    a: "Yes. You can install your ad pixels and track how people interact with your page so you can improve your results over time.",
  },
  {
    q: "What happens when someone visits my page?",
    a: "They see your offer clearly, take action, and then get directed to where you want , making them more likely to respond or buy..",
  },
  {
    q: "How fast can I get started?",
    a: "You can create your page and start using it immediately. Most people set everything up in just a few minutes.",
  },
  {
    q: "Can I connect WhatsApp & Telegram?",
    a: "Yes. You can redirect to WhatsApp, Telegram, or any platform.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const left = faqs.slice(0, 5);
  const right = faqs.slice(5);

  return (
    <section className={styles.section} id="faqs">
      <div className={styles.container}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>

        <div className={styles.grid}>
          {/* LEFT */}
          <div>
            {left.map((item, i) => (
              <div
                key={i}
                className={`${styles.item} ${
                  activeIndex === i ? styles.active : ""
                }`}
                onClick={() => toggle(i)}
              >
                <div className={styles.question}>
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={activeIndex === i ? styles.rotate : ""}
                  />
                </div>

                <div className={styles.answer}>
                  <div className={styles.answerInner}>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div>
            {right.map((item, i) => {
              const index = i + 5;
              return (
                <div
                  key={index}
                  className={`${styles.item} ${
                    activeIndex === index ? styles.active : ""
                  }`}
                  onClick={() => toggle(index)}
                >
                  <div className={styles.question}>
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={activeIndex === index ? styles.rotate : ""}
                    />
                  </div>

                  <div className={styles.answer}>
                    <div className={styles.answerInner}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
