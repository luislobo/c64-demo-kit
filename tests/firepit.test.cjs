const test = require('node:test');
const assert = require('node:assert/strict');
const { createFirepit } = require('../host/firepit.cjs');
const { waveFrames } = require('../host/bitmap.cjs');

test('all sixteen fire poses reach the composed frames and leave the HUD and ticker space intact', () => {
  const height = 64;
  const scene = createFirepit(16, height);
  const base = Buffer.alloc(8000);
  base.fill(0x5a, 7360);
  const frames = waveFrames(base, { frames: 16, height, scene });
  assert.equal(new Set(frames.map(frame => frame.subarray(height * 40, 7360).toString('hex'))).size, 16);
  for (const frame of frames) {
    assert.ok(frame.subarray(0, (height + 8) * 40).every(byte => byte === 0));
    assert.ok(frame.subarray(7360).equals(base.subarray(7360)));
  }
  assert.equal(scene.screen.length, 600);
  assert.equal(scene.colorRam.length, scene.screen.length);
  for (const colors of [scene.screen, scene.colorRam]) {
    assert.ok(colors.subarray(0, 40).every(byte => byte === 0));
    assert.ok(colors.subarray(-40).every(byte => byte === 0));
  }
});
