"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import styles from "@/styles/course.module.css";

const COURSE_PRICE = 2000;
const COURSE_LINK = "https://drive.google.com/your-course-link";

export default function CoursePage() {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load TikTok pixel ONLY here
  useEffect(() => {
    if (window.ttq) return;
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = ["page", "track"];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat([].slice.call(arguments)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.load = function (e) {
        var o = d.createElement("script");
        o.async = true;
        o.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + e;
        d.head.appendChild(o);
      };
      ttq.load("YOUR_TIKTOK_PIXEL_ID");
      ttq.page();
    })(window, document, "ttq");
  }, []);

  const handlePay = async () => {
    if (!form.name || !form.email || !form.whatsapp) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/course/initiate`,
        form,
      );
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      alert("Payment failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref) return;

    async function verify() {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/course/verify/${ref}`,
      );

      if (res.data.success) {
        if (window.ttq) {
          window.ttq.track("Purchase", {
            value: COURSE_PRICE,
            currency: "NGN",
          });
        }
        setSuccess(true);
      }
    }

    verify();
  }, []);

  return (
    <>
      <Head>
        <title>The Ultimate TikTok Ads System</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/josh.jpg" className={styles.cover} />

          <h1 className={styles.title}>The Ultimate TikTok Ads System</h1>

          <p className={styles.subtitle}>
            Turn ₦2k into daily sales using ONE landing page + TikTok ads.
          </p>

          <div className={styles.price}>₦{COURSE_PRICE}</div>

          <ul className={styles.list}>
            <li>Build converting landing pages</li>
            <li>Connect TikTok Pixel correctly</li>
            <li>Run ads without wasting money</li>
            <li>WhatsApp automation funnel</li>
            <li>Proven ad strategy</li>
          </ul>

          <div className={styles.creator}>
            <img src="/josh.jpg" />
            <div>
              <strong>JOSHSPOT MEDIA</strong>
              <span>Olatunbosun Victor Joshua</span>
            </div>
          </div>

          {!success ? (
            <>
              <input
                className={styles.input}
                placeholder="Your name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="WhatsApp number"
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />

              <button
                className={styles.button}
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? "Processing..." : "BUY NOW ₦2,000"}
              </button>
            </>
          ) : (
            <div className={styles.success}>
              <h2>Payment Successful 🎉</h2>
              <a href={COURSE_LINK} target="_blank">
                Download Course
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
