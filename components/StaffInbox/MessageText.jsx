import {messageParts} from './messageLinks.mjs';
export default function MessageText({text}){return messageParts(text).map((part,i)=>part.href?<a key={i} href={part.href} target="_blank" rel="noopener noreferrer" style={{color:'inherit',textDecoration:'underline',textUnderlineOffset:2,overflowWrap:'anywhere'}}>{part.text}</a>:part.text);}
