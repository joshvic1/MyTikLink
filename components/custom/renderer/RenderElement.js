import RenderText from "../shared/RenderText";
import RenderButton from "../shared/RenderButton";
import RenderImage from "../shared/RenderImage";

import RenderDivider from "../shared/RenderDivider";

import RenderSpacer from "../shared/RenderSpacer";

import RenderVideo from "../shared/RenderVideo";
export default function RenderElement({ el, tiktokPixelId, metaPixelId }) {
  switch (el.type) {
    case "text":
      return <RenderText element={el} />;
    case "image":
      return <RenderImage element={el} />;

    case "button":
      return (
        <RenderButton
          element={el}
          tiktokPixelId={tiktokPixelId}
          metaPixelId={metaPixelId}
        />
      );

    case "divider":
      return <RenderDivider element={el} />;

    case "spacer":
      return <RenderSpacer element={el} />;

    case "video":
      return <RenderVideo element={el} />;

    default:
      return null;
  }
}
