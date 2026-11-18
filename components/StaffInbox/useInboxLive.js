import {useEffect,useRef} from 'react';
export default function useInboxLive(enabled,refresh,onUpdate){
 const latest=useRef(refresh),eventHandler=useRef(onUpdate);latest.current=refresh;eventHandler.current=onUpdate;
 useEffect(()=>{
  if(!enabled)return;let source,timer,closed=false;
  const update=()=>{if(!timer&&!closed)timer=setTimeout(()=>{timer=null;latest.current()},100)};
  const received=event=>{try{const data=JSON.parse(event.data);if(data.conversationId&&eventHandler.current){eventHandler.current(data);return;}}catch{}update();};
  const connect=()=>{source?.close();source=null;if(document.visibilityState!=='visible'||!navigator.onLine)return;update();source=new EventSource('/api/staff/events');source.addEventListener('ready',update);source.addEventListener('update',received);};
  connect();document.addEventListener('visibilitychange',connect);window.addEventListener('online',connect);
  const fallback=setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine)update()},15000);
  return()=>{closed=true;source?.close();clearInterval(fallback);clearTimeout(timer);document.removeEventListener('visibilitychange',connect);window.removeEventListener('online',connect)};
 },[enabled]);
}
