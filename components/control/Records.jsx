import RecordRelations,{recordHref} from './RecordRelations';



import {RecordVisual,CopyLink,TemplatePreview} from './RecordVisuals';



import {useState,useEffect,useCallback} from 'react';



import Link from 'next/link';



import {useRouter} from 'next/router';



import {Search,SlidersHorizontal,ChevronLeft,ChevronRight,RefreshCw,ArrowUpRight} from 'lucide-react';



import {request} from './api';



import {columns,statuses,allowed,href} from './config';



import {useAdmin} from './Shell';



import {get,display,Badge,Empty,ErrorBox,Loading,Dialog,RecordFields,External,CreatedAt} from './Shared';



import s from './Control.module.css';



export default function Records({module}){



 const router=useRouter(),{actor}=useAdmin(),[search,setSearch]=useState(router.query.search||''),[debounced,setDebounced]=useState(router.query.search||''),[ownerSearch,setOwnerSearch]=useState(router.query.ownerSearch||''),[ownerTerm,setOwnerTerm]=useState(router.query.ownerSearch||''),[status,setStatus]=useState(router.query.status||''),[plan,setPlan]=useState(router.query.plan||''),[cycle,setCycle]=useState(router.query.cycle||''),[sort,setSort]=useState(router.query.sort||'newest'),[page,setPage]=useState(Number(router.query.page)||1),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[selected,setSelected]=useState(null),[tick,setTick]=useState(0);



 useEffect(()=>{const timer=setTimeout(()=>{setDebounced(search);setOwnerTerm(ownerSearch);},350);return()=>clearTimeout(timer);},[search,ownerSearch]);



 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');const params=new URLSearchParams({page:String(page),search:debounced,status,plan,cycle,sort,...(ownerTerm?{ownerSearch:ownerTerm}:{}),...Object.fromEntries(['owner','account','template','recovery','from','to','productType','paymentStatus','provider'].filter(k=>router.query[k]).map(k=>[k,router.query[k]]))});request(`/control/records/${module}?${params}`,{signal:c.signal}).then(setData).catch(e=>{if(e.name!=='AbortError'){setError(e.message);setData(null);}}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[module,page,debounced,status,plan,cycle,sort,tick,ownerTerm,router.query.owner,router.query.account,router.query.template,router.query.recovery,router.query.from,router.query.to,router.query.productType,router.query.paymentStatus,router.query.provider]);



 const [owners,setOwners]=useState([]),[ownerLabel,setOwnerLabel]=useState(''),[summary,setSummary]=useState(null);

 useEffect(()=>{if(!allowed(actor,'users.view')||!ownerTerm){setOwners([]);return;}const c=new AbortController();request(`/control/records/users?search=${encodeURIComponent(ownerTerm)}&limit=10`,{signal:c.signal}).then(r=>setOwners(r.items)).catch(()=>{});return()=>c.abort();},[ownerTerm,actor]);

 useEffect(()=>{if(!router.query.account)return;request(`/control/users/${router.query.account}`).then(r=>setOwnerLabel(r.user.email)).catch(()=>setOwnerLabel('Selected account'));},[router.query.account]);

 useEffect(()=>{if(module==='recovery')request('/control/recovery-summary').then(setSummary).catch(()=>{});},[module,tick]);

 const close=useCallback(()=>{setSelected(null);const {record,...query}=router.query;router.push({pathname:router.pathname,query},undefined,{shallow:true});},[router]),cols=(columns[module]||[]).filter(([key])=>key!=="createdAt");



 const [detailLoading,setDetailLoading]=useState(false),[detailError,setDetailError]=useState('');



 useEffect(()=>{setSelected(null);setDetailError('');if(!router.query.record){setDetailLoading(false);return;}const c=new AbortController();setDetailLoading(true);request(`/control/records/${module}/${encodeURIComponent(router.query.record)}`,{signal:c.signal}).then(r=>setSelected(r.item)).catch(e=>{if(e.name!=='AbortError')setDetailError(e.message);}).finally(()=>{if(!c.signal.aborted)setDetailLoading(false);});return()=>c.abort();},[module,router.query.record,tick]);



 function inspect(row){if(module==='activity'){setSelected(row);return;}router.push({pathname:router.pathname,query:{...router.query,search,status,plan,cycle,sort,page,ownerSearch,record:row._id}},undefined,{shallow:true});}



 function filter(setter,value){setter(value);setPage(1);}



 return <><div className={s.filterBar}><label className={s.search}><Search size={17}/><input aria-label="Search records" placeholder={`Search ${module.replace(/-/g,' ')}…`} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>



 {['pages','links','stores','products','orders','collections','discounts','transactions','deliveries','enrollments','recovery','recovery-emails','leads','store-leads','jobs','assets','tracking'].includes(module)&&<input className={s.ownerSearch} aria-label="Search owner by name or email" placeholder="Owner name or email" value={ownerSearch} onChange={e=>{setOwnerSearch(e.target.value);setPage(1);}}/>}



 {statuses[module]&&<label className={s.selectLabel}><SlidersHorizontal size={15}/><select aria-label="Filter status" value={status} onChange={e=>filter(setStatus,e.target.value)}><option value="">All statuses</option>{statuses[module].map(v=><option key={v} value={v}>{v==='true'?'Yes':v==='false'?'No':display(v)}</option>)}</select></label>}



 {['users','subscriptions'].includes(module)&&<><select aria-label="Filter plan" value={plan} onChange={e=>filter(setPlan,e.target.value)}><option value="">All plans</option>{['free','standard_monthly','standard_yearly','pro_monthly','pro_yearly'].map(p=><option key={p} value={p}>{display(p)}</option>)}</select><select aria-label="Billing cycle" value={cycle} onChange={e=>filter(setCycle,e.target.value)}><option value="">All cycles</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></>}



 {owners.length>0&&<select aria-label="Select matching account" value="" onChange={e=>{setOwnerSearch('');setOwnerTerm('');setPage(1);router.push({pathname:router.pathname,query:{...router.query,account:e.target.value,page:1}},undefined,{shallow:true});}}><option value="">Choose an account…</option>{owners.map(u=><option key={u._id} value={u._id}>{u.name} · {u.email}</option>)}</select>}

 {[["productType",module==='products'?['physical','digital','service']:[]],["paymentStatus",module==='orders'?['pending','paid','refunded']:[]],["provider",module==='transactions'?['current','legacy']:[]]].filter(([,values])=>values.length).map(([key,values])=><select key={key} aria-label={key} value={router.query[key]||''} onChange={e=>{setPage(1);router.push({pathname:router.pathname,query:{...router.query,[key]:e.target.value,page:1}},undefined,{shallow:true});}}><option value="">All {key==='provider'?'Paystack accounts':key==='productType'?'product types':'payment statuses'}</option>{values.map(v=><option key={v} value={v}>{v}</option>)}</select>)}

 {['from','to'].map(key=><label key={key}>{key==='from'?'From':'To'}<input type="date" value={router.query[key]||''} onChange={e=>{setPage(1);router.push({pathname:router.pathname,query:{...router.query,[key]:e.target.value,page:1}},undefined,{shallow:true});}}/></label>)}

 <button className={s.button} onClick={()=>{setSort('newest');setSearch('');setOwnerSearch('');setStatus('');setPlan('');setCycle('');setPage(1);router.push(href(module));}}>Reset filters</button><select aria-label="Sort records" value={sort} onChange={e=>filter(setSort,e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select><button onClick={()=>setTick(n=>n+1)} className={s.iconButton} aria-label="Refresh records"><RefreshCw size={17}/></button></div>



 {(router.query.owner||router.query.account||router.query.template)&&<div className={s.notice}>Filtered by {router.query.template?'template':router.query.account?'account':'owner or parent record'} <span>{router.query.account?ownerLabel:'Selected record'}</span>. <Link href={href(module)}>Clear filter</Link></div>}



 {module==='recovery'&&summary&&<p className={s.notice}>{summary.entered} enrolled · {summary.active} active · {summary.sent} emails accepted · {summary.failed} needing attention · {summary.converted} recovery-period upgrades ({(summary.conversionRate*100).toFixed(1)}%)</p>}

 {module==='recovery'&&<p className={s.notice}>Upgraded after enrollment counts recovery-period conversions, not proven email-attributed sales. Inspect email history for provider acceptance and failures. Times are anchored to the original attempt.</p>}

 {module==='orders'&&<p className={s.notice}>Merchant order totals are not MyTikLink subscription revenue. Private addresses, payment proofs and banking details are excluded.</p>}



 {module==='jobs'&&<p className={s.notice}>Retrying jobs can repeat customer messages. Existing worker retries remain authoritative; manual replay is not enabled.</p>}



 {module==='assets'&&<p className={s.notice}>Metadata from the existing storefront asset registry. No bucket-wide usage estimate or automatic orphan deletion.</p>}



 {error?<ErrorBox error={error} retry={()=>setTick(n=>n+1)}/>:<section className={s.panel}><div className={s.tableHeading}><span><strong>{data?.total?.toLocaleString()??'—'}</strong> records</span><small>Server-side search · 25 per page</small></div>{loading?<Loading/>:!data?.items.length?<Empty/>:<div className={s.tableWrap}><table className={s.table}><thead><tr>{cols.map(([key,label])=><th key={key}>{label}</th>)}<th><span className={s.srOnly}>Actions</span></th></tr></thead><tbody>{data.items.map(row=><tr key={row._id}>{cols.map(([key,label],i)=><td key={key} data-label={label}>{i===0?<div className={s.recordIdentity}><RecordVisual module={module} record={row}/><div className={s.identityText}><button className={s.recordLink} onClick={()=>inspect(row)}>{display(get(row,key),key)}</button><CreatedAt value={row.createdAt} label={module==="users"?"Joined":module==="subscriptions"?"Account created":["audit","activity"].includes(module)?"Recorded":"Created"}/>{module==='pages'&&row.templateInfo&&<small className={s.cellSub}>Template: {row.templateInfo.name}</small>}{module==='products'&&row.storeInfo&&<small className={s.cellSub}>{row.storeInfo.name}</small>}</div></div>:['status','plan','isActive','isPublished','enabled','v11Disabled','paymentStatus'].includes(key)?<Badge value={get(row,key)}/>:key.startsWith('ownerLabel.')&&row.ownerId&&allowed(actor,'users.view')?<Link className={s.contextLink} href={recordHref('users',row.ownerId)}>{display(get(row,key),key)}</Link>:key==='store'&&row.store&&allowed(actor,'stores.view')?<Link className={s.contextLink} href={recordHref('stores',row.store)}>{row.storeInfo?.name||row.store}{row.storeInfo?.name&&<small className={s.cellSub}>{row.store}</small>}</Link>:<span title={display(get(row,key),key)}>{display(get(row,key),key)}</span>}</td>)}<td data-label="Details"><button className={s.iconButton} aria-label={`Inspect ${get(row,cols[0]?.[0])||'record'}`} onClick={()=>inspect(row)}><ArrowUpRight size={17}/></button></td></tr>)}</tbody></table></div>}<div className={s.pagination}><span>Page {page} of {Math.max(1,Math.ceil((data?.total||0)/25))}</span><div><button disabled={page===1||loading} onClick={()=>setPage(p=>p-1)} className={s.button}><ChevronLeft size={15}/>Previous</button><button disabled={loading||page*25>=(data?.total||0)} onClick={()=>setPage(p=>p+1)} className={s.button}>Next<ChevronRight size={15}/></button></div></div></section>}



 {router.query.record&&(detailLoading||detailError)&&<Dialog title="Record details" onClose={close}>{detailLoading?<Loading/>:<ErrorBox error={detailError} retry={()=>setTick(n=>n+1)}/>}</Dialog>}



 {selected&&<Detail module={module} record={selected} onClose={close} onUpdated={()=>{close();setTick(n=>n+1);}} actor={actor}/>}</>;



}



function Detail({module,record,onClose,onUpdated,actor}){



 const [detail,setDetail]=useState(null),[error,setError]=useState(''),[action,setAction]=useState(''),[reason,setReason]=useState(''),[plan,setPlan]=useState(record.plan||'free'),[expiry,setExpiry]=useState(''),[name,setName]=useState(record.name||''),[phone,setPhone]=useState(record.whatsappNumber||''),[busy,setBusy]=useState(false),[confirmation,setConfirmation]=useState(''),[billingReviewed,setBillingReviewed]=useState(false);



 const account=['users','subscriptions'].includes(module);



 useEffect(()=>{if(account&&allowed(actor,'users.view')){const c=new AbortController();request(`/control/users/${record._id}`,{signal:c.signal}).then(setDetail).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>c.abort();}},[account,record._id,actor]);



 const user=detail?.user||record;



 async function save(e){e.preventDefault();setBusy(true);setError('');let path,body={reason},method='POST';



  if(action==='restrict'){path=`/control/users/${record._id}/restriction`;body.suspended=!user.suspendedAt;}



  if(action==='plan'){path=`/control/users/${record._id}/plan`;body.plan=plan;if(expiry)body.planExpiry=new Date(expiry).toISOString();}



  if(action==='profile'){path=`/control/users/${record._id}`;method='PATCH';body.name=name;body.whatsappNumber=phone;}



  if(action==='moderate'){path=`/control/moderate/${module}/${record._id}`;body.value=module==='pages'?!record.adminDisabled:!record.v11Disabled;}



  if(action==='delete'){path=`/control/users/${record._id}/delete`;body.confirmation=confirmation;body.billingReviewed=billingReviewed;}

  if(action==='cancel')path=`/control/deliveries/${record._id}/cancel`;



  try{await request(path,{method,body});onUpdated();}catch(e){setError(e.message);}finally{setBusy(false);}



 }



 return <Dialog title={account?user.name||'Account profile':'Record details'} onClose={busy?()=>{}:onClose} wide>



 {error&&<div className={s.error} role="alert">{error}</div>}



 {!account&&<div className={s.profileSummary}><RecordVisual module={module} record={record} large/><div><h3>{record.name||record.title||record.orderNumber||record.subject||record.journey||'Record details'}</h3><CreatedAt value={record.createdAt}/>{record.ownerLabel&&<p>{record.ownerLabel.name} · {record.ownerLabel.email}</p>}{module==='pages'&&record.templateInfo&&<p>Template: {record.templateInfo.name} · template preview</p>}</div></div>}



 {account&&<div className={s.profileSummary}><span className={s.largeAvatar}>{user.name?.slice(0,1)||'U'}</span><div><h3>{user.name||'Unnamed account'}</h3><p>{user.email}</p><Badge value={user.plan}/></div></div>}



 <div className={s.actionRow}>



 {account&&allowed(actor,'users.edit')&&<button className={s.button} onClick={()=>setAction('profile')}>Edit profile</button>}



 {account&&!user.deletedAt&&allowed(actor,'users.restrict')&&<button className={s.button} onClick={()=>setAction('restrict')}>{user.suspendedAt?'Restore access':'Suspend access'}</button>}



 {account&&actor.superAdmin&&!user.deletedAt&&<button className={s.button} style={{color:'#b42318'}} onClick={()=>setAction('delete')}>Delete account</button>}

 {account&&!user.deletedAt&&actor.superAdmin&&<button className={s.button} onClick={()=>setAction('plan')}>Change plan</button>}



 {module==='recovery'&&<Link className={s.button} href={href('recovery-emails')+'?recovery='+record._id}>View email history</Link>}

 {module==='pages'&&allowed(actor,'pages.moderate')&&<button className={s.button} onClick={()=>setAction('moderate')}>{record.adminDisabled?'Remove page restriction':'Restrict page'}</button>}



 {module==='links'&&allowed(actor,'links.moderate')&&<button className={s.button} onClick={()=>setAction('moderate')}>{record.v11Disabled?'Restore redirect':'Disable redirect'}</button>}



 {module==='deliveries'&&record.status==='pending'&&allowed(actor,'marketing.manage')&&<button className={s.button} onClick={()=>setAction('cancel')}>Cancel pending delivery</button>}



 {module==='pages'&&<External href={`https://mytiklink.com/v1-1/p/${encodeURIComponent(record.slug)}`}>Open published page</External>}



 {module==='stores'&&<External href={`https://mytiklink.com/v1-1/s/${encodeURIComponent(record.slug)}`}>Open storefront</External>}



 {module==='links'&&record.linkId&&<External href={`https://mytiklink.com/v1-1/r/${encodeURIComponent(record.linkId)}`}>Open redirect link</External>}



 {module==='links'&&<External href={record.destinationUrl}>Inspect destination</External>}



 {module==='products'&&record.storeSlug&&record.slug&&<External href={`https://mytiklink.com/v1-1/s/${encodeURIComponent(record.storeSlug)}/products/${encodeURIComponent(record.slug)}`}>Open product page</External>}



 {module==='products'&&!record.storeSlug&&<span className={s.muted}>Public product link unavailable: no storefront slug is recorded.</span>}



 {module==='links'&&record.linkId&&<CopyLink url={`https://mytiklink.com/v1-1/r/${encodeURIComponent(record.linkId)}`}/>}



 </div>



 <RecordRelations module={module} record={record} actor={actor}/>



 {module==='templates'&&<TemplatePreview record={record}/>}



 {action==='delete'&&<section role="alert"><h3>Delete this user account?</h3><p>This action removes account access and disables public resources. Financial records and merchant orders are retained.</p><p>{user.name} · {user.email} · {display(user.plan)}</p><p>{Object.entries(detail?.counts||{}).map(([k,v])=>`${v} ${k}`).join(' · ')}</p><label><input type="checkbox" checked={billingReviewed} onChange={e=>setBillingReviewed(e.target.checked)}/>I reviewed provider subscriptions, refunds and disputes.</label><label>Type DELETE<input value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label></section>}

 {action&&<form className={s.confirm} onSubmit={save}><h3>Confirm {action==='restrict'?(user.suspendedAt?'account restoration':'account suspension'):action==='moderate'?'availability change':action==='cancel'?'email cancellation':action==='profile'?'profile changes':action==='delete'?'account deletion':'plan change'}</h3><p>{action==='plan'?'Uses the existing plan-change service, including quota updates. This does not charge or refund the customer.':action==='restrict'?'Restricts authenticated account access. Published resources have separate moderation controls.':'This operation will be recorded in the administrative audit log.'}</p>



 {action==='plan'&&<><label>Plan<select value={plan} onChange={e=>setPlan(e.target.value)}>{['free','standard_monthly','standard_yearly','pro_monthly','pro_yearly'].map(v=><option key={v} value={v}>{display(v)}</option>)}</select></label><label>Expiry override (optional)<input type="datetime-local" value={expiry} onChange={e=>setExpiry(e.target.value)}/></label></>}



 {action==='profile'&&<><label>Name<input value={name} onChange={e=>setName(e.target.value)} maxLength={120}/></label><label>WhatsApp number<input value={phone} onChange={e=>setPhone(e.target.value)} maxLength={120}/></label></>}



 <label>Reason<textarea required minLength={8} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why this change is needed"/></label><div className={s.actionRow}><button type="button" disabled={busy} onClick={()=>setAction('')} className={s.button}>Cancel</button><button disabled={busy||reason.trim().length<8||(action==='delete'&&(confirmation!=='DELETE'||!billingReviewed))} className={s.primary}>{busy?'Saving…':'Confirm change'}</button></div></form>}



 {detail&&<><div className={s.notice}>Last observed activity: {display(detail.lastSeenAt,'lastSeenAt')}. Missing activity is not proof of inactivity.</div><div className={s.related}>{[['pages','pages.view'],['links','links.view'],['stores','stores.view'],['transactions','billing.view'],['products','products.view'],['orders','orders.view'],['subscriptions','billing.view'],['activity','overview.view'],['deliveries','marketing.view'],['enrollments','marketing.view']].filter(([,p])=>allowed(actor,p)).map(([key])=><Link key={key} href={`${href(key)}?account=${record._id}`}>{key.replace(/-/g,' ')}{detail.counts?.[key]!==undefined?` (${detail.counts[key]})`:''}<ArrowUpRight size={14}/></Link>)}</div></>}



 {module==='stores'&&<div className={s.related}>{[['products','products.view'],['orders','orders.view'],['collections','products.view'],['discounts','stores.view']].filter(([,p])=>allowed(actor,p)).map(([key])=><Link key={key} href={`${href(key)}?owner=${record._id}`}>{key}{record[key+'Count']!==undefined?` (${record[key+'Count']})`:''}<ArrowUpRight size={14}/></Link>)}</div>}



 {module==='recovery'&&record.schedule&&<section><h3>Recovery email schedule</h3><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Email</th><th>Subject</th><th>Scheduled</th><th>Status</th></tr></thead><tbody>{record.schedule.map(step=><tr key={step.step}><td>{step.step}</td><td>{step.subject}</td><td>{display(step.dueAt,'dueAt')}</td><td><Badge value={step.status}/></td></tr>)}</tbody></table></div></section>}
 <RecordFields record={Object.fromEntries(Object.entries(user).filter(([key])=>!['html','css','editableSchema','storeInfo','ownerLabel','templateInfo','schedule'].includes(key)))}/></Dialog>;



}
