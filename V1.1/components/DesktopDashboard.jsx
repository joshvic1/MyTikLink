import {requestFeatureSuggestion} from './FeatureSuggestion';
import {requestAssistant} from "../../support/assistantBridge";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,ChevronRight,Headphones,X} from 'lucide-react';
import {helpChannels} from '../config/helpChannels';
import {v11Routes} from '../config/routes';
import styles from '../styles/v11.module.css';

export function DashboardSuggestionsRail({children,count}) {
 const rail=useRef(null),[edges,setEdges]=useState({start:true,end:true});
 useEffect(()=>{const node=rail.current;if(!node)return;const measure=()=>setEdges({start:node.scrollLeft<2,end:node.scrollLeft+node.clientWidth>=node.scrollWidth-2});measure();const observer=new ResizeObserver(measure);observer.observe(node);node.addEventListener('scroll',measure,{passive:true});return()=>{observer.disconnect();node.removeEventListener('scroll',measure);};},[count]);
 const move=direction=>rail.current?.scrollBy({left:direction*((rail.current.firstElementChild?.getBoundingClientRect().width || rail.current.clientWidth)+14),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 return <div className={styles.desktopSuggestions} data-suggestion-count={count>2?"many":count===2?"two":"one"}><section ref={rail} className={styles.upNextRail} aria-label="Up next suggestions">{children}</section>{count>1&&(!edges.start||!edges.end)&&<div className={styles.desktopRailControls}><button aria-label="Previous suggestions" disabled={edges.start} onClick={()=>move(-1)}><ArrowLeft size={16}/></button><button aria-label="Next suggestions" disabled={edges.end} onClick={()=>move(1)}><ArrowRight size={16}/></button></div>}</div>;
}

export function DesktopDashboardHelp({open,onToggle}) {
 if(!open)return <button className={styles.desktopHelpReopen} onClick={onToggle}><Headphones size={17}/> Help & support</button>;
 return <aside className={styles.desktopHelp} aria-label="Help and support"><div className={styles.desktopHelpPanel}><header><span><Headphones size={23}/></span><button aria-label="Close help panel" onClick={onToggle}><X size={18}/></button></header><h2>How can we help?</h2><p>Choose a help channel below to get the support you need.</p><div className={styles.helpChannelGrid}>{helpChannels.map(({title,detail,Icon,href,soon,tone,badge,action})=>{const content=<><span className={styles.helpChannelIcon}><Icon/></span><span className={styles.helpChannelCopy}><b>{title}</b><small>{detail}</small><em>{badge}</em></span>{!soon&&<ChevronRight className={styles.helpChannelArrow}/>}</>;const className=`${styles.helpChannelCard} ${styles[`helpChannel_${tone}`]}`;return href?<a key={title} className={className} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer">{content}</a>:<button key={title} className={className} disabled={soon} onClick={action==='suggest'?requestFeatureSuggestion:action==='ai'?()=>requestAssistant():undefined}>{content}</button>;})}</div></div><Link href={v11Routes.help} className={styles.desktopGuides}><BookOpen/><div><b>Quick guides</b><p>Get the most out of MyTikLink.</p><span>View guides <ArrowRight size={15}/></span></div></Link></aside>;
}
