"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/course.module.css";
import { FaLock, FaWhatsapp, FaUserShield, FaStar } from "react-icons/fa";

export default function CoursePage() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const TEST_MODE = true; // 👈 change to false when going live

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  useEffect(() => {
    if (window.ttq) return;

    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.load = function (e) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        var o = d.createElement("script");
        o.async = true;
        o.src = i + "?sdkid=" + e + "&lib=" + t;
        d.head.appendChild(o);
      };
      ttq.load("D5T3U3JC77UAR2VTVUHG");
      ttq.page();
    })(window, document, "ttq");
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startPayment = () => {
    if (!form.name || !form.email || !form.whatsapp) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: form.email,
      amount: 100 * 100,
      currency: "NGN",
      metadata: {
        name: form.name,
        whatsapp: form.whatsapp,
      },
      callback: function (response) {
        alert("Payment successful!");

        // 🔥 TikTok Purchase Event
        if (window.ttq) {
          window.ttq.track("Purchase", {
            value: 2000,
            currency: "NGN",
            contents: [
              {
                content_id: "tiktok-ads-course",
                content_type: "product",
                quantity: 1,
                price: 100,
              },
            ],
          });
        }

        setShowModal(false);
      },
      onClose: function () {
        alert("Payment cancelled");
      },
    });

    handler.openIframe();
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <img src="/profile.jpg" className={styles.avatar} />
        <div className={styles.currency}>NGN</div>
        <div className={styles.menu}>☰</div>
      </header>

      {/* CARD */}
      <div className={styles.card}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            How To Make Your Tiktok Ads Convert well with a Landing Page +
            Tiktok Ads Manager
          </h1>

          <a href="#reviews" className={styles.seeReviews}>
            <FaStar /> See Reviews
          </a>
        </div>

        <img src="/course-cover.jpg" className={styles.cover} />

        {/* TRUST BADGES */}
        <div className={styles.trustRow}>
          <span>
            <FaWhatsapp /> Instant Video access
          </span>
          <span>
            <FaUserShield /> Support Group
          </span>
        </div>

        <p className={styles.description}>
          Are you tired of running TikTok ads that get views…or plenty messages
          but no sales? You dey boost posts well? Or even if you know how to run
          Advert well, one thing is certain, you get plenty messages but you
          won't get sales at all...I now have a working solution for that and i
          will show you for just ₦2,000 only .
          <br />
          <br />
          <button className={styles.buyBtn} onClick={() => setShowModal(true)}>
            Get Tutorial Videos Now (₦2,000)
          </button>
          <br />
          <br />
          After running TikTok ads for myself and my clients for years, I have
          discovered the main reason why most TikTok ads don't convert. And I
          can tell you the solution is to get a Landing Page , connect it to
          TikTok Pixel on the Ads Manager, run ads to the landing page, then
          automate WhatsApp messages to close sales.
          <br />
          <br />
          Oya I know say my English don dey too much and you probably don't
          understand what I just said😄. Don't worry, I have created a
          step-by-step video tutorial that shows you exactly how to set up
          everything from scratch, even if never run TikTok ads before.
        </p>

        <h2 style={{ color: "#111827" }}>
          For just ₦2,000, You are getting access to the videos immediately
          after Payment
        </h2>

        <p style={{ fontWeight: "bold", color: "#111827", marginTop: "10px" }}>
          Below is everything you will learn in my tutorial videos:
        </p>

        <ul className={styles.list}>
          <li>1. How to get at least 100 customers every week</li>
          <li>2. How to get a converting landing pages</li>
          <li>3. How to Register on the Tiktok Ads Manager</li>
          <li>4. How to Connect your Landing Page with Tiktok Ads Manager</li>
          <li>5. How to reply WhatsApp messages to close sales</li>
          <li>6. How to make payment for your ads easily</li>
        </ul>

        <h2 style={{ color: "#111827" }}>
          Finally, after payment, I have a group where i answer and help you
          with any questions you may have about the tutorial videos.
        </h2>

        <div className={styles.priceBox}>
          <span className={styles.price}>₦2,000</span>
        </div>

        <button className={styles.buyBtn} onClick={() => setShowModal(true)}>
          Get Tutorial Videos Now (₦2,000)
        </button>
      </div>

      {/* CREATOR */}
      <div className={styles.creator}>
        <img src="/profile.jpg" className={styles.creatorImg} />
        <div>
          <h4>JOSHSPOT MEDIA</h4>
          <p>Olatunbosun Victor Joshua</p>
        </div>
      </div>

      {/* REVIEWS */}
      <div id="reviews" className={styles.reviews}>
        <h3>Customer reviews</h3>

        <div className={styles.reviewCard}>
          <strong>Emeka A.</strong>
          <p>
            Nice One Josh. I used this method to run my first TikTok ad and I
            got my first 3 sales in one day.
          </p>
        </div>

        <div className={styles.reviewCard}>
          <strong>Deborah K.</strong>
          <p>Omo, be like this one work ooo</p>
        </div>

        <div className={styles.reviewCard}>
          <strong>Sadiq M.</strong>
          <p>
            Very simple and straight to the point. The videos are well detailed
          </p>
        </div>
      </div>

      <footer className={styles.footer}>Powered by TikLink</footer>

      {/* STICKY BUY */}
      <div className={styles.stickyBuy}>
        <span>₦2,000</span>
        <button onClick={() => setShowModal(true)}>Pay now</button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 style={{ color: "#000" }}>Ready to Pay? Fill the Form below</h3>

            <input
              name="name"
              placeholder="Your name"
              onChange={handleChange}
            />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input
              name="whatsapp"
              placeholder="WhatsApp number"
              onChange={handleChange}
            />

            <button
              className={styles.payBtn}
              onClick={startPayment}
              disabled={loading}
            >
              {loading ? "Redirecting..." : "Continue to payment"}
            </button>

            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
