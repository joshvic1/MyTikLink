"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/tutorial-offer.module.css";

const OFFER_DURATION = 3 * 60 * 60 * 1000;
const YOUTUBE_SHORT_ID = "YOUR_YOUTUBE_SHORT_ID";

export default function TutorialOfferPage() {
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(OFFER_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const viewContentTracked = useRef(false);
  const year = new Date().getFullYear();

  const trackTikTokEvent = (eventName, properties = {}) => {
    if (
      typeof window !== "undefined" &&
      window.ttq &&
      typeof window.ttq.track === "function"
    ) {
      window.ttq.track(eventName, properties);
    }
  };

  useEffect(() => {
    if (viewContentTracked.current) return;

    viewContentTracked.current = true;

    trackTikTokEvent("ViewContent", {
      content_name: "5K website tutorial offer",
      page_name: "website_tutorial_offer",
      page_url: window.location.href,
    });
  }, []);

  useEffect(() => {
    const storageKey = "websiteTutorialOfferEndTime";
    const savedEndTime = Number(localStorage.getItem(storageKey));

    let endTime = savedEndTime;

    if (!savedEndTime || savedEndTime <= Date.now()) {
      endTime = Date.now() + OFFER_DURATION;
      localStorage.setItem(storageKey, String(endTime));
    }

    const updateCountdown = () => {
      const remainingTime = Math.max(0, endTime - Date.now());
      setTimeLeft(remainingTime);

      if (remainingTime === 0) {
        localStorage.removeItem(storageKey);
      }
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const countdown = formatTime(timeLeft);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || isSubmitting) return;

    setIsSubmitting(true);
    setFormMessage("");

    trackTikTokEvent("ClickButton", {
      button_name: "get_tutorial_videos",
      button_text: "Get videos now",
      page_name: "website_tutorial_offer",
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tutorial-signups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanedEmail,
            source: "website_tutorial_offer",
            pageUrl: window.location.href,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Submission failed");
      }

      trackTikTokEvent("SubmitForm", {
        form_name: "website_tutorial_email_form",
        page_name: "website_tutorial_offer",
      });

      trackTikTokEvent("CompleteRegistration", {
        registration_method: "email",
        page_name: "website_tutorial_offer",
      });

      setSubmittedEmail(cleanedEmail);
      setEmail("");
      setSuccessOpen(true);
    } catch (error) {
      console.error(error);
      setFormMessage(
        error.message || "We could not submit your email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareDetails = () => ({
    title: "How to Create a 5K Website",
    text: "Learn how to create a 5K website with this step-by-step tutorial.",
    url: window.location.href,
  });

  const trackShare = (platform) => {
    trackTikTokEvent("ClickButton", {
      button_name: `share_${platform}`,
      button_text: `Share on ${platform}`,
      page_name: "website_tutorial_offer",
    });
  };

  const shareToWhatsApp = () => {
    trackShare("whatsapp");

    const { text, url } = getShareDetails();
    const message = encodeURIComponent(`${text}\n\n${url}`);

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareToTelegram = () => {
    trackShare("telegram");

    const { text, url } = getShareDetails();

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareWithDevice = async (platform) => {
    trackShare(platform);

    const shareDetails = getShareDetails();

    if (navigator.share) {
      try {
        await navigator.share(shareDetails);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${shareDetails.text}\n${shareDetails.url}`,
      );

      setFormMessage(
        `Link copied. Open ${platform} and share it with your friends.`,
      );
    } catch {
      setFormMessage("Copy the page link from your browser and share it.");
    }
  };

  return (
    <main className={styles.tutorialPage}>
      <section className={styles.tutorialPanel}>
        <div className={styles.tutorialBadge}>Free step-by-step training</div>

        <h1>
          How to Create a <span>₦5K Website</span> - Step-by-Step Tutorial!
        </h1>

        <p className={styles.tutorialIntro}>
          Watch the 20 Mins Video Tutorial on how to create your own store page
          where you can upload your products, get and update your orders. Track
          sales and monitor your income. Get the 20 Mins tutorial video directly
          sent to your email.
        </p>

        <section className={styles.offerCountdown}>
          <p>Offer ends in</p>

          <div className={styles.countdownBoxes}>
            <div className={styles.countdownItem}>
              <strong>{countdown.hours}</strong>
              <span>Hours</span>
            </div>

            <div className={styles.countdownDivider}>:</div>

            <div className={styles.countdownItem}>
              <strong>{countdown.minutes}</strong>
              <span>Minutes</span>
            </div>

            <div className={styles.countdownDivider}>:</div>

            <div className={styles.countdownItem}>
              <strong>{countdown.seconds}</strong>
              <span>Seconds</span>
            </div>
          </div>
        </section>

        <div className={styles.tutorialVideoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_SHORT_ID}`}
            title="How to create a 5K website tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <section className={styles.tutorialFormSection}>
          <h2>Get the Complete Tutorial</h2>

          <p>
            Enter your email below to receive the tutorial videos directly in
            your inbox.
          </p>

          <form className={styles.tutorialForm} onSubmit={handleSubmit}>
            <label htmlFor="tutorial-email">Email address</label>

            <input
              id="tutorial-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
              required
              disabled={isSubmitting || timeLeft === 0}
            />

            <button type="submit" disabled={isSubmitting || timeLeft === 0}>
              {timeLeft === 0
                ? "Offer has ended"
                : isSubmitting
                  ? "Sending..."
                  : "Get Videos Now"}
            </button>
          </form>

          {formMessage && (
            <p className={styles.tutorialFormMessage} role="status">
              {formMessage}
            </p>
          )}

          <small>
            By submitting, you agree to receive the tutorial and related
            updates. You can unsubscribe at any time.
          </small>
        </section>

        <section className={styles.tutorialShareSection}>
          <h2>Share This Page With Your Friends</h2>

          <p>
            Someone you know may also want to learn how to create a website.
          </p>

          <div className={styles.tutorialShareButtons}>
            <button
              type="button"
              className={styles.shareWhatsapp}
              onClick={shareToWhatsApp}
            >
              <span>WA</span>
              WhatsApp
            </button>

            <button
              type="button"
              className={styles.shareInstagram}
              onClick={() => shareWithDevice("instagram")}
            >
              <span>IG</span>
              Instagram
            </button>

            <button
              type="button"
              className={styles.shareTiktok}
              onClick={() => shareWithDevice("tiktok")}
            >
              <span>TT</span>
              TikTok
            </button>

            <button
              type="button"
              className={styles.shareSnapchat}
              onClick={() => shareWithDevice("snapchat")}
            >
              <span>SC</span>
              Snapchat
            </button>

            <button
              type="button"
              className={styles.shareTelegram}
              onClick={shareToTelegram}
            >
              <span>TG</span>
              Telegram
            </button>
          </div>
        </section>

        <footer>
          Copyright {year}. All rights reserved |{" "}
          <Link href="/privacy">Privacy policy</Link> | Terms and conditions
          apply
        </footer>
      </section>
      {successOpen && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <span>✓</span>
            </div>

            <h2>Success</h2>

            <p>
              Check your email <strong>({submittedEmail})</strong> for the
              videos. Don't forget to check your spam as well.
            </p>

            <button
              type="button"
              className={styles.successButton}
              onClick={() => setSuccessOpen(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
