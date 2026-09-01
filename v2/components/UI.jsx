import { Check, AlertTriangle, Info, LoaderCircle, X, Inbox, Search } from "lucide-react";
import s from "../v2.module.css";

export function Button({ children, tone="primary", icon:Icon, ...props }) { return <button className={`${s.button} ${s[`button_${tone}`]}`} {...props}>{Icon&&<Icon size={16}/>} {children}</button> }
export function Badge({ children, tone="neutral" }) { return <span className={`${s.badge} ${s[`badge_${tone}`]}`}>{children}</span> }
export function Field({ label, hint, textarea, ...props }) { const Tag=textarea?"textarea":"input"; return <label className={s.field}><span>{label}</span><Tag {...props}/>{hint&&<small>{hint}</small>}</label> }
export function Select({ label, children, ...props }) { return <label className={s.field}><span>{label}</span><select {...props}>{children}</select></label> }
export function SearchBox({ placeholder="Search…" }) { return <div className={s.searchBox}><Search size={16}/><input placeholder={placeholder}/></div> }
export function EmptyState({ icon:Icon=Inbox, title, text, action }) { return <div className={s.empty}><span><Icon size={23}/></span><h3>{title}</h3><p>{text}</p>{action}</div> }
export function Skeleton({ rows=4 }) { return <div className={s.skeleton}>{Array.from({length:rows}).map((_,i)=><i key={i}/>)}</div> }
export function Toast({ type="success", title, text, onClose }) { const icons={success:Check,error:X,warning:AlertTriangle,info:Info,loading:LoaderCircle}; const Icon=icons[type]; return <div className={`${s.toast} ${s[`toast_${type}`]}`}><span><Icon size={17}/></span><div><strong>{title}</strong>{text&&<small>{text}</small>}</div><button onClick={onClose}><X size={15}/></button></div> }
export function Modal({ open, title, text, children, onClose, footer, size="md" }) { if(!open)return null; return <div className={s.modalLayer} onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className={`${s.modal} ${s[`modal_${size}`]}`} role="dialog" aria-modal="true"><header><div><h2>{title}</h2>{text&&<p>{text}</p>}</div><button onClick={onClose} aria-label="Close"><X size={19}/></button></header><div className={s.modalBody}>{children}</div>{footer&&<footer>{footer}</footer>}</section></div> }
export function PageHeader({ eyebrow, title, text, actions, children }) { return <><div className={s.pageHeader}><div>{eyebrow&&<span>{eyebrow}</span>}<h1>{title}</h1>{text&&<p>{text}</p>}</div>{actions&&<div className={s.headerActions}>{actions}</div>}</div>{children}</> }
export function Tabs({ items, active, onChange }) { return <div className={s.tabs}>{items.map(x=><button key={x} onClick={()=>onChange?.(x)} className={active===x?s.tabActive:""}>{x}</button>)}</div> }

