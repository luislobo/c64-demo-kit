// Specify logo foreground fields independently of the native IRQ renderer.
// Each field covers only 23 logo rows, retains black backgrounds, and wraps.
const test = require('node:test');
const assert = require('node:assert/strict');
const { colorFieldAssets, colorFieldRow } = require('../host/color-fields.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readConfig } = require('../host/config.cjs');
const palette = [96, 224, 48, 80, 208, 112, 160, 64];

test('logo fields animate all three modes without touching text or backgrounds', () => {
  const assets = colorFieldAssets();
  assert.equal(assets.length, 256 + 920 * 2);
  const fields = [4, 5, 6].map(mode => Buffer.concat(Array.from({ length: 23 }, (_, row) => colorFieldRow(mode, 17, row, palette))));
  for (let mode = 4; mode <= 6; mode++) {
    assert.equal(fields[mode - 4].length, 920);
    assert.ok(fields[mode - 4].every(value => palette.includes(value) && (value & 15) === 0));
    assert.ok(!colorFieldRow(mode, 17, 9, palette).equals(colorFieldRow(mode, 89, 9, palette)));
    assert.deepEqual(colorFieldRow(mode, 0, 9, palette), colorFieldRow(mode, 256, 9, palette));
  }
  assert.ok(!fields[0].equals(fields[1])); assert.ok(!fields[1].equals(fields[2]));
  assert.throws(() => colorFieldRow(3, 0, 0, palette), /mode/);
  assert.throws(() => colorFieldRow(4, 0, 23, palette), /row/);
});

test('application flags reject unavailable modes and untrusted music generators', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'c64-fields-'));
  const file = path.join(directory, 'demo.asm');
  const source = fs.readFileSync(path.join(__dirname, '../demo.asm'), 'utf8');
  const read = text => { fs.writeFileSync(file, text); return readConfig(file); };
  try {
    assert.equal(read(source).DEMO_START_EFFECT, 4);
    assert.throws(() => read(source.replace('DEMO_COLOR_FIELDS = 1', 'DEMO_COLOR_FIELDS = 0')), /START_EFFECT/);
    assert.throws(() => read(source.replace('DEMO_START_EFFECT = 4', 'DEMO_START_EFFECT = 7')), /START_EFFECT/);
    assert.throws(() => read(source.replace('DEMO_AUTO_SHOW = 1', 'DEMO_AUTO_SHOW = 2')), /AUTO_SHOW/);
    assert.throws(() => read(source.replace('DEMO_SID_BUILD = "clockwork"', 'DEMO_SID_BUILD = "shell"')), /SID_BUILD/);
    assert.throws(() => read(source.replace('DEMO_CREDITS_FILE = "assets/torq-credits.txt"', 'DEMO_CREDITS_FILE = ""')), /CREDITS_FILE/);
    const minimal = read(source.replace(/^DEMO_(COLOR_FIELDS|START_EFFECT|AUTO_SHOW|SID_BUILD) = .*\n/gm, ''));
    assert.equal(minimal.DEMO_COLOR_FIELDS, 0); assert.equal(minimal.DEMO_START_EFFECT, 1); assert.equal(minimal.DEMO_AUTO_SHOW, 0);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
