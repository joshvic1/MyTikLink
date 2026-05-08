export default function RenderSpacer({ element }) {
  const shadowMap = {
    none: "none",
    small: "0 2px 6px rgba(0,0,0,0.06)",
    medium: "0 6px 14px rgba(0,0,0,0.10)",
    large: "0 10px 24px rgba(0,0,0,0.14)",
  };

  const radiusMap = {
    none: 0,
    small: 8,
    medium: 14,
    large: 20,
    full: 999,
  };

  const marginMap = {
    none: 0,
    small: 12,
    medium: 24,
    large: 40,
  };

  return (
    <div
      style={{
        marginTop: marginMap[element.margin] || 0,

        marginBottom: marginMap[element.margin] || 0,
      }}
    >
      <div
        style={{
          width: "100%",

          height: element.height || 80,

          background: element.bg === "transparent" ? "transparent" : element.bg,

          border:
            element.borderStyle !== "none"
              ? `1px ${element.borderStyle} ${element.borderColor || "#ddd"}`
              : "none",

          borderRadius: radiusMap[element.radius] || 0,

          boxShadow: shadowMap[element.shadow] || "none",
        }}
      />
    </div>
  );
}
