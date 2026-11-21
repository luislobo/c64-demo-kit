// Check compression and placement through decoded output and actual C64 address
// ranges, including repeated bytes, page boundaries and the small code-bank gap.
const test = require('node:test');
const assert = require('node:assert/strict');
const { encodePatch, applyPatch } = require('../host/patches.cjs');
const { allocatePatches } = require('../host/patch-memory.cjs');

test('repeated-byte patches compact long zero/solid runs and round-trip', () => {
  const from = Buffer.alloc(8000, 0x55), to = Buffer.alloc(8000);
  to.fill(255, 250, 760); to.fill(0x33, 4000, 4257);
  const patch = encodePatch(from, to);
  assert.ok(patch.bytes.length < 150);
  assert.deepEqual(applyPatch(from, patch.bytes), to);
  assert.throws(() => applyPatch(from, Buffer.from([0x80, 0, 255, 0])), /fill/i);
  assert.throws(() => applyPatch(from, Buffer.from([0x80, 5])), /fill/i);
  assert.deepEqual(encodePatch(from, from).bytes, Buffer.from([0]));
});

test('compression does not trade a few stream bytes for thousands of pointless writes', () => {
  const from = Buffer.alloc(8000), to = Buffer.alloc(8000);
  for (let i = 0; i < from.length; i += 100) from[i] = 255;
  const patch = encodePatch(from, to);
  assert.ok(patch.written < 400);
  assert.deepEqual(applyPatch(from, patch.bytes), to);
});

test('allocator uses low RAM only when needed and leaves tables below screen RAM', () => {
  const patches = [12000, 12000, 6000, 1900].map(n => { const bytes=Buffer.alloc(n,1);bytes[n-1]=0;return{bytes}; });
  const layout = allocatePatches(patches, 2188);
  assert.equal(layout.low.length, 2816);
  assert.equal(layout.high.length, 29085);
  assert.equal(layout.pointers[0], 0x1500);
  assert.equal(layout.tails[0], 0x4000);
  assert.ok(layout.highEnd + 2188 <= 0xc000);
  assert.ok(layout.low.length + 0x1500 <= 0x2000);
  assert.equal(allocatePatches(patches.slice(0, 2), 2188).low.length, 0);
});

test('allocator rejects capacity instead of overlapping memory', () => {
  assert.throws(() => allocatePatches([{ bytes: Buffer.alloc(40000) }], 2188), /fit|memory|bytes/i);
});

test('streams split between commands reconstruct every target exactly', () => {
  const base = Buffer.alloc(8000);
  const targets = Array.from({length:4},(_,p)=>Buffer.from(Array.from({length:8000},(_,i)=>(i*17+p*47)%255+1)));
  const patches = targets.map(target=>encodePatch(base,target));
  const layout = allocatePatches(patches,2188);
  const region = address=>address<0x2000?[layout.low,address-layout.lowStart]:[layout.high,address-0x4000];
  const part = address=>{const[data,start]=region(address);let i=start;while(data[i])i+=data[i]===128?3:data[i]&128?1+(data[i]&127):1;return data.subarray(start,i);};
  assert.ok(layout.tails.some(Boolean));
  patches.forEach((patch,i)=>{
    const bytes=Buffer.concat([part(layout.pointers[i]),layout.tails[i]?part(layout.tails[i]):Buffer.alloc(0),Buffer.from([0])]);
    assert.deepEqual(bytes,patch.bytes);
    assert.deepEqual(applyPatch(base,bytes),targets[i]);
  });
});
