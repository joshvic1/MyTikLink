import test from 'node:test';
import assert from 'node:assert/strict';
import {buildVariants} from '../store/variantDraft.mjs';
test('live options generate combinations, trim and deduplicate values',()=>{
 const result=buildVariants([{name:' Size ',optionsText:'Small, Large, Small,'},{name:'Colour',optionsText:'Red, Blue'}]);
 assert.equal(result.inventory.length,4);assert.deepEqual(result.groups[0],{name:'Size',options:['Small','Large']});
});
test('matching live combinations retain stock and SKU',()=>{
 const existing=[{values:{Size:'Small'},stock:8,sku:'SM-8'}];
 const result=buildVariants([{name:'Size',optionsText:'Small, Large'}],existing);
 assert.deepEqual(result.inventory[0],existing[0]);assert.equal(result.inventory[1].stock,0);
});
test('incomplete or duplicate groups are rejected rather than replacing saved inventory',()=>{
 assert.ok(buildVariants([{name:'Size',optionsText:''}]).error);
 assert.ok(buildVariants([{name:'Size',optionsText:'Small'},{name:'size',optionsText:'Large'}]).error);
});
test('combination limit applies before expanding rows and removing all options clears variants',()=>{
 const values=Array.from({length:11},(_,i)=>String(i)).join(',');
 assert.ok(buildVariants([{name:'A',optionsText:values},{name:'B',optionsText:values}]).error);
 assert.deepEqual(buildVariants([]),{groups:[],inventory:[]});
});

test('colour thumbnails persist for selected values only',()=>{
 const result=buildVariants([{name:'Color',kind:'color',options:['Red'],swatches:[{value:'Red',hex:'#ff0000'},{value:'Blue',hex:'#0000ff'}]}]);
 assert.equal(result.groups[0].kind,'color');assert.deepEqual(result.groups[0].swatches,[{value:'Red',hex:'#ff0000'}]);
});
