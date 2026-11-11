import test from 'node:test';
import assert from 'node:assert/strict';
import {pageUrl} from '../lib/pageUrl.js';
test('scheme-less page URLs become absolute rather than nested under current URL',()=>{assert.equal(pageUrl({publicUrl:'mytiklink.com/p/example'}),'https://mytiklink.com/p/example');assert.equal(pageUrl({publicUrl:'https://mytiklink.com/p/example'}),'https://mytiklink.com/p/example');});
test('relative page URLs resolve using an absolute configured origin',()=>{const old=process.env.NEXT_PUBLIC_SITE_URL;process.env.NEXT_PUBLIC_SITE_URL='mytiklink.com';try{assert.equal(pageUrl({publicUrl:'/v1-1/p/example'}),'https://mytiklink.com/p/example');assert.equal(pageUrl({slug:'my page'}),'https://mytiklink.com/p/my%20page');}finally{if(old===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=old;}});
