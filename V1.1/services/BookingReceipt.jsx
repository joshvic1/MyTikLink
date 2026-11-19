import {useState} from 'react';
import {Copy,Check,CheckCircle2} from 'lucide-react';
import {money,paymentLabels,statusLabel} from './shared';
import {locationLabel,durationLabel} from './servicePresentation.mjs';
import ui from './publicService.module.css';
export default function BookingReceipt({receipt:r,data,onClose}){
 const [copied,setCopied]=useState(''),[copyError,setCopyError]=useState('');const service=r.service||data.service;
 const copy=async(label,value)=>{try{await navigator.clipboard.writeText(String(value));setCopied(label);setCopyError('');}catch{setCopyError('Could not copy. Please select and copy the details.');}};
 const row=(label,value,copyValue=value)=><div className={ui.transferRow} key={label}><div><small>{label}</small><strong>{value||'Not available'}</strong></div>{value&&<button type="button" aria-label={'Copy '+label.toLowerCase()} onClick={()=>copy(label,copyValue)}>{copied===label?<Check size={16}/>:<Copy size={16}/>}</button>}</div>;
 return <div className={ui.receipt}>
 {r.paymentMethod==='bank'?<section className={ui.bankPanel}><h2>Transfer to the account below</h2><p>Use these details to pay for your service.</p>{row('Account number',data.bank?.accountNumber)}{row('Bank name',data.bank?.name)}{row('Account name',data.bank?.accountName)}{row('Amount',money(r.totalMinor,r.currency),String(r.totalMinor/100))}{row('Payment reference',r.reference)}<span className={ui.paymentPending}>Awaiting payment verification</span>{data.paymentInstructions?.bank&&<p>{data.paymentInstructions.bank}</p>}</section>:<header className={ui.receiptHeading}><CheckCircle2 size={28}/><div><h2>Booking received</h2><p>Your details have been sent to {data.store.name}.</p></div></header>}
 {copyError&&<p role="alert" className={ui.fieldError}>{copyError}</p>}{copied&&<small role="status">{copied} copied.</small>}
 <section className={ui.receiptSummary}><div className={ui.bookingSummary}>{service.images?.[0]&&<img src={service.images[0]} alt=""/>}<div><strong>{service.name}</strong><small>{durationLabel(service)}</small></div></div><dl>{[['Booking reference',r.reference],['Total',money(r.totalMinor,r.currency)],['Payment method',paymentLabels[r.paymentMethod]],['Booking status',statusLabel(r.serviceStatus)],['Payment status',statusLabel(r.paymentStatus)],['Appointment',r.appointmentStart?new Date(r.appointmentStart).toLocaleString(undefined,{timeZone:r.timezone})+' · '+r.timezone:null],['Service option',locationLabel(r.locationMode)],...(r.customerDetails||[]).map(f=>[f.label,f.value])].filter(([,v])=>v).map(([label,value],i)=><div key={i}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
 {r.holdUntil&&<p className={ui.notice}>Your time is held until {new Date(r.holdUntil).toLocaleTimeString()}. After the hold expires, contact the business before paying.</p>}
 {r.paymentMethod==='whatsapp'&&data.whatsapp&&<a className={ui.primary} href={`https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hello, about '+service.name+'. Booking '+r.reference+'. Total '+money(r.totalMinor,r.currency))}`} target="_blank" rel="noreferrer">Continue on WhatsApp ↗</a>}
 {r.paymentMethod==='cod'&&<p className={ui.notice}>You selected Pay after service. No payment has been collected.</p>}
 <button type="button" className={ui.primary} onClick={onClose}>Done</button></div>;
}
