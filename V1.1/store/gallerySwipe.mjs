// Keep vertical scrolling and pinch-to-zoom native; only commit clear horizontal gestures.
export function swipeDirection(dx,dy,width=320){
 const threshold=Math.max(35,Math.min(80,width*.12));
 return Math.abs(dx)>=threshold&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0;
}
export function galleryIndex(index,delta,count){return count>1?(index+delta+count)%count:0;}
