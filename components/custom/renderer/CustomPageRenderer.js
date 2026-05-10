import RenderElement from "./RenderElement";
import styles from "./CustomPageRenderer.module.css";
export default function CustomPageRenderer({
  sections = [],
  tiktokPixelId,
  metaPixelId,
}) {
  return (
    <div className={styles.wrapper}>
      {sections.map((section) => (
        <div
          key={section.id}
          style={{
            background: section.bg || "#fff",

            padding: section.padding || 16,

            marginTop: section.margin || 0,
            marginBottom: section.margin || 0,

            borderRadius: section.radius || 0,

            border: section.borderEnabled
              ? `${section.borderWidth || 1}px ${
                  section.borderStyle || "solid"
                } ${section.borderColor || "#e5e7eb"}`
              : "none",

            boxShadow:
              section.shadow === "light"
                ? "0 4px 10px rgba(0,0,0,0.06)"
                : section.shadow === "medium"
                  ? "0 8px 20px rgba(0,0,0,0.10)"
                  : section.shadow === "large"
                    ? "0 12px 30px rgba(0,0,0,0.14)"
                    : "none",

            width: section.layout === "boxed" ? "92%" : "100%",

            marginInline: section.layout === "boxed" ? "auto" : undefined,

            overflow: "hidden",
            boxSizing: "border-box",
            maxWidth: "100%",

            opacity: (section.opacity || 100) / 100,
          }}
        >
          <div
            style={{
              width: "100%",

              display: "flex",

              flexDirection: "column",

              gap: "12px",

              boxSizing: "border-box",
            }}
          >
            {section.elements?.map((el) => (
              <RenderElement
                key={el.id}
                el={el}
                tiktokPixelId={tiktokPixelId}
                metaPixelId={metaPixelId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
