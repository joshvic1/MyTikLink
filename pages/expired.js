export default function ExpiredPage() {
  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        padding: "0 20px",
      }}
    >
      <h2
        style={{
          fontSize: "1.8rem",
          marginBottom: "0.8rem",
          color: "var(--text)",
        }}
      >
        This link’s subscription has expired.
        <br /> If this is your link, you have exceeded the 250 clicks limit for
        the free user plan.
      </h2>

      <p
        style={{
          color: "var(--muted)",
          marginBottom: "1.5rem",
          maxWidth: "380px",
        }}
      >
        Upgrade your plan to reactivate this link instantly.
      </p>

      <a
        href="/dashboard"
        style={{
          background: "linear-gradient(90deg, var(--accent1), var(--accent2))",
          color: "var(--onPrimary)",
          padding: "10px 22px",
          borderRadius: "10px",
          fontWeight: "600",
          textDecoration: "none",
          display: "inline-block",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          transition: "0.25s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.target.style.opacity = "1")}
      >
        Upgrade Plan
      </a>
    </div>
  );
}
