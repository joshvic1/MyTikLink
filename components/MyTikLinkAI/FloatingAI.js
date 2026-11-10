"use client";
import TykAvatar from './TykAvatar';
import styles from './FloatingAI.module.css';
export default function FloatingAI({onOpen}){return <div className={styles.wrapper}><button type="button" className={styles.button} aria-label="Open TYK" onClick={onOpen}><TykAvatar/></button></div>;}
