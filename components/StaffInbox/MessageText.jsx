import {messageParts} from './messageLinks.mjs';
import {mentionParts} from './mentionParts.mjs';
export default function MessageText({text,mentions=[]}){
 const content=/^\[(unsupported|unknown) message\]$/i.test(text||'')?'WhatsApp did not provide this message’s content. Ask the sender to resend it as text, an image, an audio message or a video.':text;
 return mentionParts(content,mentions).map((part,index)=>part.staff
  ?<span key={index} data-staff-mention={part.staff} style={{color:'#7043b2',fontWeight:600,overflowWrap:'anywhere'}}>{part.text}</span>
  :messageParts(part.text).map((link,i)=>link.href?<a key={index+':'+i} href={link.href} target="_blank" rel="noopener noreferrer" style={{color:'#2374bf',textDecoration:'underline',textUnderlineOffset:2,overflowWrap:'anywhere'}}>{link.text}</a>:link.text));
}
