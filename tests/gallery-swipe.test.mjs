import test from 'node:test';
import assert from 'node:assert/strict';
import {swipeDirection,galleryIndex} from '../V1.1/store/gallerySwipe.mjs';
test('horizontal swipe moves forward/back; taps, vertical scroll and diagonals do not',()=>{
 assert.equal(swipeDirection(-100,5),1);assert.equal(swipeDirection(100,5),-1);
 for(const [x,y] of [[0,0],[12,3],[20,120],[60,60]])assert.equal(swipeDirection(x,y),0);
 assert.equal(swipeDirection(-90,0,1200),1);
});
test('gallery wraps at either end and remains stable for zero or one photo',()=>{
 assert.equal(galleryIndex(4,1,5),0);assert.equal(galleryIndex(0,-1,5),4);
 assert.equal(galleryIndex(2,1,5),3);assert.equal(galleryIndex(0,1,1),0);assert.equal(galleryIndex(0,-1,0),0);
});
