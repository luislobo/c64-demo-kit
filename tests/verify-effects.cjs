// Run the actual character renderer through mode changes and frame flips.
// The host reference evaluates each cell's equation independently; VICE memory
// and VIC-bank observations show which buffer the machine displays. No physical
// keyboard or analog SID quality is asserted by event injection and memory dumps.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { buildEffects } = require('../tools/build-effects.cjs');
const { buildExampleMusic } = require('../tools/build-example-music.cjs');
const { characterFrame } = require('../host/character.cjs');
const { runVice, readSymbols } = require('./vice.cjs');
const root = path.resolve(__dirname, '..');
const hex = n => n.toString(16);

async function verify(mode, report, initial = 0, step = 3) {
  const s = readSymbols(path.join(path.dirname(report.prg), 'symbols.labels'));
  const music = readSymbols(path.join(root, 'build/example-music/symbols.labels'));
  const name = path.basename(report.prg, '.prg') === 'effects-variant' ? 'character-variant' : 'character';
  return runVice(mode, name, async (m, directory) => {
    await m.command(`load "${report.prg}" 0`);
    await m.command('break ' + hex(s.char_idle)); await m.command('g 810'); await m.command('delete');
    const charset = fs.readFileSync(path.join(root, 'generated/character-charset.bin'));
    assert.deepEqual(await m.bytes(0x2000, 2048), charset);
    assert.deepEqual(await m.bytes(0x6000, 2048), charset);
    assert.ok((await m.bytes(0x400, 800)).every(v => v === 0));
    assert.ok((await m.bytes(0x4400, 800)).every(v => v === 0));
    assert.ok((await m.bytes(0x7e8, 24)).every(v => v === 0));
    const colors = fs.readFileSync(path.join(root, 'generated/character-colors.bin'));
    assert.deepEqual(Buffer.from([...(await m.bytes(0xd800, 1000))].map(v => v & 15)), colors.subarray(0, 1000));
    assert.equal((await m.bytes(0x25, 1))[0], initial);
    const frames = [];
    for (let effect = 0; effect < 3; effect++) {
      await m.write(0x10, [effect + 1]);
      let previousTick, previousPhase;
      for (let i = 0; i < 8; i++) {
        await m.until(s.char_flip_done);
        const phase = (await m.bytes(0x22, 1))[0];
        const visible = (await m.bytes(5, 1))[0], tick = (await m.bytes(7, 1))[0];
        assert.equal((await m.bytes(0x25, 1))[0], effect);
        const start = visible ? 0x4400 : 0x400;
        assert.deepEqual(await m.bytes(start, 800), characterFrame(effect, phase), `${mode} effect ${effect} phase ${phase}`);
        assert.equal((await m.bytes(0xdd00, 1))[0] & 3, visible ? 2 : 3);
        assert.equal((await m.bytes(1, 1))[0], 0x35);
        if (previousTick !== undefined) {
          assert.equal((tick - previousTick) & 255, 2);
          assert.equal((phase - previousPhase) & 255, step);
        }
        previousTick = tick; previousPhase = phase; frames.push({ effect, phase, tick });
      }
      await m.command(`screenshot "${path.join(directory, ['plasma', 'xor', 'tunnel'][effect] + '.png')}" 2`);
    }
    const topTicker = await m.bytes(0x7c0, 40), hiddenTicker = await m.bytes(0x47c0, 40);
    assert.deepEqual(topTicker, hiddenTicker); assert.ok(topTicker.some(v => v >= 64));
    const template = fs.readFileSync(path.join(root, 'generated/character-screen.bin'));
    for (const start of [0x400, 0x4400]) assert.deepEqual(await m.bytes(start + 20 * 40, 4 * 40), template.subarray(20 * 40, 24 * 40));
    await m.write(6, [1]); await m.until(s.char_events_done);
    const phase = (await m.bytes(0x22, 1))[0], frameCount = (await m.bytes(0x2c, 1))[0];
    assert.equal((await m.bytes(0x26, 1))[0], 1);
    await m.until(s.char_irq);
    const beforeMusic = (await m.bytes(music.sample_calls, 2)).readUInt16LE();
    for (let i = 0; i < 12; i++) await m.until(s.char_irq);
    assert.equal((await m.bytes(0x22, 1))[0], phase); assert.equal((await m.bytes(0x2c, 1))[0], frameCount);
    assert.equal(((await m.bytes(music.sample_calls, 2)).readUInt16LE() - beforeMusic) & 65535, 12);
    await m.write(6, [1]); await m.until(s.char_flip_done);
    const result = { mode, framesVerified: frames.length, effects: ['plasma', 'xor', 'tunnel'], flipsEveryTwoRefreshes: true, pauseAndResume: true, musicWhilePaused: true, sharedScroller: true, frames };
    fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(`${mode}: ${frames.length} displayed frames verified, three effects, pause/resume, music and scroller`);
    return result;
  });
}

(async () => {
  const fixture = path.join(root, 'effects-variant.asm');
  try {
    buildExampleMusic(); const report = buildEffects();
    await verify('pal', report); await verify('ntsc', report);
    const text = fs.readFileSync(path.join(root, 'effects-demo.asm'), 'utf8')
      .replace('DEMO_NAME = "character-effects"', 'DEMO_NAME = "effects-variant"')
      .replace('DEMO_EFFECT_START = 1', 'DEMO_EFFECT_START = 3')
      .replace('DEMO_EFFECT_STEP = 3', 'DEMO_EFFECT_STEP = 5')
      .replace('DEMO_TITLE = "C64 CHARACTER LAB"', 'DEMO_TITLE = "ANOTHER CHARACTER APPLICATION"')
      .replace('DEMO_PALETTE = [6,14,3,1,7,13,5,11]', 'DEMO_PALETTE = [2,10,8,7,1,7,8,10]');
    fs.writeFileSync(fixture, text);
    const variant = buildEffects({ entry: fixture, outDir: path.join(root, 'build/effects-variant') });
    await verify('pal', variant, 2, 5);
  } finally { fs.rmSync(fixture, { force: true }); buildEffects(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
