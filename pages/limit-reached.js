export default function LimitReachedPage() {
  return (
    <div
      style={{
        background: "#0b0c10",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>
        This link has reached its usage limit.
      </h2>
      <p style={{ color: "#a7abb8", marginBottom: "1.5rem" }}>
        Upgrade your plan to unlock unlimited redirects.
      </p>
      <a
        href="/upgrade"
        style={{
          background: "linear-gradient(90deg, #2563eb, #22d3ee)",
          color: "#fff",
          padding: "10px 22px",
          borderRadius: "8px",
          fontWeight: "600",
          textDecoration: "none",
        }}
      >
        Upgrade Plan
      </a>
    </div>
  );
}
