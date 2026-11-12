import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Building2,Check,Copy,CreditCard,LoaderCircle,ShieldCheck} from 'lucide-react';
import {v11Api} from '../lib/api';
import {Button} from './UI';
import css from './UpgradePayment.module.css';

export default function UpgradePayment({cardOnly=false,selected,cycle,plan,payableAmount=plan.cycles[cycle].price,keepExpiry,sourceRedirectSlug,onBack,onSuccess,onBusyChange}){
 const [autoRenew,setAutoRenew]=useState(true),[transfer,setTransfer]=useState(null),[busy,setBusy]=useState(false),[checking,setChecking]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[copied,setCopied]=useState(''),[now,setNow]=useState(Date.now()),[cardReference,setCardReference]=useState('');
 useEffect(()=>{onBusyChange?.(busy||checking);return()=>onBusyChange?.(false)},[busy,checking,onBusyChange]);
 const working=useRef(false),done=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const finish=async result=>{if(done.current)return;await onSuccess(result);done.current=true;};
 const check=async(manual=false)=>{
  if(!transfer||working.current||done.current)return;working.current=true;if(manual){setChecking(true);setError('');}
  try{const result=await v11Api.verifyPayment(transfer.reference);if(!mounted.current)return;if(result.success)await finish(result);else if(manual)setNotice('Your transfer has not been confirmed yet. We’ll keep checking. Please do not pay again.');}
  catch(e){if(manual&&mounted.current)setError(e.message)}finally{working.current=false;if(mounted.current)setChecking(false)}
 };
 useEffect(()=>{if(!transfer)return;const timer=setInterval(()=>{setNow(Date.now());if(document.visibilityState==='visible'&&Date.now()<new Date(transfer.expiresAt).getTime()+15*60000)void check();},10000);return()=>clearInterval(timer)},[transfer]);
 const copy=async(label,value)=>{try{await navigator.clipboard.writeText(String(value));setCopied(label);setTimeout(()=>setCopied(''),1800)}catch{setError('Could not copy automatically. Select and copy the details below.')}};
 const start=async method=>{
  if(busy)return;setBusy(true);setError('');setNotice('');
  try{
   if(method==='transfer'){const data=await v11Api.initiateTransfer({plan:selected,cycle,keepExpiry,sourceRedirectSlug});if(!data.accountNumber||!data.bankName)throw new Error('Transfer details are unavailable. Please retry.');setTransfer(data);return;}
   const data=await v11Api.initiatePayment(selected,cycle,keepExpiry,sourceRedirectSlug,autoRenew);
   setCardReference(data.paymentId||'');
   if(!data.accessCode)throw new Error('Checkout could not be prepared. Please retry.');
   if(!window.PaystackPop){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://js.paystack.co/v2/inline.js';script.onload=resolve;script.onerror=()=>reject(new Error('Could not load Paystack. Check your connection and retry.'));document.body.appendChild(script);});}
   new window.PaystackPop().resumeTransaction(data.accessCode,{onSuccess:response=>{setCardReference(response.reference);void(async()=>{try{const verified=await v11Api.verifyPayment(response.reference);if(!verified.success)throw new Error('Payment is awaiting confirmation. Please check payment history before paying again.');await finish(verified)}catch(e){setError(e.message)}finally{setBusy(false)}})()},onCancel:()=>{setBusy(false);setCardReference('')},onError:e=>{setError(e.message||'Could not open card checkout.');setBusy(false)}});
   return;
  }catch(e){setError(e.message);setBusy(false)}finally{if(method==='transfer')setBusy(false)}
 };
 const expired=transfer&&new Date(transfer.expiresAt).getTime()<=now;
 return <div className={css.payment}>
  {cardReference&&!busy?<section className={css.bankDetails}><h3>Check your card payment</h3><p className={css.oneOff}>If you completed checkout, check its status before making another payment.</p><Button disabled={checking} onClick={async()=>{setChecking(true);setError('');try{const result=await v11Api.verifyPayment(cardReference);if(result.success)await finish(result);else setNotice('Payment is not confirmed yet. Check again shortly.')}catch(e){setError(e.message)}finally{setChecking(false)}}}>{checking?'Checking…':'Check payment status'}</Button><button className={css.back} onClick={()=>{setCardReference('');setNotice('')}}>I did not pay — choose a payment method</button></section>:!transfer?<><h3 className={css.paymentQuestion}>{cardOnly?"Add your card with a plan payment":"How would you like to pay?"} <span>(₦{Number(payableAmount).toLocaleString()})</span></h3>{!cardOnly&&<button className={`${css.method} ${css.transferMethod}`} disabled={busy} onClick={()=>start('transfer')}><span className={css.icon}><Building2/></span><span><b>Pay with bank transfer</b><small>Generate an account number.</small></span>{busy?<LoaderCircle className={css.spin}/>:<ArrowRight size={18}/>}</button>}
   <section className={css.cardMethod}><div className={css.cardTitle}><span className={css.icon}><CreditCard/></span><span><b>Pay with card</b><small>Secure checkout with Paystack.</small></span></div><label className={`${css.consent} ${css.designedConsent}`}><input type="checkbox" checked={autoRenew} disabled={busy} onChange={e=>setAutoRenew(e.target.checked)}/><span className={css.tickBox}><Check size={12}/></span><span>Auto-renew my subscription every {cycle==='yearly'?'year':'month'}{payableAmount!==plan.cycles[cycle].price&&` (₦${Number(plan.cycles[cycle].price).toLocaleString()})`}<small>Cancel anytime in Settings → Payments.</small></span></label><Button disabled={busy} onClick={()=>start('card')}>{busy?<><LoaderCircle className={css.spin}/>Preparing…</>:<>Pay with card<ArrowRight size={16}/></>}</Button></section></>:
   <section className={css.bankDetails}><div className={css.bankHeading}><Building2/><div><h3>{expired?'Transfer account expired':'Your transfer details'}</h3><p>{expired?'Do not send money to this account. If you already paid, check payment status.':'Send the exact amount to the account below.'}</p></div></div>{[['Amount',`₦${Number(transfer.amount).toLocaleString()}`,transfer.amount],['Account number',transfer.accountNumber,transfer.accountNumber],['Bank name',transfer.bankName,transfer.bankName],['Account name',transfer.accountName,transfer.accountName]].filter(([,value])=>value).map(([label,value,raw])=><div className={css.detail} key={label}><span><small>{label}</small><b>{value}</b></span><button aria-label={`Copy ${label.toLowerCase()}`} onClick={()=>copy(label,raw)}>{copied===label?<Check size={17}/>:<Copy size={17}/>}</button></div>)}<p className={css.expiry}>Valid until {new Date(transfer.expiresAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}. Use only for this payment.</p><Button disabled={checking} onClick={()=>check(true)}>{checking?<><LoaderCircle className={css.spin}/>Checking…</>:'I have made the transfer'}</Button><p className={css.oneOff}>Confirmation is automatic. No auto-renewal.</p></section>}
  {notice&&<p className={css.notice} role="status">{notice}</p>}{error&&<p className={css.error} role="alert">{error}</p>}<p className={css.secure}><ShieldCheck size={15}/>Payments secured by Paystack</p>
 </div>;
}
