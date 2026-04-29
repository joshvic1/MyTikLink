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
        fontSize: 22,
        fontWeight: 600,
        align: "left",
        color: "#111111",
        lineHeight: 1.4,
        letterSpacing: 0,
      };

    case "image":
      return {
        ...base,
        src: "",
        radius: 12,
      };

    case "button":
      return {
        ...base,
        text: "Click Me",
        url: "",
        bg: "#4f46e5",
        color: "#ffffff",
      };

    case "divider":
      return {
        ...base,
      };

    case "spacer":
      return {
        ...base,
        height: 40,
      };
      return {
        ...base,
        height: 80,
      };

    case "video":
      return {
        ...base,
        url: "",
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
