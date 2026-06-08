// /shared/RenderDivider.js
export default function RenderDivider({ element }) {
  return (
    <div
      style={{
        display: "flex",

        width: "100%",

        marginTop: element.marginTop || 16,

        marginBottom: element.marginBottom || 16,

        justifyContent: element.width === "content" ? "center" : "stretch",
      }}
    >
      <div
        style={{
          borderTop: `${element.thickness || 1}px ${element.style || "solid"} ${
            element.color || "#9ca3af"
          }`,

          width:
            element.width === "content"
              ? `${element.contentWidth || 80}%`
              : "100%",
        }}
      />
    </div>
  );
}
