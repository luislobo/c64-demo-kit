// Check the visible character/asset format independently of 6510 execution.
// The emulator test compares displayed cells with these mathematical frames.
const test = require('node:test');
const assert = require('node:assert/strict');
const { characterAssets, characterFrame } = require('../host/character.cjs');
const options = { font: Buffer.alloc(512, 0x5a), title: 'CHARACTER LAB', hud: '1 PLASMA  2 XOR  3 TUNNEL', scrollText: ' HELLO ', palette: [6, 14, 3, 1, 7, 13, 5, 11] };

test('character assets preserve text glyphs and ordered density levels', () => {
  const assets = characterAssets(options);
  assert.equal(assets.charset.length, 2048);
  assert.ok(assets.charset.subarray(512, 1024).equals(options.font));
  assert.ok(assets.charset.subarray(0, 8).every(b => b === 0));
  assert.ok(assets.charset.subarray(120, 128).every(b => b === 255));
  let previous = -1;
  for (let glyph = 0; glyph < 16; glyph++) {
    const bits = [...assets.charset.subarray(glyph * 8, glyph * 8 + 8)].reduce((n, b) => n + b.toString(2).replaceAll('0', '').length, 0);
    assert.ok(bits > previous); previous = bits;
  }
  assert.equal(assets.screen[21 * 40], ('C'.charCodeAt(0) & 63) + 64);
  assert.equal(assets.scroll.at(-1), 0);
  assert.equal(assets.colors[0], 6); assert.equal(assets.colors[40], 14);
});

test('each native effect produces a distinct bounded animated frame', () => {
  const frames = [0, 1, 2].map(mode => characterFrame(mode, 17));
  for (let mode = 0; mode < 3; mode++) {
    assert.equal(frames[mode].length, 800);
    assert.ok(frames[mode].every(b => b >= 0 && b < 16));
    assert.ok(!frames[mode].equals(characterFrame(mode, 31)));
    assert.deepEqual(characterFrame(mode, 0), characterFrame(mode, 256));
  }
  assert.ok(!frames[0].equals(frames[1])); assert.ok(!frames[1].equals(frames[2]));
});

test('bad assets and impossible display text fail before assembly', () => {
  assert.throws(() => characterAssets({ ...options, font: Buffer.alloc(511) }), /font/i);
  assert.throws(() => characterAssets({ ...options, title: 'X'.repeat(41) }), /40/);
  assert.throws(() => characterAssets({ ...options, scrollText: 'lowercase' }), /uppercase/i);
  assert.throws(() => characterAssets({ ...options, palette: [20] }), /palette/i);
  assert.throws(() => characterFrame(3, 0), /mode/i);
});
