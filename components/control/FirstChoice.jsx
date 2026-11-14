import {useEffect,useState} from 'react';
import Link from 'next/link';
import {request} from './api';
import {recordHref} from './RecordRelations';
import {CreatedAt,Loading,ErrorBox,Empty} from './Shared';
import s from './Control.module.css';
import css from './FirstChoice.module.css';
const choices={storefront:'Storefront',landing_page:'Landing page',redirect_link:'Redirect link',not_sure:"I’m not sure yet"};
const types={business:'Business',creator:'Creator',physical:'Physical',digital:'Digital',physical_products:'Physical products',physical_services:'Physical services',digital_products:'Digital products',digital_services:'Digital services',not_sure:'Not sure (legacy)'};
const initial={search:'',category:'',intent:'',accountType:'',businessMode:'',businessFocus:'',from:'',to:'',sort:'newest'};
export default function FirstChoice(){
 const [filters,setFilters]=useState(initial),[page,setPage]=useState(1),[data,setData]=useState(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[tick,setTick]=useState(0);
 const update=(key,value)=>{setFilters(old=>({...old,[key]:value}));setPage(1);setData(null);};
 useEffect(()=>{const controller=new AbortController();setBusy(true);setError('');const timer=setTimeout(async()=>{try{const result=await request('/control/first-choice?'+new URLSearchParams({...filters,page:String(page)}),{signal:controller.signal});if(!controller.signal.aborted)setData(result);}catch(e){if(!controller.signal.aborted)setError(e.message);}finally{if(!controller.signal.aborted)setBusy(false);}},250);return()=>{clearTimeout(timer);controller.abort();};},[filters,page,tick]);
 const select=(key,label,values)=><label>{label}<select aria-label={label} value={filters[key]} onChange={e=>update(key,e.target.value)}><option value="">All</option>{Object.entries(values).map(([value,text])=><option key={value} value={value}>{text}</option>)}<option value="unrecorded">Not recorded</option></select></label>;
 return <section className={`${s.panel} ${css.card}`}><h2>What would you like to create first?</h2><p className={s.muted}>Saved setup choices, not a list of what each person has already created. Registration dates use West Africa Time (WAT).</p>
 <div className={css.filters}>
 <label className={css.search}>Search name or email<input type="search" value={filters.search} placeholder="Name, email or business name" onChange={e=>update('search',e.target.value)}/></label>
 {select('intent','First creation choice',choices)}
 <label>Business category<input type="search" placeholder="e.g. Packaged food" value={filters.category} onChange={e=>update('category',e.target.value)}/></label>
 {select('accountType','Account type',{business:'Business',creator:'Creator'})}
 {select('businessMode','Business type',{physical:'Physical',digital:'Digital'})}
 {select('businessFocus','Products or services',{physical_products:'Physical products',physical_services:'Physical services',digital_products:'Digital products',digital_services:'Digital services',not_sure:'Not sure (legacy)'})}
 <label>Registered from<input type="date" value={filters.from} onChange={e=>update('from',e.target.value)}/></label><label>Registered through<input type="date" value={filters.to} onChange={e=>update('to',e.target.value)}/></label>
 <label>Order<select value={filters.sort} onChange={e=>update('sort',e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
 </div><div className={css.actions}><button className={s.button} onClick={()=>{setFilters(initial);setPage(1);setData(null);}}>Clear filters</button><button className={s.button} disabled={busy} onClick={()=>setTick(n=>n+1)}>Refresh</button>{data&&!busy&&<span>{data.total.toLocaleString()} matching accounts</span>}</div>
 {error?<ErrorBox error={error} retry={()=>setTick(n=>n+1)}/>:busy?<Loading/>:!data?.items.length?<Empty/>:<><div className={css.tableWrap}><table className={s.table}><thead><tr><th>Name / registered</th><th>Email</th><th>Business category &amp; type</th><th>First creation choice</th></tr></thead><tbody>{data.items.map(user=>{const o=user.onboarding||{};return <tr key={user._id}><td><Link href={recordHref('users',user._id)}><strong>{user.name||'Unnamed account'}</strong></Link><CreatedAt value={user.createdAt} label="Registered"/>{o.publicName&&o.publicName!==user.name&&<small className={css.secondary}>{o.publicName}</small>}</td><td>{user.email||'Not recorded'}</td><td><strong>{o.category?.customLabel||o.category?.label||'Category not recorded'}</strong><small className={css.secondary}>{types[o.businessFocus]||types[o.businessMode]||'Business type not recorded'}{o.accountType?' · '+types[o.accountType]:''}</small></td><td><span className={css.choice}>{choices[o.intent]||'Not recorded'}</span></td></tr>})}</tbody></table></div><div className={css.actions}><button className={s.button} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {Math.max(1,Math.ceil(data.total/data.limit))} · 20 per page</span><button className={s.button} disabled={page*data.limit>=data.total} onClick={()=>setPage(p=>p+1)}>Next</button></div></>}
 </section>;
}
