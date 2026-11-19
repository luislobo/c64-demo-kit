// Build the original example, execute its exported player through the bitmap
// engine, and compare call counts with raster ticks on PAL and NTSC. Test the
// declared-clock rejection path and pause/restart without keyboard injection.
// This checks digital playback behavior, not perceived analog audio quality.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('../build.cjs');
const { buildExampleMusic } = require('../tools/build-example-music.cjs');
const { sidFrequency } = require('../host/music.cjs');
const { runVice, readSymbols } = require('./vice.cjs');
const root = path.resolve(__dirname, '..');
const hex = n => n.toString(16);

async function verify(mode, report, supported) {
  const s = readSymbols(path.join(path.dirname(report.prg), 'symbols.labels'));
  Object.assign(s, { music_supported: 0x21, ticks: 0x07, muted: 0x11 });
  const music = readSymbols(path.join(root, 'build/example-music/symbols.labels'));
  return runVice(mode, supported ? 'sid' : 'sid-clock-mismatch', async (m, directory) => {
    await m.command(`load "${report.prg}" 0`);
    await m.command('break ' + hex(s.idle)); await m.command('g 810'); await m.command('delete 1');
    assert.equal((await m.bytes(s.music_supported, 1))[0], supported ? 1 : 0);
    await m.until(s.irq);
    const before = (await m.bytes(music.sample_calls, 2)).readUInt16LE();
    const tick = (await m.bytes(s.ticks, 1))[0];
    for (let i = 0; i < 16; i++) await m.until(s.irq);
    const after = (await m.bytes(music.sample_calls, 2)).readUInt16LE();
    assert.equal((after - before) & 65535, supported ? 16 : 0);
    assert.equal(((await m.bytes(s.ticks, 1))[0] - tick) & 255, 16);
    assert.equal((await m.bytes(1, 1))[0], 0x35);
    if (supported) {
      assert.equal((await m.bytes(music.sample_refresh, 1))[0], mode === 'pal' ? 50 : 60);
      assert.equal((await m.bytes(music.sample_song, 1))[0], 0);
      assert.ok((await m.bytes(music.sample_step, 1))[0] > 0);
      const step = (await m.bytes(music.sample_step, 1))[0];
      const note = [60, 64, 67, 72, 71, 67, 64, 62, 65, 69, 72, 76, 74, 72, 69, 65][step];
      await m.command('break store d400 d401');
      const lowWrite = await m.command('g');
      const highWrite = await m.command('g');
      const low = parseInt(lowWrite.match(/A:([0-9a-f]{2})/i)?.[1], 16);
      const high = parseInt(highWrite.match(/A:([0-9a-f]{2})/i)?.[1], 16);
      assert.equal(low | high << 8, sidFrequency(note, mode === 'pal' ? 985248 : 1022727));
      await m.command('delete'); await m.until(s.irq);
      const frozen = (await m.bytes(music.sample_calls, 2)).readUInt16LE();
      await m.write(s.muted, [1]); await m.write(0xd418, [0]);
      for (let i = 0; i < 8; i++) await m.until(s.irq);
      assert.equal((await m.bytes(music.sample_calls, 2)).readUInt16LE(), frozen);
      await m.until(s.idle);
      // A balanced main-thread JSR invokes the same init routine as the M event.
      await m.write(s.muted, [0]);
      await m.write(0x200, [0x78, 0x20, s.music_init & 255, s.music_init >> 8, 0x58, 0x4c, s.idle & 255, s.idle >> 8]);
      await m.command('break ' + hex(s.idle)); await m.command('g 200'); await m.command('delete');
      assert.equal((await m.bytes(music.sample_calls, 2)).readUInt16LE(), 0);
      assert.equal((await m.bytes(1, 1))[0], 0x35);
      for (let i = 0; i < 4; i++) await m.until(s.irq);
      assert.ok((await m.bytes(music.sample_calls, 2)).readUInt16LE() > 0);
    }
    await m.command(`screenshot "${path.join(directory, 'screen.png')}" 2`);
    const result = { mode, supported, callsPer16Refreshes: (after - before) & 65535, bankRestored: true, pitchWritesVerified: supported, pauseAndRestart: supported };
    fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(result); return result;
  });
}

(async () => {
  const mismatch = path.join(root, 'sid-clock-check.asm');
  try {
    buildExampleMusic();
    const report = build({ entry: path.join(root, 'sid-demo.asm'), outDir: path.join(root, 'build/sid') });
    assert.equal(report.music.author, 'C64 demo kit contributors');
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'build/sid/sid-example-music-credits.json'))).license, 'CC0-1.0; examples/music/README.md');
    await verify('pal', report, true); await verify('ntsc', report, true);
    fs.writeFileSync(mismatch, fs.readFileSync(path.join(root, 'sid-demo.asm'), 'utf8') + '\nDEMO_SID_CLOCK = "pal"\n');
    const palOnly = build({ entry: mismatch, outDir: path.join(root, 'build/sid-pal-only') });
    await verify('ntsc', palOnly, false);
  } finally { fs.rmSync(mismatch, { force: true }); build(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
