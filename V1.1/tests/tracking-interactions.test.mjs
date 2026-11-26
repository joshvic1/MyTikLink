import test from 'node:test';import assert from 'node:assert/strict';
import {interactionQueue,clickDestination} from '../tracking/interactionQueue.mjs';
test('early CTA events flush once when pixels are ready; repeated IDs do not double count',()=>{
 const q=interactionQueue(),sent=[];q.push('contact','first');q.push('contact','first');q.ready((...a)=>sent.push(a));q.push('contact','second');q.pause();q.push('lead','third');q.ready((...a)=>sent.push(a));assert.deepEqual(sent,[['contact','first'],['contact','second'],['lead','third']]);
});
const target=(attrs,disabled=false,editor=false)=>({closest:()=>({disabled,getAttribute:k=>attrs[k],closest:()=>editor?{}:null})});
test('new destination buttons and nested link content qualify, not inert controls or unsafe URLs',()=>{
 for(const attr of ['href','data-href','data-url','data-tracking-url'])assert.equal(clickDestination(target({[attr]:'https://wa.me/2348000000000'}),'page','https://mytiklink.com/p/test'),'https://wa.me/2348000000000');
 for(const url of ['','#form','javascript:alert(1)','data:text/html,test'])assert.equal(clickDestination(target({href:url}),'page','https://mytiklink.com'),null);
 assert.equal(clickDestination(target({href:'https://example.com'},true),'page','https://mytiklink.com'),null);
 assert.equal(clickDestination(target({href:'https://example.com'},false,true),'page','https://mytiklink.com'),null);
 assert.equal(clickDestination(target({href:'https://example.com'}),'store','https://mytiklink.com'),null);
 assert.equal(clickDestination(target({href:'https://wa.me.evil.test'}),'store','https://mytiklink.com'),null);
});
