export default function RenderImage({ element }) {
  const shadowMap = {
    none: "none",
    light: "0 4px 10px rgba(0,0,0,0.08)",
    medium: "0 8px 20px rgba(0,0,0,0.12)",
    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  const content = (
    <div
      style={{
        padding: element.padding || 0,
        margin: element.margin || 0,
        boxSizing: "border-box",
      }}
    >
      <img
        src={element.src}
        style={{
          width: "100%",

          maxWidth: "100%",

          display: "block",

          borderRadius: element.radius,

          objectFit: element.fit || "cover",

          boxShadow: shadowMap[element.shadow || "none"],

          border: element.borderEnabled
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : "none",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        textAlign: element.align || "center",

        width: "100%",
      }}
    >
      {element.linkEnabled ? (
        <a
          href={element.url || "#"}
          target={element.newTab ? "_blank" : "_self"}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
