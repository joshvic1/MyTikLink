import {useEffect,useState} from 'react';
import {Search,LockKeyhole} from 'lucide-react';
import {Button,EmptyState,PageHeader} from '../components/UI';
import {useSubscription} from '../components/SubscriptionModal';
import {apiRequest} from '../lib/api';
import styles from '../styles/v11.module.css';
import css from './AnalyticsPage.module.css';
export function AnalyticsPage({user,payments=[]}){
 const previous=[...payments].filter(p=>p.status==='successful').sort((a,b)=>new Date(b.paidAt||b.createdAt||0)-new Date(a.paidAt||a.createdAt||0))[0];
 const priorPlan=previous?.plan||user?.plan||'';
 const renew=priorPlan.startsWith('pro')&&(user?.plan==='free'||(user?.planExpiry&&new Date(user.planExpiry).getTime()<=Date.now()));

 const {openSubscription}=useSubscription();const [kind,setKind]=useState('links'),[search,setSearch]=useState(''),[page,setPage]=useState(1),[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[locked,setLocked]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');setData(null);const timer=setTimeout(()=>apiRequest(`/v1-1/analytics?kind=${kind}&page=${page}&search=${encodeURIComponent(search)}`,{signal:c.signal}).then(d=>{setData(d);setLocked(false);}).catch(e=>{if(c.signal.aborted)return;if(e.details?.code==='ANALYTICS_PLAN_REQUIRED'||e.status===403)setLocked(true);else setError(e.message);}).finally(()=>{if(!c.signal.aborted)setLoading(false);}),250);return()=>{clearTimeout(timer);c.abort();};},[kind,search,page,retry]);
 useEffect(()=>{const refresh=()=>setRetry(x=>x+1);window.addEventListener('v11:plan-updated',refresh);return()=>window.removeEventListener('v11:plan-updated',refresh);},[]);
 return <div className={styles.page}><PageHeader title="Analytics & Insights"/>
 {locked?<><section className={css.upgrade}><LockKeyhole size={22}/><h2>Unlock your full analytics</h2><p>Upgrade to Pro to see how your links, pages, and products are performing.</p><Button onClick={()=>openSubscription({mode:renew?'renew':'upgrade',preselected:'pro',plan:renew?priorPlan:undefined})}>{renew?'Renew Pro':'Upgrade to Pro'}</Button></section><p className={css.example}>Illustrative preview — these are not your account’s figures.</p><div className={css.preview} aria-hidden="true">{['Total clicks','Page views','Product orders'].map(label=><article key={label}><b>{label}</b><strong>1,240</strong></article>)}</div></>:<>
 <div className={css.controls}><label className={styles.search}><Search size={17}/><input aria-label="Search analytics" placeholder="Search by name…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label><select aria-label="Analytics category" value={kind} onChange={e=>{setKind(e.target.value);setPage(1);}}><option value="links">Redirect Links</option><option value="pages">Landing Pages</option><option value="products">Products</option></select></div>
 {error?<div role="alert" className={styles.inlineError}>{error}<Button onClick={()=>setRetry(x=>x+1)}>Retry</Button></div>:loading?<div className={css.skeleton} role="status" aria-label="Loading analytics"><i/><i/><i/></div>:<><div className={styles.redirectInsightList}>{data?.items.map(item=><article key={item._id}><b>{item.name||'Untitled'}</b><div className={css.metrics}>{[['views','Total views'],['clicks','Total clicks'],['orders','Orders received']].filter(([key])=>item[key]!==undefined).map(([key,label])=><strong key={key}>{Number(item[key]).toLocaleString()}<small>{label}</small></strong>)}</div></article>)}</div>{!data?.items.length&&<EmptyState title="No matching items" description="Try another name or category."/>}{data?.totalPages>1&&<nav className={styles.templatePagination}><Button variant="secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button><span>{page} / {data.totalPages}</span><Button variant="secondary" disabled={page===data.totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button></nav>}</>}
 </>}</div>;
}
