"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/course.module.css";
import { FaWhatsapp, FaUserShield, FaStar } from "react-icons/fa";

export default function Course2Page() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  // TikTok Pixel (optional Lead tracking)
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
      ttq.load("D5UVLSBC77UAR2VU2LK0"); // your pixel
      ttq.page();
    })(window, document, "ttq");
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitFreeAccess = async () => {
    if (!form.name || !form.email) {
      alert("Please enter name and email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/course/send-access`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            link: "https://drive.google.com/drive/folders/1NKa170xi8t0k12QqmfawvZSTROQnOUc2?usp=drive_link",
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Email failed");
      }

      // ✅ ONLY fire after email is successfully sent
      if (window.ttq) {
        window.ttq.track("CompleteRegistration");
      }

      setShowModal(false);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong sending email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <img src="/profile.jpg" className={styles.avatar} />
        <div className={styles.currency}>FREE</div>
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

        <div className={styles.trustRow}>
          <span>
            <FaWhatsapp /> Instant Video access
          </span>
          <span>
            <FaUserShield /> Support Group
          </span>
        </div>

        {/* SAME CONTENT */}
        <p className={styles.description}>
          Are you tired of running TikTok ads that get views…or plenty messages
          but no sales? You dey boost posts well? Or even if you know how to run
          Advert well, one thing is certain, you get plenty messages but you
          won't get sales at all...I now have a working solution for that and i
          will show you for FREEEE .
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

        <button className={styles.buyBtn} onClick={() => setShowModal(true)}>
          Get Free Video Access
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 style={{ color: "#000" }}>
              Enter your details to get free access. The videos will be sent to
              your email after
            </h3>

            <input
              name="name"
              placeholder="Your name"
              onChange={handleChange}
            />
            <input name="email" placeholder="Email" onChange={handleChange} />

            <button
              className={styles.payBtn}
              onClick={submitFreeAccess}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send me the videos"}
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

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div className={styles.checkIcon}>✓</div>
            <h2 style={{ color: "#111827" }}>Success 🎉</h2>

            <p style={{ color: "#000" }}>
              The free videos have been sent to your email. Kindly check your
              email.
            </p>

            <button
              className={styles.closeBtn}
              onClick={() => setShowSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
