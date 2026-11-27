import test from 'node:test';
import assert from 'node:assert/strict';
import * as tyk from '../support/knowledge.mjs';
import {buildPrompt,responsePayload} from '../support/server.mjs';
for(const [name,k] of [['TYK',tyk]]){
 test(`${name} retrieves activation for varied wording and dashboard versions`,()=>{
  for(const question of ['How can I activate my store?','I want to activate my store','abeg how i go activate my shop','unlock my storefront','make my store active','how do I activte my store','my store is inactive','my website should go live']){
   for(const version of ['v1-1','legacy']){
    const result=k.retrieveKnowledge(question,version,'/v1-1/store');
    assert.equal(result[0].id,`store-activation-${version}`,question);
    assert.match(result[0].steps.join(' '),/₦5,000 per month/);
    assert.match(result[0].steps.join(' '),/do not tell them to pay again/);
    assert.equal(k.safeSupportHref(result[0].route),result[0].route);
   }
  }
 });
 test(`${name} does not treat other activation tasks as a store upgrade`,()=>{
  for(const q of ['activate auto-renewal for my store','activate my domain','activate pixel on my store','verify email verification for my store']) assert.equal(k.storeActivationIntent(q),false,q);
 });
}
test('TYK prompt and response actions preserve grounded upgrade guidance',()=>{
 const prompt=buildPrompt({question:'activate my store',version:'v1-1',plan:'free'});
 assert.match(prompt,/₦5,000 monthly/);assert.match(prompt,/store-activation-v1-1/);
 const payload=responsePayload(JSON.stringify({reply:'Open [Billing](/v1-1/settings/billing)',actions:[{label:'Upgrade to Pro',href:'/v1-1/settings/billing'}]}),'activate my store');
 assert.equal(payload.actions[0].href,'/v1-1/settings/billing');
});
