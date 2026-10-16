import { useEffect, useRef, useState } from 'react';
import { SummaryMetrics } from '../components/SummaryMetrics';
import { notify } from '../components/Notifications';
import { Button, EmptyState, PageHeader, Modal, LoadingState } from '../components/UI';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { Plus, Search, Trash2 } from 'lucide-react';
import { v11Api } from '../lib/api';
import { linkUrl, recordedClicks, destinationLabel } from '../lib/linkPresentation';
import { useLinkCollection } from '../hooks/useLinkCollection';
import styles from '../styles/v11.module.css';
export function LinksPage({onCreate,onEdit,revision=0}) {
 const [query,setQuery]=useState(''),[page,setPage]=useState(1),[copiedId,setCopiedId]=useState('');
 const [pendingDelete,setPendingDelete]=useState(null),[deleting,setDeleting]=useState(false),[deleteError,setDeleteError]=useState('');
 const data=useLinkCollection(query,page,revision),timer=useRef(null);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(!data.loading&&!data.error&&page>data.totalPages)setPage(data.totalPages);},[data.loading,data.error,data.totalPages,page]);
 const copy=async link=>{try{await navigator.clipboard.writeText(linkUrl(link));setCopiedId(link._id);clearTimeout(timer.current);timer.current=setTimeout(()=>setCopiedId(''),1800);}catch{notify.error('Could not copy. Please try again.');}};
 const remove=async()=>{
  if(deleting)return;setDeleting(true);setDeleteError('');
  try{await v11Api.deleteLink(pendingDelete._id);setPendingDelete(null);notify.success('Redirect link and its click history deleted');await data.refresh();}catch(e){setDeleteError(e.message);}finally{setDeleting(false);}
 };
 return <div className={`${styles.page} ${styles.landingPagesView} ${styles.redirectLinksView}`}>
  <PageHeader title="Redirect Links"/>
  <SummaryMetrics label="Redirect link statistics" items={[{label:'Links',value:data.summary?.links},{label:'Recorded clicks',value:data.summary?.clicks}]}/>
  <p className={styles.linkMetricNote}>Saved click totals, including archived usage. Repeat visitors can count again; these are not unique people.</p>
  {(data.summary?.links>0||query)&&<div className={styles.landingPageToolbar}><label className={styles.search}><Search size={16}/><input aria-label="Search redirect links" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Search name or destination"/></label><Button onClick={onCreate}><Plus size={16}/>Create</Button></div>}
  {data.error&&<div className={styles.inlineError} role="alert">{data.error} <Button variant="secondary" onClick={data.refresh}>Retry</Button></div>}
  {data.loading&&!data.summary?<LoadingState label="Loading redirect links"/>:<>
   <div aria-busy={data.loading} className={styles.workspaceCardGrid}>{data.links.map(link=><WorkspaceCard key={link._id} fallback={(link.title||'R').charAt(0).toUpperCase()} title={link.title} status={link.status} statusTone={link.status==='Active'?'success':'warning'} url={linkUrl(link).replace(/^https?:\/\//,'')} href={linkUrl(link)} destination={destinationLabel(link)} copied={copiedId===link._id} onCopy={()=>copy(link)} metrics={[{label:'Recorded clicks',value:recordedClicks(link)},{label:'Current period',value:link.currentClicks}]} primaryLabel="Edit link" onPrimary={()=>onEdit(link)} onDelete={()=>{setDeleteError('');setPendingDelete(link);}}/>)}</div>
   {!data.error&&!data.loading&&!data.links.length&&<EmptyState icon="↗" title={query?'No matching links':'Create your first redirect link'} description={query?'Try another name or destination.':'Send visitors to your website, WhatsApp or another social platform.'} action={query?<Button variant="secondary" onClick={()=>{setQuery('');setPage(1);}}>Clear search</Button>:<Button onClick={onCreate}><Plus size={16}/>Create redirect link</Button>}/>}
   {data.totalPages>1&&<nav className={styles.templatePagination} aria-label="Redirect link pages"><Button variant="secondary" disabled={page===1||data.loading} onClick={()=>setPage(p=>p-1)}>Previous</Button><span>Page {page} of {data.totalPages}</span><Button variant="secondary" disabled={page>=data.totalPages||data.loading} onClick={()=>setPage(p=>p+1)}>Next</Button></nav>}
  </>}
  {pendingDelete&&<Modal className={styles.deleteConfirm} title="Delete redirect link?" description="This cannot be undone." onClose={()=>!deleting&&setPendingDelete(null)} footer={<><Button variant="secondary" disabled={deleting} onClick={()=>setPendingDelete(null)}>Keep link</Button><Button variant="danger" disabled={deleting} onClick={remove}>{deleting?'Deleting…':'Delete link'}</Button></>}><div className={styles.deleteConfirmIcon}><Trash2 size={22}/></div><h3>{pendingDelete.title}</h3><p>{linkUrl(pendingDelete)}</p><p>This removes the link, its saved click history and temporary visit records. Its clicks will also disappear from your totals. Visitors will no longer be redirected.</p>{deleteError&&<p role="alert" className={styles.inlineError}>{deleteError}</p>}</Modal>}
 </div>;
}
