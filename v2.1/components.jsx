import { Check, X, AlertTriangle, Info, LoaderCircle, Search, ArrowRight } from "lucide-react";
import s from "./v21.module.css";
export function Button({tone='primary',icon:Icon,children,...p}){return <button className={`${s.btn} ${s['btn_'+tone]}`} {...p}>{Icon&&<Icon size={15}/>}<span>{children}</span></button>}
export function Status({tone='neutral',children}){return <span className={`${s.status} ${s['status_'+tone]}`}><i/>{children}</span>}
export function Field({label,hint,textarea,...p}){const Tag=textarea?'textarea':'input';return <label className={s.field}><b>{label}</b><Tag {...p}/>{hint&&<small>{hint}</small>}</label>}
export function SearchField({placeholder='Search'}){return <label className={s.search}><Search size={15}/><input placeholder={placeholder}/><kbd>⌘K</kbd></label>}
export function Section({kicker,title,text,action,children,className=''}){return <section className={`${s.section} ${className}`}><header><div>{kicker&&<small>{kicker}</small>}<h2>{title}</h2>{text&&<p>{text}</p>}</div>{action}</header>{children}</section>}
export function Empty({title,text,action}){return <div className={s.empty}><div className={s.emptyMark}>+</div><h3>{title}</h3><p>{text}</p>{action}</div>}
export function Toast({type='success',title,text,onClose}){const map={success:Check,error:X,warning:AlertTriangle,info:Info,loading:LoaderCircle},I=map[type];return <div className={`${s.toast} ${s['toast_'+type]}`}><I/><span><b>{title}</b>{text&&<small>{text}</small>}</span><button onClick={onClose}><X/></button></div>}
export function Drawer({open,title,text,onClose,children,footer}){if(!open)return null;return <div className={s.drawerLayer} onMouseDown={e=>e.target===e.currentTarget&&onClose()}><aside className={s.drawer}><header><div><h2>{title}</h2>{text&&<p>{text}</p>}</div><button onClick={onClose}><X/></button></header><main>{children}</main>{footer&&<footer>{footer}</footer>}</aside></div>}
export function Task({tone='brand',title,text,meta,action,onAction}){return <div className={`${s.task} ${s['task_'+tone]}`}><i/><div><b>{title}</b><span>{text}</span>{meta&&<small>{meta}</small>}</div>{action&&<button onClick={onAction}>{action}<ArrowRight/></button>}</div>}

