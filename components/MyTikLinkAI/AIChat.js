"use client";
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useRouter} from 'next/router';
import {X,Plus,History,RotateCcw,ArrowDown} from 'lucide-react';
import TykAvatar from './TykAvatar';
import {lastQuestionIndex,turnScrollTop} from './turnScroll.mjs';
import {TykWelcome,TykHistory,TykMessage,TykThinking,TykSkeleton,TykComposer} from './TykExperience';
import {firstName,selectedConversation} from './tykPresentation.mjs';
import {safeSupportHref} from '../../support/knowledge.mjs';
import {cleanMessages,readHistory,legacyHistory} from '../../support/history.mjs';
import s from './AIchat.module.css';
const authToken=()=>{try{return localStorage.getItem('token');}catch{return null;}};
const fresh=()=>({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),title:'New conversation',createdAt:new Date().toISOString(),messages:[]});
export default function AIChat({onClose}){
 const [name,setName]=useState(''),[tabActive,setTabActive]=useState(true);
 const router=useRouter(),[chats,setChats]=useState([]),[active,setActive]=useState(''),[storageKey,setStorageKey]=useState(null),[ready,setReady]=useState(false),[identityError,setIdentityError]=useState(''),[identityAttempt,setIdentityAttempt]=useState(0),[input,setInput]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[history,setHistory]=useState(false),[older,setOlder]=useState(false),[newReply,setNewReply]=useState(false),[copied,setCopied]=useState(-1),[viewport,setViewport]=useState(null);
 const inputRef=useRef(null),panelRef=useRef(null),scrollRef=useRef(null),followTurn=useRef(true),scrollIntent=useRef(true),scrollTarget=useRef(null),lastAnswer=useRef(null),requestRef=useRef(null),busy=useRef(false),tokenRef=useRef(null),closeRef=useRef(onClose);
 closeRef.current=onClose;
 useEffect(()=>{const update=()=>setTabActive(document.visibilityState==='visible');update();document.addEventListener('visibilitychange',update);const body=document.body,previous=body.style.overflow;body.style.overflow='hidden';return()=>{body.style.overflow=previous;document.removeEventListener('visibilitychange',update);};},[]);
 const chat=chats.find(c=>c.id===active),messages=chat?.messages||[];
 useEffect(()=>{
  let alive=true;setIdentityError('');setName('');tokenRef.current=authToken();
  (async()=>{try{
   let owner='guest';if(tokenRef.current){const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,'')}/auth/me`,{headers:{Authorization:`Bearer ${tokenRef.current}`},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Please sign in again to load your private chat history.');const data=await r.json();if(!data.user?._id)throw Error('Could not identify your account. Please retry.');owner=data.user._id;if(alive)setName(firstName(data.user));}
   if(!alive)return;const key=`mytiklink_support_v2:${owner}`,saved=readHistory(localStorage,key),items=saved.length?saved:[fresh()];setStorageKey(key);setChats(items);setActive(selectedConversation(items,localStorage.getItem(key+':active')));setOlder(legacyHistory(localStorage).length>0);setReady(true);
  }catch(e){if(alive)setIdentityError(e.message);}})();
  return()=>{alive=false;requestRef.current?.abort();};
 },[identityAttempt]);
 useEffect(()=>{if(ready&&storageKey)try{localStorage.setItem(storageKey,JSON.stringify(chats));localStorage.setItem(storageKey+':active',active);}catch{setError('This browser could not save chat history. Your current conversation is still available until you close it.');}},[chats,ready,storageKey,active]);
 useEffect(()=>{
  const previous=document.activeElement;const timer=setTimeout(()=>{if(window.matchMedia('(pointer:fine)').matches)inputRef.current?.focus({preventScroll:true});},140);
  const keys=e=>{if(e.key==='Escape'){e.stopPropagation();closeRef.current();}if(e.key==='Tab'){const nodes=[...panelRef.current.querySelectorAll('button:not([disabled]),a[href],textarea:not([disabled]),[tabindex="0"]')];const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',keys);const vv=window.visualViewport;const resize=()=>{if(!vv||Math.abs(vv.scale-1)<.05)setViewport({height:vv?.height||window.innerHeight,top:vv?.offsetTop||0,keyboard:window.innerHeight-(vv?.height||window.innerHeight)>120});};resize();vv?.addEventListener('resize',resize);vv?.addEventListener('scroll',resize);window.addEventListener('resize',resize);
  return()=>{clearTimeout(timer);document.removeEventListener('keydown',keys);vv?.removeEventListener('resize',resize);vv?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);if(previous?.isConnected)previous.focus?.({preventScroll:true});};
 },[]);
 useEffect(()=>{if(ready&&window.matchMedia('(pointer:fine)').matches)inputRef.current?.focus({preventScroll:true});},[ready]);
 function showTurn(){const el=scrollRef.current;if(!el)return;const q=el.querySelector(`[data-message-index="${lastQuestionIndex(messages)}"]`);if(!q)return;const rect=q.getBoundingClientRect();el.scrollTop=turnScrollTop({scrollTop:el.scrollTop,viewportTop:el.getBoundingClientRect().top,questionTop:rect.top,questionHeight:rect.height,viewportHeight:el.clientHeight});scrollTarget.current=el.scrollTop;setNewReply(false);}
 useLayoutEffect(()=>{if(history||!scrollRef.current||!messages.length)return;const last=messages.at(-1),key=last?.role==='assistant'?active+':'+messages.length+':'+last.content:null,newAnswer=key&&key!==lastAnswer.current;lastAnswer.current=key;if(scrollIntent.current||(newAnswer&&followTurn.current)){showTurn();scrollIntent.current=false;}else if(newAnswer)setNewReply(true);},[messages,loading,history,active]);
 useEffect(()=>{const changed=()=>{if(authToken()!==tokenRef.current){requestRef.current?.abort();setReady(false);setChats([]);setIdentityError('Your account changed. Close and reopen Help to load the correct conversation.');}};window.addEventListener('storage',changed);window.addEventListener('focus',changed);changed();return()=>{window.removeEventListener('storage',changed);window.removeEventListener('focus',changed);};},[router.asPath]);
 const update=rows=>setChats(all=>all.map(c=>c.id===active?{...c,updatedAt:new Date().toISOString(),messages:cleanMessages(rows),title:rows.find(m=>m.role==='user')?.content.slice(0,55)||c.title}:c));
 const send=async(text=input,retry=false,baseRows=messages)=>{
  const value=text.trim();if(!ready||busy.current||(!value&&!retry))return;
  if(authToken()!==tokenRef.current){setIdentityError('Your account changed. Close and reopen Help to continue safely.');setReady(false);return;}
  const rows=retry?baseRows:[...messages,{role:'user',content:value.slice(0,6000)}];if(!rows.length)return;
  busy.current=true;setLoading(true);setError('');setInput('');followTurn.current=true;scrollIntent.current=true;if(!retry)update(rows);const controller=new AbortController();requestRef.current=controller;
  const timer=setTimeout(()=>controller.abort(),45000);
  try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json',...(tokenRef.current?{Authorization:`Bearer ${tokenRef.current}`}:{})},body:JSON.stringify({mode:'smart-assistant',smartContext:{route:router.asPath},messages:rows.slice(-20).map(({role,content})=>({role,content}))}),signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'Could not get an answer. Please retry.');if(!data.reply)throw Error('The response was empty. Please retry.');update([...rows,{role:'assistant',content:data.reply,actions:data.actions||[]}]);const target=safeSupportHref(data.redirectTo);if(data.autoRedirect&&target?.startsWith('/')){router.push(target);onClose();}}
  catch(e){if(requestRef.current===controller)setError(e.name==='AbortError'?'The answer took too long. Please retry.':e.message);}
  finally{clearTimeout(timer);busy.current=false;setLoading(false);requestRef.current=null;}
 };
 const choose=id=>{if(loading)return;setActive(id);setHistory(false);setError('');followTurn.current=true;scrollIntent.current=true;lastAnswer.current=null;setNewReply(false);};
 const start=()=>{if(busy.current)return;const next=fresh();setChats(all=>[next,...all]);choose(next.id);setInput('');};
 const importOlder=()=>{if(!window.confirm('These older chats were stored without an account identifier. Import them only if they are yours. They will stay on this device.'))return;const imports=legacyHistory(localStorage);setChats(all=>[...all,...imports.filter(i=>!all.some(c=>c.id===i.id))]);setOlder(false);};
 return typeof document==='undefined'?null:createPortal(<><div className={s.backdrop} aria-hidden="true" onClick={onClose}/><section ref={panelRef} className={`${s.panel} ${tabActive?'':s.paused}`} role="dialog" aria-modal="true" aria-label="TYK — Your MyTikLink AI assistant" data-ai-support-open="true" style={viewport?{'--ai-height':`${viewport.height}px`,'--ai-top':`${viewport.top}px`,'--tyk-safe-bottom':viewport.keyboard?'0px':'env(safe-area-inset-bottom, 0px)'}:undefined}>
  <header className={s.header}><TykAvatar/><div className={s.identity}><h2>TYK</h2><p>Your MyTikLink AI assistant</p></div><nav aria-label="Conversation controls"><button title="Conversation history" aria-label="Conversation history" aria-pressed={history} disabled={!ready||loading} onClick={()=>setHistory(v=>!v)}><History size={18}/></button><button title="New chat" aria-label="New chat" disabled={!ready||loading} onClick={start}><Plus size={20}/></button><button title="Close TYK" aria-label="Close TYK" onClick={onClose}><X size={19}/></button></nav></header>
  {history?<TykHistory chats={chats} active={active} onChoose={choose} onReturn={()=>setHistory(false)} older={older} onImport={importOlder} disabled={loading}/>:<div className={`${s.messages} ${!messages.some(m=>m.role==='user')?s.welcomeMessages:''}`} ref={scrollRef} onScroll={e=>{const el=e.currentTarget;if(scrollTarget.current!==null&&Math.abs(el.scrollTop-scrollTarget.current)<2){scrollTarget.current=null;return;}scrollTarget.current=null;followTurn.current=false;}}>
   {identityError?<div role="alert" className={s.error}>{identityError}<button onClick={()=>setIdentityAttempt(n=>n+1)}>Try again</button></div>:!ready?<TykSkeleton/>:!messages.some(m=>m.role==='user')?<TykWelcome name={name}/>:null}
   {messages.map((m,i)=><TykMessage key={i} message={m} index={i} copied={copied} disabled={loading} canRetry={i===messages.length-1&&i>0&&messages[i-1].role==='user'} onRetry={()=>send('',true,messages.slice(0,-1))} onCopy={async(content,index)=>{try{await navigator.clipboard.writeText(content);setCopied(index);}catch{setError('Copy is unavailable. You can select and copy the response text.');}}} onFeedback={index=>update(messages.map((row,i)=>i===index?{...row,feedback:'yes'}:row))}/>)}
   {loading&&<TykThinking/>}
   {!error&&!loading&&messages.at(-1)?.role==='user'&&<button className={s.retry} onClick={()=>send('',true)}><RotateCcw size={14}/>Retry unanswered question</button>}
   {error&&<div className={s.error} role="alert">{error}{messages.at(-1)?.role==='user'&&!loading&&<button onClick={()=>send('',true)}><RotateCcw size={14}/>Retry answer</button>}</div>}
  </div>}
  {newReply&&!history&&<button className={s.newReply} onClick={()=>{followTurn.current=true;showTurn();}}><ArrowDown size={14}/>New response</button>}
  {!history&&<TykComposer input={input} setInput={setInput} inputRef={inputRef} disabled={!ready} loading={loading} onSend={send}/>}
 </section></>,document.body);
}
