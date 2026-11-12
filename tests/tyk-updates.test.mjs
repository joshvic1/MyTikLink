import test from 'node:test';
import assert from 'node:assert/strict';
import {knowledge,retrieveKnowledge} from '../support/knowledge.mjs';
import {buildPrompt} from '../support/server.mjs';

test('recent customer questions retrieve the relevant workflow first',()=>{
 for(const [question,id] of [
  ['How do I delete my account?','account-deletion'],
  ['How do I add products to my cart?','cart-checkout'],
  ['How do I activate auto renewal with a saved card?','card-auto-renewal'],
  ['Can I upgrade with bank transfer?','plan-payment-methods'],
  ['Why is my message stuck at one tick?','inbox-receipts']
 ]) assert.equal(retrieveKnowledge(question,'v1-1')[0].id,id,question);
});
test('renewal guidance distinguishes paid card setup from free saved-card activation',()=>{
 const article=knowledge.find(a=>a.id==='card-auto-renewal');
 const text=article.steps.join(' ');
 assert.match(text,/without an immediate charge/);
 assert.match(text,/charges for a plan period/);
 assert.match(text,/status is unknown/);
 assert.match(text,/checkbox starts unchecked/);
 assert.equal(article.status,'rollout');
});
test('deletion guidance preserves verification and financial retention boundaries',()=>{
 const text=knowledge.find(a=>a.id==='account-deletion').steps.join(' ');
 assert.match(text,/six-digit/);
 assert.match(text,/transaction and audit records may be retained/);
 assert.match(text,/does not necessarily remove all blockers/);
 assert.match(text,/suspension only restricts access/);
});
test('prompt cannot equate documented releases with live or private account state',()=>{
 const prompt=buildPrompt({question:'How do I activate auto renewal?',version:'v1-1'});
 assert.match(prompt,/not proof it is deployed/);
 assert.match(prompt,/Never interpret a request error as no saved card/);
 assert.match(prompt,/Never infer delivery\/read from a customer reply/);
 assert.match(prompt,/Distinguish merchant subscription payments from customer storefront checkout/);
});
