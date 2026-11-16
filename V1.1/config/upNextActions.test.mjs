import test from "node:test";
import assert from "node:assert/strict";
import {
  UP_NEXT_DISMISSAL_TTL,
  createUpNextDismissal,
  decorateUpNext,
  normalizeUpNextDismissals,
} from "./upNextActions.js";

test("business-attention cards return after 24 hours", () => {
  const now = 1000;
  const dismissal = createUpNextDismissal(decorateUpNext({ kind: "orders" }), "orders:1", now);
  assert.equal(dismissal.dismissalType, "attention");
  assert.equal(dismissal.expiresAt, now + UP_NEXT_DISMISSAL_TTL.attention);
});

test("product suggestions stay dismissed for 30 days", () => {
  const now = 1000;
  const dismissal = createUpNextDismissal(decorateUpNext({ kind: "draft" }), "draft:page-1", now);
  assert.equal(dismissal.dismissalType, "suggestion");
  assert.equal(dismissal.expiresAt, now + UP_NEXT_DISMISSAL_TTL.suggestion);
});

test("expired and legacy dismissal records are ignored", () => {
  const records = JSON.stringify([
    { key: "orders:1", expiresAt: 999 },
    { key: "orders:3", expiresAt: 1001 },
    "legacy-key",
  ]);
  assert.deepEqual(normalizeUpNextDismissals(records, 1000), [{ key: "orders:3", expiresAt: 1001 }]);
});

test("a changed recommendation key is not hidden by an older dismissal", () => {
  const dismissals = normalizeUpNextDismissals(
    JSON.stringify([{ key: "orders:1", expiresAt: 2000 }]),
    1000
  );
  assert.equal(dismissals.some((item) => item.key === "orders:3"), false);
});

test("all upgrade suggestions expire after 24 hours",()=>{
 for(const kind of ['starter-upgrade','store-upgrade','redirect-upgrade']){
 const record=createUpNextDismissal(decorateUpNext({kind}),kind+'|Ready',1000);
 assert.equal(record.expiresAt,1000+86400000);
 assert.equal(record.dismissalType,'upgrade');
 }
 assert.equal(createUpNextDismissal({kind:'future-plan',ctaLabel:'Upgrade to Pro'},'future',1000).expiresAt,86401000);
});
test("old upgrade dismissals are shortened without changing other suggestions",()=>{
 const records=[{key:'starter-upgrade|Ready',dismissedAt:1000,expiresAt:1000+30*86400000,dismissalType:'suggestion'},{key:'product|Add product',dismissedAt:1000,expiresAt:1000+30*86400000,dismissalType:'suggestion'}];
 assert.equal(normalizeUpNextDismissals(JSON.stringify(records),2000)[0].expiresAt,86401000);
 assert.deepEqual(normalizeUpNextDismissals(JSON.stringify(records),86401000),[records[1]]);
});
import {appendReferralSuggestion} from './upNextActions.js';
test('referral promotion stays last without changing existing priority',()=>{
 const original=[{kind:'orders'},{kind:'draft'},{kind:'tracking'}];
 const result=appendReferralSuggestion(original);
 assert.deepEqual(result.map(x=>x.kind),['orders','draft','tracking','referral']);
 assert.equal(original.length,3);
 assert.equal(result.at(-1).href,'/v1-1/affiliate');
 assert.equal(result.at(-1).ctaLabel,'Get your referral link');
});
test('referral promotion works alone and is not duplicated',()=>{
 assert.deepEqual(appendReferralSuggestion([]).map(x=>x.kind),['referral']);
 assert.deepEqual(appendReferralSuggestion([{kind:'referral'},{kind:'orders'}]).map(x=>x.kind),['orders','referral']);
});
