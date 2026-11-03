import {FaWhatsapp,FaTelegram,FaInstagram,FaFacebook,FaYoutube,FaLinkedin,FaXTwitter} from 'react-icons/fa6';
import {ArrowUpRight,ArrowRight,Globe,Send,MessageCircle,Instagram,Youtube,Linkedin,Facebook,Check,ExternalLink} from 'lucide-react';
import {findRedirectDesign,destinationLabels,designsForDestination} from '../config/redirectDesigns';
import s from './RedirectExperience.module.css';
const icons={whatsapp:FaWhatsapp,telegram:FaTelegram,instagram:FaInstagram,facebook:FaFacebook,youtube:FaYoutube,linkedin:FaLinkedin,website:Globe,x:FaXTwitter};
export default function RedirectExperience({data,onOpen,onBrowser,preview=false,legacyFrame=''}){
 const design=findRedirectDesign(data.template?.designId),platform=data.platform||'website';
 const label=destinationLabels[platform]||'your destination',accent=design?.accent||designsForDestination(platform)[0]?.accent||'#6f46ba';
 const layout=design?.layout||'simple',Icon=icons[platform]||ArrowUpRight;
 let host='';try{host=new URL(data.fallback).hostname;}catch{}
 const logo=<span className={s.logo}>{['tiktok','snapchat'].includes(platform)?<img src={`/images/platforms/${platform}.svg`} alt=""/>:<Icon strokeWidth={1.6}/>}</span>;
 return <main className={`${s.experience} ${s[layout]} ${preview?s.still:''} ${legacyFrame?s.legacy:''}`} style={{'--redirect-accent':accent,'--redirect-ink':platform==='snapchat'?'#171717':accent,'--redirect-on-accent':platform==='snapchat'?'#171717':'#fff'}}>
  {legacyFrame&&<iframe title="Redirect design" sandbox="" referrerPolicy="no-referrer" srcDoc={legacyFrame} className={s.legacyFrame}/>}
  <div className={s.decor} aria-hidden="true"><span/><span/><span/></div>
  <section className={s.panel}>
   <header className={s.topline}><span>{layout==='ticket'?'YOUR NEXT STOP':'A LITTLE CLOSER'}</span><ArrowUpRight size={16}/></header>
   <div className={s.art}>{logo}{layout==='orbit'&&<><i/><i/></>}</div>
   <span className={s.eyebrow}>{layout==='ticket'?'DESTINATION PASS':`OPENING ${label.toUpperCase()}`}</span>
   <h1>{layout==='ticket'?<>Next stop.<br/><em>{label}.</em></>:<>You’re heading<br/>to <em>{label}.</em></>}</h1>
   <p className={s.title}>{data.title||'Something good is waiting for you.'}</p>
   <div className={s.progress} aria-label={`Redirecting to ${label}`} role="status"><span/><small>Connecting you now</small><span className={s.dots}>•••</span></div>
   <div className={s.actions}>
    <button type="button" onClick={onOpen} className={s.primary}>Continue to {platform==='website'?'website':label}<ArrowRight size={17}/></button>
    {data.deepLink!==data.fallback&&<button type="button" className={s.secondary} onClick={onBrowser}>Open in browser <ExternalLink size={12}/></button>}
    <small>Not opened yet? Tap continue above.</small>
   </div>
   <footer className={s.footer}><span><Check size={12}/> {host||label}</span><b>MyTikLink</b></footer>
  </section>
 </main>;
}
