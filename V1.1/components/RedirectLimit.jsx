import Link from 'next/link';
import {ChartNoAxesCombined,ArrowUpRight} from 'lucide-react';
import s from './RedirectLimit.module.css';
export default function RedirectLimit({linkId}){
 return <main className={s.screen}><div><section className={s.card}><div className={s.top}><span className={s.icon}><ChartNoAxesCombined size={27}/></span><small>REDIRECT LINK</small><h1>This link has reached<br/>its visit limit</h1></div><div className={s.body}><p>This link cannot accept new visits right now. Please contact the person who shared it with you.</p><Link href={`/v1-1/links/upgrade?link=${encodeURIComponent(linkId)}`}>Own this link? Upgrade <ArrowUpRight size={17}/></Link><p className={s.note}>Sign in as the owner to choose a plan and restore access.</p></div></section><div className={s.brand}>Powered by MyTikLink</div></div></main>;
}
