import { useState } from "react";
import Link from "next/link";
import { Home, Link2, FileText, Store, ShoppingBag, Users, BarChart3, Target, Settings, CircleHelp, Bell, Plus, Menu, X, ChevronDown, Search } from "lucide-react";
import s from "../v2.module.css";

const items=[['Overview','/v2',Home],['Links','/v2/links',Link2],['Pages','/v2/pages',FileText],['Store','/v2/store',Store],['Orders','/v2/orders',ShoppingBag],['Leads','/v2/leads',Users],['Analytics','/v2/analytics',BarChart3],['Tracking','/v2/tracking',Target]];
export default function Shell({ path, children, onCreate }){
 const [open,setOpen]=useState(false);
 return <div className={s.shell}><aside className={`${s.sidebar} ${open?s.sidebarOpen:''}`}><div className={s.brand}><b>M</b><strong>MyTikLink</strong><span>V2</span></div><button className={s.closeNav} onClick={()=>setOpen(false)}><X size={19}/></button><nav><small>WORKSPACE</small>{items.map(([name,href,Icon])=><Link key={href} href={href} className={(path===href||(href!='/v2'&&path.startsWith(href)))?s.navActive:''} onClick={()=>setOpen(false)}><Icon size={18}/><span>{name}</span>{name==='Orders'&&<i>4</i>}</Link>)}</nav><div className={s.navBottom}><Link href="/v2/help"><CircleHelp size={18}/><span>Help & support</span></Link><Link href="/v2/settings"><Settings size={18}/><span>Settings</span></Link><div className={s.account}><b>DA</b><div><strong>David A.</strong><small>Pro plan</small></div><ChevronDown size={15}/></div></div></aside>{open&&<button className={s.navScrim} onClick={()=>setOpen(false)}/>}<main><header className={s.topbar}><button className={s.menu} onClick={()=>setOpen(true)}><Menu size={20}/></button><div className={s.globalSearch}><Search size={16}/><span>Search workspace</span><kbd>⌘ K</kbd></div><div><button className={s.notify}><Bell size={18}/><i/></button><button className={s.create} onClick={onCreate}><Plus size={16}/> Create <ChevronDown size={14}/></button></div></header><div className={s.viewport}>{children}<p className={s.prototype}>V2 product prototype · Sample data only</p></div></main></div>
}

