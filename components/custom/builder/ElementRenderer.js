import {setEditTarget} from './editTarget';
import {useRouter} from 'next/router';
// builder/ElementRenderer.js
import TextElement from "../elements/TextElement";
import ImageElement from "../elements/ImageElement";
import ButtonElement from "../elements/ButtonElement";
import DividerElement from "../elements/DividerElement";
import SpacerElement from "../elements/SpacerElement";
import VideoElement from "../elements/VideoElement";
import MenuElement from "../elements/MenuElement";
import HeroElement from "../elements/HeroElement";
import ProductsElement from "../elements/ProductsElement";
import HtmlElement from "../elements/HtmlElement";
function ElementContent({
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

    case "html":
      return (
        <HtmlElement
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

    case "menu":
      return (
        <MenuElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "hero":
      return (
        <HeroElement
          element={element}
          sectionId={sectionId}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      );

    case "store-products":
      return (
        <ProductsElement
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

// Route-scoped canvas interaction: the public renderer remains fully interactive.
export default function ElementRenderer(props){
 const router=useRouter();
 const editable=router.asPath.startsWith('/v1-1');
 const edit=event=>{
  const wrapper=event.currentTarget,target=event.target;
  if(!editable||!wrapper.contains(target)||target.closest('[role="dialog"]'))return;
  if(target.closest('[data-canvas-action]'))return;
  const trigger=wrapper.querySelector('[data-canvas-edit]');
  if(!trigger)return;
  setEditTarget({id:props.element.id,text:target.textContent?.trim(),image:Boolean(target.closest('img'))});
  event.preventDefault();event.stopPropagation();trigger.click();
 };
 return <div data-canvas-element={props.element.id} onClickCapture={edit}><ElementContent {...props}/></div>;
}
