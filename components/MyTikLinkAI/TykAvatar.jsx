import s from './TykAvatar.module.css';
// Every treatment uses the supplied original image; the compact view is a CSS crop.
export default function TykAvatar({hero=false,className='',...props}){
 return <span className={`${s.avatar} ${hero?s.hero:s.compact} ${className}`} {...props}><img src="/images/tyk/official-mascot.jpg" alt={hero?'TYK, your friendly purple MyTikLink assistant':''} width="1254" height="1254" draggable="false"/></span>;
}
