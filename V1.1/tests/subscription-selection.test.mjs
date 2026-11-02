import test from 'node:test';
import assert from 'node:assert/strict';
import {isCurrentSubscription,checkoutPricing} from '../lib/subscriptionSelection.js';
test('Pro billing cycle changes are not the current subscription',()=>{
 assert.equal(isCurrentSubscription('pro_monthly','pro','yearly'),false);
 assert.equal(isCurrentSubscription('pro_yearly','pro','monthly'),false);
 assert.equal(isCurrentSubscription('pro_monthly','pro','monthly'),true);
 assert.equal(isCurrentSubscription('pro_yearly','pro','yearly'),true);
 assert.equal(isCurrentSubscription('standard_monthly','pro','monthly'),false);
});
test('checkout honors adjusted server amount instead of full recurring plan price',()=>{
 assert.deepEqual(checkoutPricing({amount:35000},{price:40000,paystackPlan:'yearly'}),{amount:3500000});
 assert.deepEqual(checkoutPricing({amount:40000},{price:40000,paystackPlan:'yearly'}),{amount:4000000,plan:'yearly'});
 assert.throws(()=>checkoutPricing({}, {price:40000}),/amount/);
});
