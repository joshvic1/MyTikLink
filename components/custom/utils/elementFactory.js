export const createElement = (type) => {
  const base = {
    id: Date.now().toString(),
    type,
  };

  switch (type) {
    case "text":
      return {
        ...base,
        content: "Your Heading Here",

        // typography
        tag: "p",
        fontSize: 18,
        bold: false,
        italic: false,
        underline: false,
        align: "left",

        // colors
        color: "#111827",
        bg: "transparent",

        // spacing
        padding: 0,
        margin: 0,

        // border
        borderEnabled: false,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#111827",
        radius: 0,

        // link
        linkEnabled: false,
        url: "",
        newTab: false,

        // extras
        lineHeight: 1.5,
        letterSpacing: 0,
      };

    case "image":
      return {
        ...base,
        src: "",

        fit: "cover",
        align: "center",

        radius: 12,

        padding: 0,
        margin: 0,

        borderEnabled: false,
        borderWidth: 1,
        borderColor: "#111827",

        shadow: "none",

        linkEnabled: false,
        url: "",
        newTab: false,
      };

    case "button":
      return {
        ...base,

        text: "Get Started",
        url: "",
        newTab: false,

        bg: "#4f46e5",
        color: "#ffffff",

        fontWeight: 600,

        radius: 12,
        shape: "rounded",

        size: "medium",

        align: "center",
        fullWidth: false,

        shadow: "none",

        borderEnabled: false,
        borderWidth: 1,
        borderColor: "#111827",

        padding: 0,
        margin: 0,
      };
    case "divider":
      return {
        ...base,

        thickness: 1,

        color: "#9ca3af",

        style: "solid",

        marginTop: 16,
        marginBottom: 16,

        width: "full",

        contentWidth: 80,
      };

    case "spacer":
      return {
        ...base,

        height: 80,

        margin: "medium",

        bg: "transparent",

        radius: 0,

        borderStyle: "none",
        borderColor: "#e5e7eb",

        shadow: "none",
      };

    case "video":
      return {
        ...base,

        url: "",

        ratio: "16/9",

        fit: "cover",

        radius: 12,

        border: "none",
        borderWidth: 1,
        borderColor: "#111111",

        shadow: "none",

        padding: 0,
        margin: 0,

        fullWidth: true,
        maxWidth: 100,

        start: "",

        controls: false,
        autoplay: false,
      };

    case "menu":
      return {
        ...base,
        containerLayout: "boxed",
        // =========================
        // BRANDING
        // =========================
        logoType: "text",
        logoText: "GlowMart",
        logoImage: "",

        // =========================
        // ITEMS
        // =========================
        items: [
          {
            id: crypto.randomUUID(),
            label: "Home",
            url: "#",
            icon: "home",
          },

          {
            id: crypto.randomUUID(),
            label: "Shop",
            url: "#shop",
            icon: "shopping-bag",
          },

          {
            id: crypto.randomUUID(),
            label: "Collections",
            url: "#collections",
            icon: "star",
          },
        ],

        // =========================
        // MENU TYPE
        // =========================
        layout: "fullscreen",

        menuPosition: "left",

        alignment: "center",
        menuPosition: "left",
        menuIcon: "menu",

        // =========================
        // CONTAINER
        // =========================
        bg: "#ffffff",

        opacity: 100,

        paddingTop: 16,
        paddingRight: 24,
        paddingBottom: 16,
        paddingLeft: 24,

        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,

        radius: 12,

        borderEnabled: true,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#E5E7EB",

        shadow: "none",

        // =========================
        // MENU ITEMS
        // =========================
        textColor: "#111827",

        activeColor: "#6C5CE7",

        hoverColor: "#6C5CE7",

        fontFamily: "Inter",

        fontSize: 16,

        fontWeight: 600,

        letterSpacing: 4,

        textTransform: "none",

        itemSpacingHorizontal: 24,

        itemSpacingVertical: 12,

        // =========================
        // OVERLAY
        // =========================
        overlayBg: "#ffffff",

        overlayOpacity: 100,

        overlayTextColor: "#111827",

        overlayHoverBg: "#F3F4F6",

        overlayShadow: "small",

        // =========================
        // CTA BUTTON
        // =========================
        showCTA: false,

        ctaText: "Shop Now",

        ctaUrl: "#",

        ctaBg: "#6C5CE7",

        ctaColor: "#ffffff",

        // =========================
        // BEHAVIOR
        // =========================
        sticky: true,

        hideOnScroll: false,

        closeOnClick: true,

        animation: "fade",

        // =========================
        // VISIBILITY
        // =========================
        showDesktop: true,

        showTablet: true,

        showMobile: true,
      };

    case "hero":
      return {
        ...base,

        // CONTENT
        eyebrow: "SUMMER COLLECTION",

        heading: "Elevate Your Everyday Style",

        description:
          "Discover timeless pieces crafted for comfort, made for you.",
        eyebrowSize: 14,
        headingSize: 56,
        descriptionSize: 18,
        // BUTTONS
        primaryButtonText: "Shop Now",
        primaryButtonUrl: "#shop",

        secondaryButtonText: "Explore Collection",

        secondaryButtonUrl: "/collection",

        showPrimaryButton: true,
        showSecondaryButton: false,
        buttonBg: "#111827",
        buttonColor: "#ffffff",

        buttonBorderEnabled: false,
        buttonBorderColor: "#111827",
        buttonBorderWidth: 1,

        secondaryButtonBg: "transparent",
        secondaryButtonColor: "#ffffff",

        secondaryButtonBorder: "#ffffff",
        secondaryButtonBorderWidth: 1,

        secondaryButtonRadius: 12,
        buttonRadius: 12,

        // BACKGROUND
        backgroundType: "image",

        backgroundImage: "",

        backgroundColor: "#111827",
        backgroundImageSource: "upload",
        overlay: true,
        layoutWidth: "full",
        overlayColor: "#000000",

        overlayOpacity: 0.45,

        // LAYOUT
        height: 600,

        contentAlign: "left",

        verticalAlign: "center",

        contentWidth: 600,

        // SPACING
        paddingTop: 120,
        paddingBottom: 120,
        paddingLeft: 32,
        paddingRight: 32,

        marginX: 16,
        marginTop: 0,
        marginBottom: 0,
        // TEXT COLORS
        eyebrowColor: "#ffffff",
        headingColor: "#ffffff",
        descriptionColor: "#e5e7eb",

        // TYPOGRAPHY
        eyebrowSize: 14,
        headingSize: 56,
        descriptionSize: 18,

        // BORDER
        borderRadius: 18,

        // BUTTON STYLE
        buttonRadius: 12,

        buttonBg: "#ffffff",

        buttonColor: "#111827",
        backgroundColor: "#111827",

        backgroundType: "image",
        secondaryButtonBorder: "#ffffff",

        // ADVANCED
        shadow: true,
        imagePosition: "center",
        imageFit: "cover",
      };

    case "store-products":
      return {
        ...base,

        title: "Featured Collection",

        badgeText: "Featured Collection",

        badgeColor: "#7c3aed",

        badgeTextColor: "#7c3aed",

        badgeIcon: "",

        columns: 2,

        backgroundColor: "#ffffff",
        fontWeight: 700,
        cardBackground: "",

        titleColor: "#111827",

        priceColor: "#6b7280",
        titleSize: 18,
        radius: 8,

        // CLEANER DEFAULTS
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 3,
        paddingRight: 3,

        marginTop: 0,
        marginBottom: 0,
      };

    case "form":
      return {
        ...base,
        fields: [],
      };

    default:
      return base;
  }
};
