import test from 'node:test';
import assert from 'node:assert/strict';
import {recordedClicks,linkUrl} from '../lib/linkPresentation.js';
import {redirectFrame,visitIdentity} from '../lib/redirectFrame.js';
test('history sums archived click values instead of counting rows',()=>{
 assert.equal(recordedClicks({_id:'a',redirectCount:37},[{linkId:'a',clicksUsed:4200},{linkId:'b',clicksUsed:999}]),4237);
 assert.equal(recordedClicks({_id:'a',redirectCount:37,recordedClicks:5000},[{linkId:'a',clicksUsed:4200}]),5000);
});
test('public links use configured canonical origin, never browser origin',()=>{
 assert.equal(linkUrl({linkId:'hello',publicUrl:'https://mytik.link/v1-1/r/hello'}),'https://mytik.link/v1-1/r/hello');
 assert.ok(linkUrl({linkId:'hello'}).endsWith('/v1-1/r/hello'));
});
test('title interpolation cannot inject HTML and templates have restrictive CSP',()=>{
 const html=redirectFrame({title:'<img src=x onerror=alert(1)>',template:{html:'<h1>{{title}}</h1>',css:'body{color:red}'}});
 assert.ok(html.includes('&lt;img'));assert.ok(html.includes("script-src 'none'"));assert.ok(html.includes("form-action 'none'"));assert.ok(html.includes("base-uri 'none'"));
});
test('same tab reuses visit identity briefly, then permits a new visit',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 assert.equal(visitIdentity(storage,'a',()=> 'first',1000),'first');
 assert.equal(visitIdentity(storage,'a',()=> 'second',2000),'first');
 assert.equal(visitIdentity(storage,'a',()=> 'third',62000),'third');
 assert.equal(visitIdentity(storage,'b',()=> 'other',62000),'other');
});
test('blocked browser storage does not prevent opening a link',()=>{
 const storage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
 assert.equal(visitIdentity(storage,'a',()=> 'fallback'),'fallback');
});
