// frontend/components/LinksCardView.jsx
"use client";

import { forwardRef, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Copy,
  Edit2,
  Trash2,
  BarChart3,
  ExternalLink,
  Pointer,
  Zap,
} from "lucide-react";
import s from "@/styles/LinksCardView.module.css";
import { useRouter } from "next/navigation";

const LinksCardView = forwardRef(function LinksCardView(
  {
    redirects = [],
    userPlan = "free",
    onDelete,
    onEdit,
    onUpgrade,
    horizontal = false, // ✅ NEW
  },
  ref,
) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(null);

  const paidPlans = [
    "standard_monthly",
    "standard_yearly",
    "pro_monthly",
    "pro_yearly",
  ];

  const canUseProActions = paidPlans.includes(userPlan);
  const initialCount = 10;

  const visible = useMemo(() => {
    if (!Array.isArray(redirects)) return [];

    const sorted = [...redirects].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return expanded ? sorted : sorted.slice(0, initialCount);
  }, [redirects, expanded]);

  if (!redirects.length) {
    return <p className={s.noLinks}>No links created yet.</p>;
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const shortFrom = (link) => {
    const base = (process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(
      "/api",
      "",
    );
    return `${base}/r/${link.linkId}`;
  };

  const targetFrom = (link) => {
    if (link.linkType === "group") {
      return `https://chat.whatsapp.com/${link.whatsappCode}`;
    }

    const phone = String(link.whatsappCode || "").replace(/\D/g, "");
    const textParam = link.prefill
      ? `?text=${encodeURIComponent(link.prefill)}`
      : "";

    return `https://wa.me/${phone}${textParam}`;
  };

  return (
    <section className={s.wrap}>
      {/* UPGRADE BANNER */}
      {!paidPlans.includes(userPlan) && redirects.length > 0 && (
        <div className={s.upgradeBanner} onClick={onUpgrade}>
          <div className={s.iconWrap}>
            <Zap size={18} />
          </div>

          <div className={s.txt}>
            <span className={s.big}>Upgrade & Unlock Unlimited Clicks</span>
            <span className={s.small}>
              Unlimited Links, Templates & • Faster Redirect
            </span>
          </div>

          <button className={s.ctaMini}>Upgrade</button>
        </div>
      )}

      {/* GRID / SCROLLER */}
      <div
        ref={horizontal ? ref : null} // ✅ key fix
        className={`${s.grid} ${horizontal ? s.horizontalGrid : ""}`}
      >
        {visible.map((link) => {
          const shortLink = shortFrom(link);
          const targetLink = targetFrom(link);
          const clicks = link.redirectCount || 0;

          return (
            <article key={link._id} className={s.card}>
              <header className={s.header}>
                <h3 className={s.title}>{link.title || "Untitled"}</h3>
                <span className={s.clicks}>
                  <Pointer size={16} />
                  {clicks}
                </span>
              </header>

              <div className={s.row}>
                <div className={s.label}>Short link</div>
                <div className={s.valueInline}>
                  <a
                    className={s.shortLink}
                    href={shortLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortLink}
                    <ExternalLink size={14} className={s.ext} />
                  </a>

                  <button
                    className={s.iconBtn}
                    onClick={() => handleCopy(shortLink)}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className={s.row}>
                <div className={s.label}>Target URL</div>
                <div className={`${s.value} ${s.truncate}`}>{targetLink}</div>
              </div>

              <div className={s.actions}>
                <button
                  className={`${s.pillBtn} ${
                    !canUseProActions ? s.disabled : ""
                  }`}
                  disabled={!canUseProActions}
                  onClick={() => onEdit?.(link)}
                >
                  <Edit2 size={14} />
                  Edit
                </button>

                <button
                  className={`${s.pillBtn} ${
                    !canUseProActions ? s.disabled : ""
                  }`}
                  disabled={!canUseProActions}
                >
                  <BarChart3 size={14} />
                  Analytics
                </button>

                <button
                  className={s.iconDanger}
                  onClick={() => onDelete?.(link)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {copied === shortLink && (
                <div className={s.copiedTag}>Copied</div>
              )}

              {userPlan === "free" && (
                <p className={s.note}>
                  Your link will expire at 250 clicks.{" "}
                  <b onClick={onUpgrade}>Upgrade</b> to unlock more.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
});

export default LinksCardView;
