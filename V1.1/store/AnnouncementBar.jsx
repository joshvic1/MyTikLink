import {useEffect,useState,useRef} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import {resolveStoreText} from './design';
import css from './AnnouncementBar.module.css';
export default function AnnouncementBar({sections=[],store={}}){
 const messages=sections.filter(s=>s.type==='announcement'&&s.visible).flatMap(s=>[s.text,...(s.items||[]).map(i=>i.text||i.title)]).map(v=>resolveStoreText(v,store).trim()).filter(Boolean);
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hover,setHover]=useState(false),[reduced,setReduced]=useState(true);const touch=useRef(null);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{if(messages.length<2||paused||hover||reduced)return;const t=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%messages.length);},6000);return()=>clearInterval(t);},[messages.length,paused,hover,reduced]);
 if(!messages.length)return null;const move=delta=>setIndex(i=>(i+delta+messages.length)%messages.length);
 return <aside className={css.bar} aria-label="Store announcements" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setHover(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false);}} onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touch.current;if(touch.current!==null&&Math.abs(dx)>40)move(dx<0?1:-1);touch.current=null;}}><button aria-label="Previous announcement" disabled={messages.length<2} onClick={()=>move(-1)}><ChevronLeft size={16}/></button><p aria-live={paused||hover?'polite':'off'}>{messages[index%messages.length]}</p>{messages.length>1&&<button aria-label={paused?'Play announcements':'Pause announcements'} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={12}/>:<Pause size={12}/>}</button>}<button aria-label="Next announcement" disabled={messages.length<2} onClick={()=>move(1)}><ChevronRight size={16}/></button></aside>;
}
