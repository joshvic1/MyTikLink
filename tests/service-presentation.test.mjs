import test from 'node:test';
import assert from 'node:assert/strict';
import {locationPrice,priceRange,durationLabel} from '../V1.1/services/servicePresentation.mjs';
test('service prices follow the chosen location with a base-price fallback',()=>{const s={serviceType:'physical',physicalLocationMode:'choice',priceMinor:100000,locationPrices:{business:150000,customer:250000}};assert.deepEqual(priceRange(s),{min:150000,max:250000});assert.equal(locationPrice(s,'customer'),250000);assert.equal(locationPrice({...s,locationPrices:{}},'business'),100000);assert.deepEqual(priceRange({...s,serviceType:'digital'}),{min:100000,max:100000});});
test('duration supports minutes, hours, days and older services',()=>{assert.equal(durationLabel({durationMinutes:90}),'90 minutes');assert.equal(durationLabel({durationMinutes:120}),'2 hours');assert.equal(durationLabel({estimatedCompletionDays:3}),'3 days');});
