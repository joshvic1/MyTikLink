import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryExplanation,deliveryLabel} from '../components/control/automationStatus.mjs';
test('eligibility and expiry are not presented as expired template approval',()=>{
 assert.match(deliveryExplanation({status:'skipped',reason:'no-longer-eligible'}),/does not mean Meta rejected/);
 assert.match(deliveryExplanation({status:'skipped',reason:'expired-job'}),/approval has not expired/);
});
test('provider acceptance is never presented as confirmed delivery',()=>{
 assert.match(deliveryLabel({status:'accepted'}),/unconfirmed/);
 assert.match(deliveryExplanation({status:'accepted',reason:'old text'}),/No delivery receipt/);
 assert.equal(deliveryLabel({status:'accepted',providerEvent:'read'}),'Read');
 assert.match(deliveryExplanation({providerEvent:'failed',automation:{errorCode:131026},reason:'Meta accepted'}),/failure.*131026/);
 assert.equal(deliveryExplanation({providerEvent:'delivered',automation:{errorCode:131026}}),'Delivered to the customer on WhatsApp.');
});
