import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedDestination} from './storefrontRouting.mjs';
const modern={version:'v1-1',slug:'my-store'};
test('legacy remains on its original route',()=>assert.equal(selectedDestination({version:'legacy'}),null));
test('store redirect retains campaign attribution',()=>assert.equal(selectedDestination(modern,{query:{slug:'old',utm_source:'email'}}),'/v1-1/s/my-store?utm_source=email'));
test('product and account links keep their destination',()=>{assert.equal(selectedDestination(modern,{product:'dress'}),'/v1-1/s/my-store/products/dress');assert.equal(selectedDestination(modern,{account:true,query:{order:'123'}}),'/v1-1/s/my-store/account?order=123');assert.equal(selectedDestination(modern,{query:{product:'dress'}}),'/v1-1/s/my-store/products/dress');});
