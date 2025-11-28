"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/FAQ.module.css";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const faqList = [
    {
      q: "What is TikLink?",
      a: "TikLink allows you to convert TikTok traffic into WhatsApp clicks instantly. It solves the TikTok-to-WhatsApp link-blocking problem using smart redirect technology.",
    },
    {
      q: "Is TikLink safe to use?",
      a: "Yes. TikLink uses secure redirection methods and does not store or log private WhatsApp messages. All tracking is limited to click statistics.",
    },
    {
      q: "Does TikLink work for both individuals and businesses?",
      a: "Absolutely. Whether you're a creator, advertiser, business owner, or agency, TikLink helps you convert profile traffic into real WhatsApp leads.",
    },
    {
      q: "Are my redirect analytics accurate?",
      a: "TikLink's analytics are designed for high accuracy. We track unique clicks, total clicks, device types, and more depending on your plan.",
    },
    {
      q: "What happens if I upgrade my plan?",
      a: "Upgrading unlocks premium templates, advanced analytics, faster redirects, and professional link management features immediately.",
    },
    {
      q: "Can I change my TikLink redirect destination anytime?",
      a: "Yes. You can update your target WhatsApp number, group link, or message anytime without changing your short link.",
    },
  ];

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Answers to the most common questions about TikLink.
        </p>

        {/* Accordion */}
        {faqList.map((item, i) => (
          <div
            key={i}
            className={`${styles.accordionItem} ${
              openIndex === i ? styles.open : ""
            }`}
          >
            <button
              className={styles.accordionHeader}
              onClick={() => toggle(i)}
            >
              {item.q}
              <ChevronDown className={styles.icon} size={20} />
            </button>

            <div
              className={styles.panel}
              style={{
                maxHeight: openIndex === i ? "300px" : "0px",
              }}
            >
              <div className={styles.panelContent}>{item.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
