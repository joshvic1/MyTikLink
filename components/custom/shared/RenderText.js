export default function RenderText({ element }) {
  const Tag = element.tag || "p";

  return (
    <Tag
      style={{
        fontSize: element.fontSize || 16,

        fontWeight: element.bold ? "600" : "400",

        fontStyle: element.italic ? "italic" : "normal",

        textDecoration: element.underline ? "underline" : "none",

        textAlign: element.align || "left",

        color: element.color || "#111827",

        background: element.bg || "transparent",

        whiteSpace: "pre-line",

        padding: element.padding || 0,

        margin: element.margin || 0,

        border: element.borderEnabled
          ? `${element.borderWidth || 1}px ${
              element.borderStyle || "solid"
            } ${element.borderColor || "#000"}`
          : "none",

        borderRadius: element.borderEnabled ? element.radius || 0 : 0,

        lineHeight: element.lineHeight || "1.5",

        letterSpacing: `${element.letterSpacing || 0}px`,

        wordBreak: "break-word",
      }}
    >
      {element.linkEnabled ? (
        <a
          href={element.url || "#"}
          target={element.newTab ? "_blank" : "_self"}
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "inherit",
          }}
        >
          {element.content}
        </a>
      ) : (
        element.content
      )}
    </Tag>
  );
}
