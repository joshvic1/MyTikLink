export default function RenderElement({ el }) {
  switch (el.type) {
    case "text":
      return (
        <div
          style={{
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            textAlign: el.align,
            color: el.color,
            lineHeight: el.lineHeight,
            letterSpacing: `${el.letterSpacing}px`,
          }}
        >
          {el.content}
        </div>
      );

    case "image":
      return (
        <img
          src={el.src}
          style={{
            width: "100%",
            borderRadius: el.radius,
          }}
        />
      );

    case "button":
      return (
        <a href={el.url} style={{ textDecoration: "none" }}>
          <button
            style={{
              background: el.bg,
              color: el.color,
              padding: "14px 20px",
              borderRadius: "10px",
              border: "none",
              width: "100%",
              fontWeight: 600,
            }}
          >
            {el.text}
          </button>
        </a>
      );

    case "divider":
      return (
        <div
          style={{
            height: "1px",
            background: "#e5e7eb",
            margin: "20px 0",
          }}
        />
      );

    case "spacer":
      return <div style={{ height: el.height }} />;

    default:
      return null;
  }
}
