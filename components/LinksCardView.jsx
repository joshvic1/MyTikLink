"use client";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Copy,
  Edit2,
  Trash2,
  BarChart3,
  ExternalLink,
  Pointer,
  MousePointer2,
  TrendingUp,
} from "lucide-react";
import s from "@/styles/LinksCardView.module.css";

/**
 * Props:
 * - redirects: array of link objects
 * - userPlan: "free" | "standard" | "pro"
 * - onDelete(id)
 * - onEdit(link)
 */
export default function LinksCardView({
  redirects = [],
  userPlan = "free",
  onDelete,
  onEdit,
}) {
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
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return expanded ? sorted : sorted.slice(0, initialCount);
  }, [redirects, expanded]);

  if (!Array.isArray(redirects) || redirects.length === 0) {
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
      ""
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
      <div className={s.grid}>
        {visible.map((link) => {
          const shortLink = shortFrom(link);
          const targetLink = targetFrom(link);
          const clicks = link.redirectCount || 0;

          return (
            <article key={link._id} className={s.card}>
              <header className={s.header}>
                <h3 className={s.title}>{link.title || "Untitled"}</h3>
                <span className={s.clicks} title={`${clicks} total clicks`}>
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
                    title="Open short link"
                  >
                    {shortLink}
                    <ExternalLink size={14} className={s.ext} />
                  </a>
                  <button
                    className={s.iconBtn}
                    onClick={() => handleCopy(shortLink)}
                    title="Copy short link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className={s.row}>
                <div className={s.label}>Target URL</div>
                <div className={`${s.value} ${s.truncate}`} title={targetLink}>
                  {targetLink}
                </div>
              </div>

              <div className={s.actions}>
                <button
                  className={`${s.pillBtn} ${
                    !canUseProActions ? s.disabled : ""
                  }`}
                  disabled={!canUseProActions}
                  onClick={() => canUseProActions && onEdit && onEdit(link)}
                  data-tooltip={
                    !canUseProActions ? "Upgrade to unlock" : undefined
                  }
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  className={`${s.pillBtn} ${
                    !canUseProActions ? s.disabled : ""
                  }`}
                  disabled={!canUseProActions}
                  onClick={() => {}}
                  data-tooltip={
                    !canUseProActions ? "Upgrade to unlock" : undefined
                  }
                >
                  <BarChart3 size={14} />
                  <span>Analytics</span>
                </button>

                <button
                  className={`${s.iconDanger}`}
                  onClick={() => onDelete && onDelete(link)}
                  data-tooltip={"Delete Link"}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {copied === shortLink && (
                <div className={s.copiedTag}>Copied</div>
              )}
              <p className={s.note}>
                Make sure your TikTok account is set to a{" "}
                <b>Business Account</b> for this link to work properly.
              </p>
            </article>
          );
        })}
      </div>

      {redirects.length > initialCount && (
        <div className={s.viewMoreWrap}>
          <button className={s.viewMore} onClick={() => setExpanded((v) => !v)}>
            {expanded
              ? "Show less"
              : `View more (${redirects.length - initialCount} more)`}
          </button>
        </div>
      )}
    </section>
  );
}
