export default function RenderVideo({ element }) {
  const getEmbedUrl = (url) => {
    if (!url) return "";

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

    if (!match) return "";

    const videoId = match[1];

    const params = new URLSearchParams();

    if (element.start) {
      params.append("start", element.start);
    }

    if (element.autoplay) {
      params.append("autoplay", "1");

      params.append("mute", "1");
    }

    if (!element.controls) {
      params.append("controls", "0");
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  return (
    <div
      style={{
        margin: element.margin || 0,

        textAlign: element.align || "center",

        maxWidth: element.fullWidth ? "100%" : `${element.maxWidth || 100}%`,

        width: "100%",
      }}
    >
      <div
        style={{
          padding: element.padding || 0,

          borderRadius: element.radius || 0,

          overflow: "hidden",

          border:
            element.border !== "none"
              ? `${element.borderWidth || 1}px solid ${
                  element.borderColor || "#111"
                }`
              : "none",
        }}
      >
        <iframe
          src={getEmbedUrl(element.url)}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{
            width: "100%",

            aspectRatio: element.ratio || "16/9",

            border: "none",

            display: "block",
          }}
        />
      </div>
    </div>
  );
}
