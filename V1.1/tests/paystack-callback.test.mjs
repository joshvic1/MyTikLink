import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../components/SubscriptionModal.jsx',import.meta.url),'utf8');
const callbackSource=source.slice(source.indexOf('onSuccess: function')+11,source.indexOf(', onCancel:',source.indexOf('onSuccess: function')));
function setup(success){const events=[];const callback=new Function('v11Api','localStorage','refreshSession','window','Event','notify','close','state','setStatus',`return (${callbackSource});`)({verifyPayment:async reference=>{events.push(reference);return {success,token:'verified-token'};}},{setItem:()=>events.push('token')},async()=>events.push('refresh'),{dispatchEvent:()=>events.push('event')},class Event {},{success:()=>events.push('success'),error:()=>events.push('error')},()=>events.push('close'),{onSuccess:()=>events.push('done')},()=>events.push('status'));return {callback,events};}
test('Paystack receives a regular function and verified payments complete',async()=>{const {callback,events}=setup(true);assert.equal(Object.prototype.toString.call(callback),'[object Function]');assert.equal(callback({reference:'ref'}),undefined);await new Promise(r=>setImmediate(r));assert.deepEqual(events,['ref','token','refresh','event','success','close','done']);});
test('failed verification never grants client success',async()=>{const {callback,events}=setup(false);callback({reference:'ref'});await new Promise(r=>setImmediate(r));assert.deepEqual(events,['ref','status','error']);});
