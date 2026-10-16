// /renderer/RenderElement
import RenderText from "@/components/custom/shared/RenderText";
import RenderButton from "@/components/custom/shared/RenderButton";
import RenderImage from "@/components/custom/shared/RenderImage";

import RenderDivider from "@/components/custom/shared/RenderDivider";

import RenderSpacer from "@/components/custom/shared/RenderSpacer";

import RenderVideo from "@/components/custom/shared/RenderVideo";
import RenderMenu from "@/components/custom/shared/RenderMenu";
import RenderHero from "@/components/custom/shared/RenderHero";
import ProductGrid from "@/components/store/public/ProductGrid";
import RenderStoreProducts from "@/components/custom/shared/RenderStoreProducts";
import RenderHtml from "@/V1.1/landing/RenderHtml.js";

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

    case "html":
      return <RenderHtml element={el} page={page} />;

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
