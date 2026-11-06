import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {allowed,href} from './config';
import {Badge} from './Shared';
import {RecordVisual} from './RecordVisuals';
import s from './Control.module.css';
export const recordHref=(module,id)=>`${href(module)}?record=${encodeURIComponent(id)}`;
export default function RecordRelations({module,record,actor}){
 const links=[];
 const add=(label,kind,id,permission)=>{if(id&&allowed(actor,permission))links.push([label,recordHref(kind,id)]);};
 const owner=record.ownerId||record.user||record.userId||record.owner;
 if(record.store){add('View store','stores',record.store,'stores.view');add('View store owner','users',owner,'users.view');}
 else if(!['users','subscriptions'].includes(module))add('View owner','users',owner,'users.view');
 if(module==='subscriptions')add('View subscriber','users',record._id,'users.view');
 if(module==='transactions')add('View current subscription','subscriptions',owner,'billing.view');
 if(module==='preferences')add('View account','users',record._id,'users.view');
 if(record.pageId)add('View landing page','pages',record.pageId,'pages.view');
 if(record.templateId)add('View template','templates',record.templateId,'templates.view');
 if(record.order)add('View order','orders',record.order,'orders.view');
 if(module==='templates'&&allowed(actor,'pages.view'))links.push([`Pages using template${record.pagesCount!==undefined?` (${record.pagesCount})`:''}`,`${href('pages')}?template=${record._id}`]);
 if(module==='activity'){
  const kinds={'Account registered':['users','users.view'],'Subscription payment recorded':['transactions','billing.view'],'Landing page created':['pages','pages.view'],'Storefront created':['stores','stores.view']};
  const target=kinds[record.event];if(target)add('View related record',target[0],record._id,target[1]);
 }
 if(module==='audit'&&/^[a-f0-9]{24}$/i.test(record.target||'')){
  const target=record.action?.startsWith('user.')?['users','users.view']:record.action?.startsWith('pages.')?['pages','pages.view']:record.action?.startsWith('links.')?['links','links.view']:null;
  if(target)add('View affected record',target[0],record.target,target[1]);
 }
 const store=record.storeInfo;
 return <>{record.store&&<section className={s.contextSection}><h3>Store information</h3>{store?<><div className={s.contextIdentity}><RecordVisual module="stores" record={store}/><div><strong>{store.name}</strong><small>{store._id}</small></div><span title="Existing legacy publication flag; V1.1 availability also depends on its page and account"><Badge value={store.isPublished?'Legacy published':'Legacy unpublished'}/></span></div>{record.ownerLabel&&<p className={s.muted}>{record.ownerLabel.name} · {record.ownerLabel.email}</p>}</>:<p className={s.muted}>{allowed(actor,'stores.view')?'Store missing or deleted.':'Store details require storefront access.'}</p>}</section>}
 {links.length>0&&<nav className={s.related} aria-label="Related records">{links.map(([label,url])=><Link key={label} href={url}>{label}<ArrowUpRight size={14}/></Link>)}</nav>}
 {module==='orders'&&record.items?.length>0&&<section className={s.contextSection}><h3>Ordered products</h3>{record.items.map((item,i)=><div className={s.orderItem} key={`${item.productId}-${i}`}><RecordVisual module="products" record={{name:item.name,images:[item.image]}}/><div>{item.productId&&allowed(actor,'products.view')?<Link href={recordHref('products',item.productId)}>{item.name||'View product'}<ArrowUpRight size={12}/></Link>:<strong>{item.name||'Product'}</strong>}<small>{item.quantity} × {item.price?.toLocaleString()} NGN</small></div></div>)}</section>}</>;
}
