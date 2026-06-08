export default function RenderHero({ element }) {
  return (
    <section
      style={{
        position: "relative",

        minHeight: element.height,

        overflow: "hidden",

        borderRadius: element.layoutWidth === "full" ? 0 : element.borderRadius,

        display: "flex",
        width:
          element.layoutWidth === "full"
            ? "calc(100% + 32px)"
            : `calc(100% - ${element.marginX * 2}px)`,
        marginLeft: element.layoutWidth === "full" ? -16 : element.marginX,

        marginRight: element.layoutWidth === "full" ? -16 : element.marginX,

        marginTop: element.marginTop,

        marginBottom: element.marginBottom,
        alignItems:
          element.verticalAlign === "top"
            ? "flex-start"
            : element.verticalAlign === "bottom"
              ? "flex-end"
              : "center",

        justifyContent: "center",

        paddingTop: element.paddingTop,

        paddingBottom: element.paddingBottom,

        paddingLeft: element.paddingLeft,

        paddingRight: element.paddingRight,

        backgroundColor:
          element.backgroundType === "color"
            ? element.backgroundColor
            : "transparent",

        backgroundImage:
          element.backgroundType === "image" && element.backgroundImage
            ? `url(${element.backgroundImage})`
            : "none",

        backgroundSize: element.imageFit,

        backgroundPosition:
          element.imagePosition === "top"
            ? "top"
            : element.imagePosition === "bottom"
              ? "bottom"
              : "center",

        isolation: "isolate",
      }}
    >
      {/* OVERLAY */}
      {element.overlay && (
        <div
          style={{
            position: "absolute",

            inset: 0,

            background: element.overlayColor,

            opacity: element.overlayOpacity,

            zIndex: 0,
          }}
        />
      )}

      {/* CONTENT */}
      <div
        style={{
          position: "relative",

          zIndex: 2,
          textAlign: element.contentAlign,
          width: element.layoutWidth === "boxed" ? "92%" : "100%",

          maxWidth: element.layoutWidth === "boxed" ? "1200px" : "100%",

          marginInline: element.layoutWidth === "boxed" ? "auto" : "0",
        }}
      >
        {/* EYEBROW */}
        <p
          style={{
            color: element.eyebrowColor,

            fontSize: element.eyebrowSize,

            marginBottom: 16,

            fontWeight: 600,

            letterSpacing: "0.08em",

            textTransform: "uppercase",
          }}
        >
          {element.showEyebrow !== false && (
            <p
              style={{
                color: element.eyebrowColor,
                fontSize: element.eyebrowSize,
                marginBottom: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {element.eyebrow}
            </p>
          )}
        </p>

        {/* HEADING */}
        <h1
          style={{
            color: element.headingColor,

            fontSize: element.headingSize,

            lineHeight: 1.1,

            fontWeight: 700,

            marginBottom: 20,
          }}
        >
          {element.showHeading !== false && (
            <h1
              style={{
                color: element.headingColor,
                fontSize: element.headingSize,
                lineHeight: 1.1,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              {element.heading}
            </h1>
          )}
        </h1>

        {/* DESCRIPTION */}
        <p
          style={{
            color: element.descriptionColor,

            fontSize: element.descriptionSize,

            lineHeight: 1.6,

            marginBottom: 28,
          }}
        >
          {element.showDescription !== false && (
            <p
              style={{
                color: element.descriptionColor,
                fontSize: element.descriptionSize,
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              {element.description}
            </p>
          )}
        </p>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",

            gap: 12,

            flexWrap: "wrap",

            justifyContent:
              element.contentAlign === "left"
                ? "flex-start"
                : element.contentAlign === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          {element.showPrimaryButton && (
            <a
              href={element.primaryButtonUrl}
              style={{
                height: 52,

                padding: "0 24px",

                borderRadius: element.buttonRadius,

                background: element.buttonBg,

                color: element.buttonColor,

                border: element.buttonBorderEnabled
                  ? `${element.buttonBorderWidth}px solid ${element.buttonBorderColor}`
                  : "none",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                textDecoration: "none",

                fontWeight: 600,

                transition: "all .2s ease",
              }}
            >
              {element.primaryButtonText}
            </a>
          )}

          {element.showSecondaryButton && (
            <a
              href={element.secondaryButtonUrl}
              style={{
                height: 52,

                padding: "0 24px",

                borderRadius: element.buttonRadius,

                border: `1px solid ${element.secondaryButtonBorder}`,

                color: "#fff",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                textDecoration: "none",

                fontWeight: 600,
              }}
            >
              {element.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
