"use client";

import Link from "next/link";

export default function BlogHelpTopbar({ onMessageSupport }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "6px 10px",
        background: "linear-gradient(90deg, #111111, #2d145f)",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.2,
        textAlign: "center",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 50,
      }}
    >
      <span>Need any help?</span>
      <Link
        href="/blog"
        style={{
          minHeight: "22px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 9px",
          borderRadius: "999px",
          background: "#ffffff",
          color: "#111111",
          fontSize: "11px",
          fontWeight: 800,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Check our blog page
      </Link>
      OR
      <button
        type="button"
        onClick={onMessageSupport}
        style={{
          minHeight: "22px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6px",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.1)",
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        Message Support
      </button>
    </div>
  );
}
