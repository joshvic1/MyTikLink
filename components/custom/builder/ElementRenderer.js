import TextElement from "../elements/TextElement";
import ImageElement from "../elements/ImageElement";
import ButtonElement from "../elements/ButtonElement";
import DividerElement from "../elements/DividerElement";
import SpacerElement from "../elements/SpacerElement";
import VideoElement from "../elements/VideoElement";

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
      return (
        <ImageElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );
    case "button":
      return (
        <ButtonElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "video":
      return (
        <VideoElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "divider":
      return (
        <DividerElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "spacer":
      return (
        <SpacerElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    default:
      return null;
  }
}
