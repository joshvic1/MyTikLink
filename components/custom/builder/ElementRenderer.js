import TextElement from "../elements/TextElement";
import ImageElement from "../elements/ImageElement";
import ButtonElement from "../elements/ButtonElement";
import DividerElement from "../elements/DividerElement";
import SpacerElement from "../elements/SpacerElement";

export default function ElementRenderer({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  switch (element.type) {
    case "text":
      return (
        <TextElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "image":
      return <ImageElement element={element} />;

    case "button":
      return <ButtonElement element={element} />;

    case "divider":
      return <DividerElement />;

    case "spacer":
      return <SpacerElement element={element} />;

    default:
      return null;
  }
}
