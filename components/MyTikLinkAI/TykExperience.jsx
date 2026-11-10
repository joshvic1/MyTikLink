import {useEffect} from 'react';
import {ArrowUpRight,ArrowUp,ArrowLeft,Check,Copy,MessageSquare,RotateCcw,ThumbsUp} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {safeSupportHref} from '../../support/knowledge.mjs';
import {conversationDate} from './tykPresentation.mjs';
import TykAvatar from './TykAvatar';
import s from './AIchat.module.css';
const starters=['Help me set up MyTikLink','Create a landing page','Connect my pixel','Help with my account'];
export function TykWelcome({name}){
 return <div className={s.welcome}><div className={s.heroStage}><TykAvatar hero className={s.heroFloat}/></div><h1>{name?`Hey ${name}, I’m TYK`:'Hey, I’m TYK'} <span aria-hidden="true">✨</span></h1><h2 className={s.askAnything}>Ask me anything</h2></div>;
}
export function TykHistory({chats,active,onChoose,onReturn,older,onImport,disabled}){
 return <div className={s.history}><div className={s.historyIntro}><button aria-label="Return to conversation" onClick={onReturn}><ArrowLeft size={17}/></button><div><h2>Your conversations</h2><p>Pick up where you left off.</p></div></div><div className={s.historyList}>{chats.map(c=><button disabled={disabled} key={c.id} aria-current={active===c.id?'true':undefined} onClick={()=>onChoose(c.id)}><span className={s.historyIcon}><MessageSquare size={17}/></span><span><b>{c.title||'New conversation'}</b><small>{conversationDate(c)} · {c.messages.length} messages</small><p>{c.messages.at(-1)?.content.slice(0,100)||'A fresh start with TYK'}</p></span><ArrowUpRight size={16}/></button>)}</div>{older&&<button className={s.recover} onClick={onImport}>Recover earlier browser chats</button>}<small className={s.storageNote}>Saved on this device for this account.</small></div>;
}
function SafeLink({href,children}){const safe=safeSupportHref(href);return safe?<a href={safe} target="_blank" rel="noopener noreferrer">{children}</a>:<span>{children}</span>;}
export function TykMessage({message:m,index,copied,onCopy,onFeedback,onRetry,canRetry,disabled}){
 const assistant=m.role==='assistant';
 return <article data-message-index={index} className={assistant?s.assistant:s.user} aria-label={assistant?'TYK response':'Your message'}>{assistant&&<TykAvatar className={s.messageAvatar}/>}<div className={s.messageBody}><small className={s.author}>{assistant?'TYK':'You'}</small><ReactMarkdown skipHtml components={{a:SafeLink,img:()=>null}}>{m.content}</ReactMarkdown>{assistant&&<><div className={s.actions}>{(m.actions||[]).filter(a=>safeSupportHref(a.href)).map((a,j)=><a key={j} href={safeSupportHref(a.href)} target="_blank" rel="noopener noreferrer">{a.label}<ArrowUpRight size={14}/></a>)}</div><div className={s.feedback}><button aria-label="Copy response" onClick={()=>onCopy(m.content,index)}>{copied===index?<Check size={14}/>:<Copy size={14}/>}<span>{copied===index?'Copied':'Copy'}</span></button><button aria-label={m.feedback==='yes'?'Marked helpful':'Mark response helpful'} disabled={disabled||m.feedback==='yes'} onClick={()=>onFeedback(index)}><ThumbsUp size={14}/><span>{m.feedback==='yes'?'Helpful':'Helpful?'}</span></button>{canRetry&&<button onClick={onRetry} disabled={disabled}><RotateCcw size={14}/><span>Retry</span></button>}</div></>}</div></article>;
}
export function TykThinking(){return <div className={s.thinking} role="status" aria-label="Typing"><span className={s.typingDots} aria-hidden="true"><i/><i/><i/></span><span>Typing</span></div>;}
export function TykSkeleton(){return <div className={s.skeleton} role="status" aria-label="Loading your conversations"><TykAvatar/><span/><span/><span/></div>;}
export function TykComposer({input,setInput,inputRef,disabled,loading,onSend}){
 useEffect(()=>{const el=inputRef.current;if(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,128)+'px';}},[input,inputRef]);
 return <form className={s.composer} onSubmit={e=>{e.preventDefault();onSend();}}><div className={s.quickPrompts} aria-label="Conversation starters">{starters.map(q=><button type="button" key={q} disabled={disabled||loading} onClick={()=>onSend(q)}>{q}<ArrowUpRight size={14}/></button>)}</div><div className={s.inputShell}><textarea ref={inputRef} aria-label="Message TYK" rows={1} maxLength={6000} value={input} disabled={disabled} placeholder="Ask TYK anything about MyTikLink…" onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&window.matchMedia('(pointer:fine)').matches){e.preventDefault();onSend();}}}/><button type="submit" aria-label="Send message" disabled={disabled||loading||!input.trim()}><ArrowUp size={21}/></button></div></form>;
}
