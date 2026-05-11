export default function RenderButton({ element, page, phoneNumber }) {
  const shadowMap = {
    none: "none",
    light: "0 4px 10px rgba(0,0,0,0.08)",
    medium: "0 8px 20px rgba(0,0,0,0.12)",
    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  const radiusMap = {
    rectangle: 6,
    rounded: 14,
    pill: 999,
  };

  const sizeMap = {
    small: "10px 18px",
    medium: "14px 24px",
    large: "18px 32px",
  };

  const handleClick = () => {
    const redirectUrl = element.url;

    // =========================
    // TIKTOK
    // =========================
    if (typeof window !== "undefined" && window.ttq) {
      console.log("🚀 Sending TikTok Events");

      const leadEventId = Date.now().toString();

      window.ttq.track(
        "Lead",
        {
          content_type: "product",

          content_id: page?.slug,

          content_name: page?.title,

          contents: [
            {
              content_id: page?.slug,
              content_name: page?.title,
            },
          ],

          ...(phoneNumber && {
            phone_number: phoneNumber,
          }),
        },
        {
          event_id: leadEventId,
        },
      );

      setTimeout(() => {
        window.ttq.track(
          "CompleteRegistration",
          {
            content_type: "product",

            content_id: page?.slug,

            content_name: page?.title,

            contents: [
              {
                content_id: page?.slug,
                content_name: page?.title,
              },
            ],
          },
          {
            event_id: Date.now().toString(),
          },
        );
      }, 400);
    }

    // =========================
    // META
    // =========================
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead");
    }

    // =========================
    // DELAY REDIRECT
    // =========================
    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 1200);
  };

  return (
    <div
      style={{
        textAlign: element.align || "center",
        padding: element.padding || 3,
        margin: element.margin || 0,
      }}
    >
      <button
        onClick={handleClick}
        style={{
          background: element.bg,
          color: element.color,
          fontWeight: element.fontWeight,
          borderRadius: radiusMap[element.shape],
          padding: sizeMap[element.size],
          width: element.fullWidth ? "100%" : "auto",
          boxShadow: shadowMap[element.shadow],

          border: element.borderEnabled
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : "none",

          cursor: "pointer",
          fontSize: "15px",
          transition: "all 0.2s ease",
        }}
      >
        {element.text}
      </button>
    </div>
  );
}
