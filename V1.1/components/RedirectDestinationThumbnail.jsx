import {FaWhatsapp,FaTelegram,FaInstagram,FaFacebook,FaYoutube,FaLinkedin,FaXTwitter,FaTiktok,FaSnapchat} from 'react-icons/fa6';
import {detectPlatform} from '../lib/redirectDestination';
const logos={whatsapp:[FaWhatsapp,'#128c57','#e6f8ed'],telegram:[FaTelegram,'#229ed9','#e8f6ff'],instagram:[FaInstagram,'#c13584','#fcebf5'],facebook:[FaFacebook,'#1877f2','#eaf2ff'],youtube:[FaYoutube,'#ff0033','#ffedf0'],linkedin:[FaLinkedin,'#0a66c2','#eaf3fb'],x:[FaXTwitter,'#111','#f1f1f3'],tiktok:[FaTiktok,'#111','#ecfaf9'],snapchat:[FaSnapchat,'#111','#fffc00']};
export default function RedirectDestinationThumbnail({link}){
 const detected=detectPlatform(link.destinationUrl||link.whatsappCode||'');
 const platform=link.platform&&link.platform!=='website'?link.platform:detected!=='website'?detected:!link.platform&&['dm','group','channel'].includes(link.linkType)?'whatsapp':'website';
 const entry=logos[platform];
 if(!entry)return <b>{Array.from(String(link.title||'Link'))[0].toUpperCase()}</b>;
 const [Logo,color,background]=entry;
 return <span style={{display:'grid',placeItems:'center',width:'100%',height:'100%',background,color}}><Logo aria-label={platform} role="img" style={{width:30,height:30,flexShrink:0}}/></span>;
}
