// /renderer/RenderElement
import RenderText from "../shared/RenderText";
import RenderButton from "../shared/RenderButton";
import RenderImage from "../shared/RenderImage";

import RenderDivider from "../shared/RenderDivider";

import RenderSpacer from "../shared/RenderSpacer";

import RenderVideo from "../shared/RenderVideo";
import RenderMenu from "../shared/RenderMenu";
import RenderHero from "../shared/RenderHero";
import ProductGrid from "../../store/public/ProductGrid";
import RenderStoreProducts from "../shared/RenderStoreProducts";

export default function RenderElement({
  el,
  tiktokPixelId,
  metaPixelId,
  page,
}) {
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
          page={page}
        />
      );

    case "divider":
      return <RenderDivider element={el} />;

    case "spacer":
      return <RenderSpacer element={el} />;

    case "video":
      return <RenderVideo element={el} />;
    case "menu":
      return <RenderMenu element={el} />;
    case "hero":
      return <RenderHero element={el} />;

    case "store-products":
      return (
        <RenderStoreProducts
          element={el}
          products={page?.products || []}
          builder={page?.builder}
        />
      );
    default:
      return null;
  }
}
