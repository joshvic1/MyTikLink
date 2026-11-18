import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../components/UpgradePayment.jsx',import.meta.url),'utf8');
const start=source.indexOf('onSuccess:response=>');
assert.ok(start>=0,'Checkout success callback must exist');
const callbackSource=source.slice(start+'onSuccess:'.length,source.indexOf(',onCancel:',start));
function setup(success){const events=[];const callback=new Function('v11Api','setCardReference','finish','setError','setBusy',`return (${callbackSource});`)({verifyPayment:async reference=>{events.push(reference);return {success,message:'Provider declined this payment'};}},()=>events.push('reference'),async()=>events.push('finish'),message=>events.push(message),()=>events.push('idle'));return {callback,events};}
test('Paystack callback returns synchronously and only verified payments complete',async()=>{const {callback,events}=setup(true);assert.equal(Object.prototype.toString.call(callback),'[object Function]');assert.equal(callback({reference:'ref'}),undefined);await new Promise(r=>setImmediate(r));assert.deepEqual(events,['reference','ref','finish','idle']);});
test('failed verification displays the provider outcome and never grants client success',async()=>{const {callback,events}=setup(false);callback({reference:'ref'});await new Promise(r=>setImmediate(r));assert.deepEqual(events,['reference','ref','Provider declined this payment','idle']);});
