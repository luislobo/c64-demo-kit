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

test('ember sprites trace sub-bitmap-pixel paths and stay between the logo and controls', () => {
  const { createEmbers, EMBER_STEPS, EMBER_COUNT } = require('../host/embers.cjs');
  for (const height of [48, 64, 88]) {
    const { shapes, tracks } = createEmbers(height);
    assert.equal(shapes.length, 128);
    assert.equal(tracks.length, (EMBER_COUNT * 3 + 1) * EMBER_STEPS);
    const masks = tracks.subarray(-EMBER_STEPS);
    assert.ok(masks.every(mask => mask !== 0));
    for (let slot = 0; slot < EMBER_COUNT; slot++) {
      const columns = slot * 3 * EMBER_STEPS;
      const x = tracks.subarray(columns, columns + EMBER_STEPS);
      const y = tracks.subarray(columns + EMBER_STEPS, columns + 2 * EMBER_STEPS);
      const colors = tracks.subarray(columns + 2 * EMBER_STEPS, columns + 3 * EMBER_STEPS);
      const visible = [...x.keys()].filter(step => masks[step] & (1 << slot));
      assert.ok(visible.length > 12);
      assert.ok(visible.every(step => y[step] >= 51 + height + 8 && y[step] < 51 + 156));
      assert.ok(visible.some(step => x[step] & 1));
      assert.ok(visible.some(step => !(x[step] & 1)));
      assert.ok(new Set(visible.map(step => colors[step])).size > 1);
    }
  }
});
