// Build from original sources, then check automatic/manual presentation and the
// complete default bitmap regression on isolated PAL and NTSC VICE instances.
// Event-handler checks do not simulate a physical keyboard or analog sound.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { build } = require('../build.cjs');
const { runVice, readSymbols, readMusicSymbols } = require('./vice.cjs');
const root = path.resolve(__dirname, '..');

async function automaticShow(mode, report) {
  const s = readSymbols(path.join(root, 'build/symbols.labels'));
  const music = readMusicSymbols(report);
  await runVice(mode, 'torq-show', async (m, directory) => {
    await m.command(`load "${report.prg}" 0`);
    await m.command('break ' + s.idle.toString(16)); await m.command('g 810'); await m.command('delete');
    assert.equal((await m.bytes(6, 1))[0], 1, 'autostart request');
    assert.equal((await m.bytes(0x28, 1))[0], 1, 'automatic show enabled');
    await m.until(s.show_request);
    assert.equal((await m.bytes(music.sample_calls, 2)).readUInt16LE(), mode === 'pal' ? 400 : 480);
    await m.until(s.effect_return);
    assert.equal((await m.bytes(0x0f, 1))[0], 5, 'plasma advances to XOR');
    assert.equal((await m.bytes(3, 1))[0], 1, 'wave starts without input');
    await m.write(0x0f, [6]); await m.write(0x29, [1, 1]);
    await m.until(s.show_request); await m.until(s.effect_return);
    assert.equal((await m.bytes(0x0f, 1))[0], 1, 'show wraps to first effect');
    // Exercise the number edge handler, including its manual-control handoff.
    await m.until(s.frame_ready);
    await m.write(0x200, [0xa9, 6, 0x20, s.number_check & 255, s.number_check >> 8, 0x4c, s.frame_ready & 255, s.frame_ready >> 8]);
    await m.command('break ' + s.effect_return.toString(16)); await m.command('g 200'); await m.command('delete');
    assert.equal((await m.bytes(0x28, 1))[0], 0, 'number takes manual control');
    assert.equal((await m.bytes(0x0f, 1))[0], 6, 'number selects tunnel');
    await m.write(0x28, [1]); // Independently check Space also disables the show.
    // Invoke the Space edge handler with a balanced JSR at a main-loop boundary.
    await m.until(s.frame_ready);
    await m.write(0x200, [0x20, s.pressed & 255, s.pressed >> 8, 0x4c, s.frame_ready & 255, s.frame_ready >> 8]);
    await m.command('break ' + s.idle.toString(16)); await m.command('g 200'); await m.command('delete');
    assert.equal((await m.bytes(0x28, 1))[0], 0, 'Space takes manual control');
    assert.equal((await m.bytes(3, 1))[0], 0, 'Space stops bitmap motion');
    await m.write(0x29, [1, 1]);
    for (let i = 0; i < 8; i++) await m.until(s.irq);
    assert.equal((await m.bytes(0x10, 1))[0], 0, 'automatic requests stay disabled');
    const result = { mode, autostart: true, eightSecondCycleRefreshes: mode === 'pal' ? 400 : 480, wrap: true, numberHandlerTakesControl: true, spaceHandlerTakesControl: true };
    fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(result);
  });
}

(async () => {
  fs.rmSync(path.join(root, 'generated/after-hours.sid'), { force: true });
  const report = build(); // One command must regenerate the default music too.
  assert.equal(report.effects, 6); assert.equal(report.startEffect, 4);
  assert.ok(fs.readFileSync(path.join(root, 'assets/torq-credits.txt')).equals(fs.readFileSync(path.join(root, 'build/torqxsendero-c64-credits.txt'))));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'build/torqxsendero-c64-music-credits.json'))).name, 'After Hours Roll');
  for (const mode of ['pal', 'ntsc']) {
    await automaticShow(mode, report);
    await runVice(mode, 'torq', async m => {
      const port = m.socket.remotePort; m.socket.destroy();
      const result = await promisify(execFile)(process.execPath, ['tests/emulator.cjs', mode, String(port)], { cwd: root, timeout: 120000 });
      console.log(result.stdout);
    });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
