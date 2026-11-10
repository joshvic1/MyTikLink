"use client";
import {useEffect,useState} from 'react';
import TykAvatar from '../MyTikLinkAI/TykAvatar';
import AIChat from '../MyTikLinkAI/AIChat';
import {subscribeAssistant,requestAssistant} from '../../support/assistantBridge';
import styles from './SmartAssistant.module.css';
export default function SmartAssistant({hideLauncher=false}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{const unsubscribe=subscribeAssistant(()=>setOpen(true));window.addEventListener('open-smart-assistant',requestAssistant);return()=>{unsubscribe();window.removeEventListener('open-smart-assistant',requestAssistant);};},[]);
 return <>{!hideLauncher&&<button type="button" className={styles.floatingButton} aria-label="Open TYK" onClick={()=>setOpen(true)}><TykAvatar/></button>}{open&&<AIChat onClose={()=>setOpen(false)}/>}</>;
}
