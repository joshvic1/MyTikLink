import {useEffect,useRef} from 'react';
export default function ConversationRow({onOpen,onActions,children,...props}){
 const timer=useRef(),start=useRef(),held=useRef(false);
 const cancel=()=>{clearTimeout(timer.current);start.current=null;};
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 return <button {...props} style={{touchAction:'pan-y',WebkitTouchCallout:'none',userSelect:'none'}}
 onPointerDown={e=>{cancel();held.current=false;if(e.button!==0)return;start.current={x:e.clientX,y:e.clientY};timer.current=setTimeout(()=>{held.current=true;onActions();},550);}}
 onPointerMove={e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>10)cancel();}}
 onPointerUp={cancel} onPointerCancel={cancel} onPointerLeave={cancel}
 onContextMenu={e=>{e.preventDefault();cancel();held.current=true;onActions();}}
 onKeyDown={e=>{if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();onActions();}}}
 onClick={e=>{if(held.current){e.preventDefault();held.current=false;return;}onOpen();}}>{children}</button>;
}
