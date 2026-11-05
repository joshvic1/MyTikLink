import test from 'node:test';
import assert from 'node:assert/strict';
import {safeAuthReturn} from '../lib/authReturn.js';
test('owner upgrade survives login with only the originating link',()=>{
 assert.equal(safeAuthReturn('/v1-1/links/upgrade?link=abc&user=other'),'/v1-1/links/upgrade?link=abc');
 assert.equal(safeAuthReturn('/v1-1/pages?activate=123'),'/v1-1/pages?activate=123');
});
test('external and unrelated authentication returns are rejected',()=>{
 for(const path of ['https://evil.test','//evil.test','/v1-1/links/upgrade','/v1-1/links/upgrade/other?link=x','/admin'])assert.equal(safeAuthReturn(path),'/v1-1/dashboard');
});
test('email destinations and preview actions survive authentication',()=>{
 for(const path of ['/v1-1/store?action=preview-store','/v1-1/pages?preview=123','/v1-1/store/orders','/v1-1/store/products','/v1-1/settings/profile?section=plan','/v1-1/settings/tracking'])assert.equal(safeAuthReturn(path),path);
 for(const path of ['/v1-1/login?next=x','/v1-1/../admin','/v1-1/store\\evil','javascript:alert(1)'])assert.equal(safeAuthReturn(path),'/v1-1/dashboard');
});
