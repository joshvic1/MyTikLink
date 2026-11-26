import {useRef} from 'react';
import {galleryIndex,swipeDirection} from './gallerySwipe.mjs';
export default function useGallerySwipe(count,setImage){
 const gesture=useRef(null);
 const move=delta=>setImage(index=>galleryIndex(index,delta,count));
 return {
  onPointerDown(event){
   if(!event.isPrimary||count<2||event.button!==0){gesture.current=null;return;}
   gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,width:event.currentTarget.clientWidth};
   if(event.pointerType==='mouse')event.currentTarget.setPointerCapture(event.pointerId);
  },
  onPointerMove(event){const start=gesture.current;if(!start||start.id!==event.pointerId)return;
   const dx=event.clientX-start.x,dy=event.clientY-start.y;
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx))gesture.current=null;
  },
  onPointerUp(event){const start=gesture.current;gesture.current=null;if(!start||start.id!==event.pointerId)return;
   const delta=swipeDirection(event.clientX-start.x,event.clientY-start.y,start.width);if(delta)move(delta);
  },
  onPointerCancel(){gesture.current=null;},
  onLostPointerCapture(){gesture.current=null;},
  onTouchStart(event){if(event.touches.length>1)gesture.current=null;},
  onDragStart(event){event.preventDefault();},
  onKeyDown(event){if(count>1&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}}
 };
}
