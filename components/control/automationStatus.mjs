export function deliveryExplanation(item) {
 const event=item.providerEvent;
 if(event==='read')return 'Read by the customer on WhatsApp.';
 if(event==='delivered')return 'Delivered to the customer on WhatsApp.';
 if(event==='failed')return 'Meta reported a delivery failure.'+(item.automation?.errorCode?' Meta code '+item.automation.errorCode+'.':'');
 if(event==='sent')return 'Meta confirmed sending; delivery has not yet been confirmed.';
 if(item.status==='accepted')return 'Meta accepted this message. No delivery receipt has arrived yet; delivery is unconfirmed.';
 const reasons={
  'no-longer-eligible':'Not sent: the customer no longer meets this reminder’s conditions. This does not mean Meta rejected the template.',
  'state-changed-before-send':'Not sent: the customer’s account, phone, preference, or automation setting changed before sending.',
  'expired-job':'Not sent: this reminder’s sending window ended. The template’s approval has not expired.',
  'automation-disabled':'Paused: this automation is switched off.',
  'template-status-needs-sync':'Waiting for a fresh template status from Meta.',
  'marketing-24h-cap':'Scheduled later: this customer already received a marketing automation within the last 24 hours.',
  'invalid-phone':'Not sent: the account needs a valid international WhatsApp number.',
  'preference-or-unreachable':'Not sent: the customer opted out, has no marketing permission, or the number was marked unreachable.',
  'daily-volume-limit':'Waiting: the configured daily sending limit has been reached.',
  'spending-threshold':'Waiting: the configured spending limit has been reached.',
  'missing-cost-estimate':'Waiting: configure a matching message rate for the spending safeguard.',
  'payment-completed':'Not sent: the customer has already completed payment.',
  'provider-confirmed-payment':'Not sent: the payment provider confirmed payment.',
 };
 return reasons[item.reason]||item.reason||(item.status==='pending'?'Scheduled; the customer’s eligibility will be checked again before sending.':'No additional details.');
}
export function deliveryLabel(item){
 return ({sent:'Sent · delivery unconfirmed',delivered:'Delivered',read:'Read',failed:'Delivery failed'})[item.providerEvent]||({accepted:'Accepted · delivery unconfirmed',skipped:'Skipped',pending:'Scheduled',sending:'Sending',unknown:'Outcome unconfirmed',failed:'Failed'})[item.status]||item.status;
}
