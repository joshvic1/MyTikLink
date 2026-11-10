import test from 'node:test';
import assert from 'node:assert/strict';
import {firstName,conversationDate,pageLabel,selectedConversation} from '../components/MyTikLinkAI/tykPresentation.mjs';
import {readHistory} from '../support/history.mjs';
test('personal greeting uses only the first account-name token',()=>{assert.equal(firstName({name:'  Joshua Victor  '}),'Joshua');assert.equal(firstName({}), '');assert.equal(firstName({name:null}),'');});
test('legacy histories remain readable without fabricated dates or lost metadata',()=>{const original=[{id:'old',title:'Pixel setup',messages:[{role:'ai',text:'Your earlier answer',feedback:'yes'}]}];const store={getItem:()=>JSON.stringify(original)};const chat=readHistory(store,'existing-key')[0];assert.equal(chat.messages[0].content,'Your earlier answer');assert.equal(chat.messages[0].feedback,'yes');assert.equal(conversationDate(chat),'Earlier conversation');assert.equal(original[0].messages[0].role,'ai');});
test('history dates distinguish today, yesterday and old records',()=>{const now=new Date(2026,10,10,12);assert.equal(conversationDate({updatedAt:new Date(2026,10,10,9).toISOString()},now),'Today');assert.equal(conversationDate({createdAt:new Date(2026,10,9,9).toISOString()},now),'Yesterday');assert.equal(conversationDate({updatedAt:'invalid'},now),'Earlier conversation');});
test('page labels are grounded in real route families, not arbitrary matches',()=>{assert.equal(pageLabel('/v1-1/settings/tracking?provider=meta'),'Pixels & integrations');assert.equal(pageLabel('/dashboard/page/create'),'Landing pages');assert.equal(pageLabel('/v1-1/store/orders'),'Storefront');assert.equal(pageLabel('/dashboard-fake'),null);assert.equal(pageLabel('/unknown'),null);});

test('reopening restores the selected conversation with a safe legacy fallback',()=>{const chats=[{id:'new'},{id:'older'}];assert.equal(selectedConversation(chats,'older'),'older');assert.equal(selectedConversation(chats,'other-account'),'new');assert.equal(selectedConversation(chats,null),'new');assert.equal(selectedConversation([],null),'');});

import {retrieveKnowledge} from '../support/knowledge.mjs';
import {buildPrompt} from '../support/server.mjs';
test('ambiguous page question prioritizes the matching article without crossing versions',()=>{assert.equal(retrieveKnowledge('How do I set this up?','v1-1','/v1-1/settings/tracking')[0].id,'tracking');assert.ok(retrieveKnowledge('previous dashboard','legacy','/v1-1/settings/tracking').every(a=>a.version!=='v1-1'));const prompt=buildPrompt({question:'How do I set this up?',version:'v1-1',route:'/v1-1/settings/tracking',plan:'free'});assert.match(prompt,/PAGE CONTEXT:/);assert.match(prompt,/Publishing landing pages|tracking requires an active Pro plan/);});
