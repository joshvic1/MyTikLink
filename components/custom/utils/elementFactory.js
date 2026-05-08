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

    case "form":
      return {
        ...base,
        fields: [],
      };

    default:
      return base;
  }
};
