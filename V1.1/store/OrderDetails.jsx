import {FaWhatsapp} from 'react-icons/fa';
import {History,RotateCcw,ExternalLink} from 'lucide-react';
import {useState,useRef,useEffect} from 'react';
import {Modal,Button,Badge} from '../components/UI';
import {apiRequest,v11Api} from '../lib/api';
import {normalizeLeadPhone} from '../lib/leadPhone';
import {notify} from '../components/Notifications';
import styles from './OrderDetails.module.css';
const money=(n,c='NGN')=>new Intl.NumberFormat('en-NG',{style:'currency',currency:c}).format(Number(n||0));
const date=value=>value?new Date(value).toLocaleString():'—';
const reference=o=>o.orderNumber||`#${String(o._id).slice(-6).toUpperCase()}`;
export function OrderHistory({order:initialOrder,onClose}){
 const [order,setOrder]=useState(initialOrder);
 useEffect(()=>{let active=true;apiRequest(`/v1-1/store-studio/commerce/orders/${initialOrder._id}`).then(value=>{if(active)setOrder(value);}).catch(()=>{});return()=>{active=false;};},[initialOrder._id]);
 const events=[{at:order.createdAt,action:'Order created',actor:'Customer'},...(order.timeline||[])];
 return <Modal title="Order history" description={reference(order)} onClose={onClose}><ol className={styles.history}>{events.map((event,index)=><li key={index}><strong>{String(event.action||'Order updated').replaceAll('_',' ')}</strong><time>{date(event.at)}</time><small>{event.actorName||event.actor||'System'}</small>{event.previous&&event.next&&<p>{Object.keys(event.next).filter(key=>event.next[key]!==event.previous[key]).map(key=>`${key.replace(/([A-Z])/g,' $1')}: ${event.previous[key]||'—'} → ${event.next[key]}`).join(' · ')}</p>}</li>)}</ol>{order.emailDeliveries?.length>0&&<section className={styles.section}><h3>Email delivery history</h3>{order.emailDeliveries.map(job=><div key={job._id}><strong>{job.kind.replaceAll('_',' ')} · {job.status}</strong><p>{job.attempts} attempt(s){job.sentAt?` · Accepted ${date(job.sentAt)}`:''}</p>{job.lastError&&<p>{job.lastError}</p>}{job.deliveryAttempts?.map((attempt,i)=><p key={i}>{date(attempt.at)} · {attempt.status}{attempt.provider?` · ${attempt.provider}`:''}{attempt.providerId?` · ${attempt.providerId}`:''}</p>)}</div>)}</section>}</Modal>;
}
const confirmations={
 reset:['Reset order processing?','This only resets an active unpaid, undispatched order to its initial processing state. Payments, customer details, items, history and previously sent emails remain unchanged.'],
 resend_access:['Resend digital access?','Send the customer another email with their digital purchases. This does not create another order or charge them again.'],
 paid:['Mark order as paid?','Confirm that you have received payment. The customer will receive a payment confirmation, and digital purchases will become available.'],
 cancelled:['Cancel order?','This stops processing the order. The customer will be notified. This does not issue a refund.'],
 shipped:['Mark order as shipped?','Confirm that the physical items have been dispatched to the customer.'],
 delivered:['Mark order as delivered?','Confirm that the customer has received the physical items.'],
 refunded:['Record completed refund?','Only continue if you have already returned the payment outside MyTikLink. This records the refund; it does not transfer money or restock items.'],
};
export default function OrderDetails({order:initialOrder,onClose,onUpdate}){
 const [order,setOrder]=useState(initialOrder);
 useEffect(()=>{let active=true;const refresh=()=>apiRequest(`/v1-1/store-studio/commerce/orders/${initialOrder._id}`).then(value=>{if(active)setOrder(value);}).catch(()=>{});refresh();const timer=setInterval(refresh,5000);return()=>{active=false;clearInterval(timer);};},[initialOrder._id]);
 const [confirm,setConfirm]=useState(null),[busy,setBusy]=useState(false),[history,setHistory]=useState(false),guard=useRef(false);
 const paid=order.paymentStatus==='paid'||(!order.paymentStatus&&['paid','shipped','delivered'].includes(order.status));
 const cancelled=order.orderStatus==='cancelled'||order.status==='cancelled';
 const fulfillment=order.fulfillmentStatus||'unfulfilled',physical=order.items?.some(item=>item.productType!=='digital');
 const actions=cancelled?[]:!paid?[['paid','Mark as paid'],['cancelled','Cancel order']]:physical&&fulfillment==='unfulfilled'?[['shipped','Mark as shipped']]:physical&&fulfillment==='shipped'?[['delivered','Mark as delivered']]:[];
 if(paid&&!cancelled)actions.push(['refunded','Record completed refund']);
 const phone=normalizeLeadPhone(order.customerPhone,order.address?.countryCode),currency=order.totals?.currency||'NGN';
 const update=async()=>{if(guard.current)return;guard.current=true;setBusy(true);try{const saved=await apiRequest(`/v1-1/store-studio/commerce/orders/${order._id}`,{method:'PATCH',body:JSON.stringify({action:confirm,updatedAt:order.updatedAt})});notify.success(confirm==='paid'?'Payment confirmed':confirm==='resend_access'?'Digital access email queued':confirm==='reset'?'Order processing reset':'Order updated');setConfirm(null);setOrder(saved);onUpdate(saved);}catch(e){notify.error(e.message||'Could not update this order.');}finally{guard.current=false;setBusy(false);}};
 const paymentMessage=order.items?.some(item=>item.productType==='digital')?'Are you sure you want to mark this order as paid? The customer will receive payment confirmation and a link to view access details for their digital purchase.':'Are you sure you want to mark this order as paid? The customer will receive a payment confirmation email.';
 const cancelledAt=[...(order.timeline||[])].reverse().find(e=>e.action==='cancelled')?.at;
 const breakdown=order.totals?[['Subtotal',order.totals.subtotalMinor],['Discount',-Number(order.totals.discountMinor||0)],['Shipping',order.totals.shippingMinor],['Tax',order.totals.taxMinor],['Total',order.totals.totalMinor]]:[['Subtotal',Number(order.subtotal||0)*100],['Total',Number(order.subtotal||0)*100]];
 return <><Modal title={reference(order)} description={`Created ${date(order.createdAt)}`} onClose={()=>!busy&&onClose()} headerContent={order.paymentProof&&['bank','bank_transfer'].includes(order.paymentMethod)?<a className={styles.proof} href={order.paymentProof} target="_blank" rel="noopener noreferrer"><ExternalLink size={13}/>View payment proof</a>:null} footer={actions.length>0?<div className={styles.actions}>{actions.map(([key,label])=><Button key={key} className={key==='cancelled'?styles.danger:''} variant={['cancelled','refunded'].includes(key)?'secondary':'primary'} onClick={()=>setConfirm(key)} disabled={busy}>{label}</Button>)}</div>:null}>
 <div className={styles.meta}>{cancelledAt&&<small>Cancelled {date(cancelledAt)}</small>}</div>
 <div className={styles.badges}><Badge tone={paid?'success':'warning'}>{cancelled?'Cancelled':paid?'Paid':'Pending payment'}</Badge><Badge>{physical?(fulfillment==='delivered'?'Delivered':fulfillment==='shipped'?'Shipped':'Not delivered'):'Digital order'}</Badge></div>
 <section className={styles.section}><h3>Customer</h3><strong>{order.customerName||'Customer'}</strong><p>{order.customerEmail||'No email provided'}</p>{phone?<p className={styles.phone}>{phone}<a aria-label="Message customer on WhatsApp" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phone.slice(1)}`}><FaWhatsapp size={16}/></a></p>:order.customerPhone&&<p>{order.customerPhone}</p>}{order.customerAddress&&<p>{order.customerAddress}</p>}</section>
 <section className={styles.section}><h3>Items</h3>{(order.items||[]).map((item,i)=><div className={styles.item} key={`${item.productId}-${i}`}><img src={item.image||'/placeholder.png'} alt=""/><div><strong>{item.name||'Product'}</strong><small>Quantity {item.quantity||1}{Object.values(item.selectedVariants||{}).length?` · ${Object.values(item.selectedVariants).join(', ')}`:''}</small></div><b>{money(Number(item.price||0)*Number(item.quantity||1),currency)}</b></div>)}</section>
 <section className={styles.section}><h3>Order total</h3><dl className={styles.totals}>{breakdown.map(([label,amount])=><div key={label}><dt>{label}</dt><dd>{money(amount/100,currency)}</dd></div>)}</dl>{order.notes&&<p>{order.notes}</p>}</section>

 {order.items?.some(item=>item.productType==='digital')&&<section className={styles.section}><h3>Digital delivery</h3><p>{({pending:'Sending',sending:'Sending',sent:'Sent',failed:'Failed'})[order.digitalDelivery?.status]||'Not sent'}</p><small>Sent means the email provider accepted the message; it does not confirm inbox delivery.</small>{paid&&!cancelled&&<button className={styles.link} disabled={busy||(['pending','sending'].includes(order.digitalDelivery?.status)&&Date.now()-new Date(order.digitalDelivery?.requestedAt||0).getTime()<120000)} onClick={()=>setConfirm('resend_access')}>Resend digital access</button>}</section>}
 {<button className={`${styles.link} ${styles.reset}`} disabled={busy||paid||cancelled||['shipped','delivered'].includes(fulfillment)} onClick={()=>setConfirm('reset')}><RotateCcw size={14}/>Reset order to default</button>}
 <button className={styles.link} onClick={()=>setHistory(true)}><History size={14}/>View order history</button>
 </Modal>{history&&<OrderHistory order={order} onClose={()=>setHistory(false)}/>}{confirm&&<Modal title={confirmations[confirm][0]} onClose={()=>!busy&&setConfirm(null)} footer={<div className={styles.confirmActions}><Button variant="secondary" disabled={busy} onClick={()=>setConfirm(null)}>Cancel</Button><Button disabled={busy} onClick={update}>{busy?'Updating…':'Confirm'}</Button></div>}><p>{confirm==='paid'?paymentMessage:confirmations[confirm][1]}</p></Modal>}</>;
}
