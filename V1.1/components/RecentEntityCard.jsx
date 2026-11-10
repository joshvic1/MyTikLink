import ProductEditor from "../store/ProductEditor";
import {useState} from "react";
import {useRouter} from "next/router";
import LandingPageCard from "./LandingPageCard";
import {Modal,Button} from "./UI";
import {LeadsModal} from "./LeadsModal";
import {CreateLinkModal} from "./CreateLinkModal";
import {notify} from "./Notifications";
import {v11Api} from "../lib/api";
import {pageUrl} from "../lib/pageUrl";
import {pageThumbnail,pageHasLeadForm} from "../lib/pagePresentation";
import {linkUrl,recordedClicks} from "../lib/linkPresentation";
export default function RecentEntityCard({item,kind,index=0,refresh,onEdit,store,user,dashboardRow=false}){
 const router=useRouter(),[busy,setBusy]=useState(false),[panel,setPanel]=useState('');
 const isPage=kind==='page',isLink=kind==='link',product=kind==='product';
 const status=isPage?(item.isActive===false?'Inactive':item.availability==='plan_required'?'Plan required':item.slug?'Active':'Draft'):isLink?(item.v11Disabled?'Disabled':item.v11OwnerPaused?'Inactive':item.status || 'Active'):item.status || 'Product';
 const url=isPage&&item.slug?pageUrl(item):isLink?linkUrl(item):product&&store?.slug&&item.slug?`${typeof window!=='undefined'?window.location.origin:''}/s/${store.slug}/${item.slug}`:'';
 const rawImage=isPage?pageThumbnail(item):item.thumbnailUrl || item.imageUrl || item.image || item.images?.[0];
 const image=typeof rawImage==='string'?rawImage:rawImage?.url;
 const page={...item,title:product?item.name:item.title,slug:isLink?item.linkId:item.slug,availability:(status==='Active'||status==='published')?'active':status==='Plan required'?'plan_required':'inactive',hasLeadForm:isPage&&(item.hasLeadForm??pageHasLeadForm(item)),clicksCount:isLink?recordedClicks(item):item.clicksCount};
 const run=async fn=>{if(busy)return;setBusy(true);try{await fn();await refresh?.()}catch(e){notify.error(e.message || 'Action failed')}finally{setBusy(false)}};
 const edit=()=>{if(onEdit)return onEdit(item);if(isLink||product)return setPanel('edit');router.push(isPage?`/v1-1/pages/${item.builderType==='custom'?'builder':'editor'}?pageId=${item._id}`:`/v1-1/store/products?edit=${item._id}`)};
 const duplicate=()=>run(async()=>{if(isPage)await v11Api.duplicatePage(item._id);else await v11Api.createLink({title:`${item.title} (copy)`,linkType:item.linkType,platform:item.platform,destinationUrl:item.destinationUrl,fallbackUrl:item.fallbackUrl,whatsappCode:item.whatsappCode,prefill:item.prefill,templateId:item.templateId?._id || item.templateId});notify.success(isPage?'Page duplicated — copy is inactive':'Redirect link duplicated')});
 const toggle=value=>run(async()=>{if(isPage)await v11Api.setPageActive(item._id,value);else await v11Api.setLinkActive(item._id,value);notify.success(value?'Activated':'Deactivated')});
 return <><LandingPageCard dashboardRow={dashboardRow} page={page} index={index} entity={kind} thumbnail={image} fallback={String(page.title || kind).charAt(0).toUpperCase()} url={url} price={product?(item.price!=null?`₦${Number(item.price).toLocaleString()}`:'Price not set'):undefined} statusLabel={status} busy={busy} onCopy={async()=>{try{await navigator.clipboard.writeText(url);notify.success('Link copied')}catch{notify.error('Could not copy link')}}} onEdit={edit} onDuplicate={product?undefined:duplicate} onToggle={product||status==='Disabled'?undefined:toggle} onDelete={()=>setPanel('delete')} onStats={product?undefined:()=>setPanel('stats')} onLeads={()=>setPanel('leads')}/>
 {panel==='edit'&&product&&<ProductEditor product={item} onClose={()=>setPanel('')} onSaved={async()=>{setPanel('');await refresh?.()}}/>}
 {panel==='edit'&&isLink&&<CreateLinkModal link={item} onClose={()=>setPanel('')} onSaved={refresh}/>}
 {panel==='leads'&&<LeadsModal page={page} onClose={()=>setPanel('')}/>}
 {panel==='stats'&&<Modal title={isLink?'Link clicks':'Views & clicks'} onClose={()=>setPanel('')}><p>{isPage&&<>Views: <b>{item.viewsCount || 0}</b><br/></>}Clicks: <b>{page.clicksCount || 0}</b></p><p>{isLink?'Recorded redirect clicks, including previous cycles.':'Session-based counts; repeated actions within 30 minutes are deduplicated.'}</p></Modal>}
 {panel==='delete'&&<Modal title={`Delete ${kind}?`} description="This cannot be undone." onClose={()=>!busy&&setPanel('')} footer={<><Button variant="secondary" disabled={busy} onClick={()=>setPanel('')}>Cancel</Button><Button variant="danger" disabled={busy} onClick={()=>run(async()=>{if(isPage)await v11Api.deletePage(item._id);else if(isLink)await v11Api.deleteLink(item._id);else await v11Api.deleteProduct(item._id);setPanel('');notify.success(`${kind} deleted`)})}>{busy?'Deleting…':'Delete'}</Button></>}><p>{page.title}</p>{isPage&&<p>Collected leads will also be deleted. Export them from View leads first if you need a copy.</p>}</Modal>}</>;
}
