// Stress 8/16/32 phase counts against real 6510 execution. Interleave five
// trials per fitting profile on PAL/NTSC, compare every displayed bitmap and
// record emulated CPU cycles including IRQ/badline stalls, never host wall time.
// Optional --baseline points at an independently built pre-change checkout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('../build.cjs');
const { runVice, readSymbols, readMusicSymbols } = require('./vice.cjs');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'demo.asm'), 'utf8');
const fixture = path.join(root, 'frame-stress.asm');
const resultFile = path.join(root, 'build/frame-stress.json');
let runs = 5, baseline, summarizeOnly = false;
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--runs') runs = Number(process.argv[++i]);
  else if (process.argv[i] === '--baseline') baseline = path.resolve(process.argv[++i]);
  else if (process.argv[i] === '--summarize') summarizeOnly = true;
  else throw Error('Usage: node tests/stress-frames.cjs [--runs 5] [--baseline checkout-directory] [--summarize]');
}
if (!Number.isInteger(runs) || runs < 1 || runs > 20) throw Error('Runs must be 1..20');
function summarize(data) {
  const median = values => { const s=[...values].sort((a,b)=>a-b),m=s.length>>1;return s.length&1?s[m]:(s[m-1]+s[m])/2; };
  return data.profiles.filter(p=>p.fits).flatMap(p=>['pal','ntsc'].map(mode=>{
    const trials=data.trials.filter(t=>t.profile===p.name&&t.mode===mode);
    if(!trials.length)return{profile:p.name,mode,runs:0};
    const medians=trials.map(t=>median(t.elapsedRenderCycles.slice(2)));
    return{profile:p.name,mode,runs:trials.length,framesVerified:trials.reduce((n,t)=>n+t.framesVerified,0),medianSteadyRenderCycles:median(medians),trialMedianRange:[Math.min(...medians),Math.max(...medians)],maxRenderCycles:Math.max(...trials.flatMap(t=>t.elapsedRenderCycles)),nominalFPS:10,waveCycleSeconds:p.frames/10};
  }));
}
function profile(project, report, name) {
  const bytes = fs.readFileSync(path.join(project, 'generated/frames.bin'));
  return { name, report, symbols: readSymbols(path.join(path.dirname(report.prg), 'symbols.labels')), music: readMusicSymbols(report,project), frames: Array.from({ length: report.frames }, (_, i) => bytes.subarray(i * 8000, (i + 1) * 8000)) };
}
async function verify(p, mode, trial) {
  const s = p.symbols, period = mode === 'pal' ? 5 : 6;
  return runVice(mode, `frame-stress-${p.name}-${trial}`, async (m, directory) => {
    await m.command(`load "${p.report.prg}" 0`);
    await m.command('break ' + s.idle.toString(16)); await m.command('g 810'); await m.command('delete');
    await m.write(0x28, [0]); await m.write(6, [1]);
    const cycles = [], flips = [], frameChecks = Math.max(20,p.report.frames+4);
    for (let i = 0; i < frameChecks; i++) {
      await m.until(s.render); await m.command('stopwatch reset');
      await m.until(s.render_done);
      const output = await m.command('stopwatch');
      const elapsed = Number(output.match(/Stopwatch:\s*(\d+)/i)?.[1]);
      assert.ok(Number.isFinite(elapsed) && elapsed > 0, output);
      cycles.push(elapsed);
      await m.until(s.flip_record);
      const state = await m.bytes(2, 12), phase = state[0], visible = state[3];
      assert.ok((await m.bytes(visible ? 0xe000 : 0x2000, 7680)).equals(p.frames[phase].subarray(0, 7680)), `${p.name} ${mode} frame ${i}/${phase}`);
      flips.push({ phase, tick: state[5] });
    }
    fs.writeFileSync(path.join(directory, 'samples.json'), JSON.stringify({cycles,flips}, null, 2));
    for (let i = 1; i < flips.length; i++) assert.equal((flips[i].tick - flips[i - 1].tick) & 255, period, `${p.name} ${mode} deadline`);
    await m.until(s.irq);
    const before = (await m.bytes(p.music.sample_calls, 2)).readUInt16LE();
    for (let i = 0; i < 16; i++) await m.until(s.irq);
    assert.equal(((await m.bytes(p.music.sample_calls, 2)).readUInt16LE() - before) & 65535, 16);
    assert.equal((await m.bytes(1, 1))[0], 0x35);
    if (trial === 0) await m.command(`screenshot "${path.join(directory, 'screen.png')}" 2`);
    return { profile: p.name, mode, trial, framesVerified: frameChecks, period, elapsedRenderCycles: cycles, flips, sidCallsPer16Refreshes: 16, errors: 0 };
  });
}
const result = { runs, metric: 'VICE elapsed CPU cycles from render entry to render_done, including IRQ and VIC stalls', workload: 'same logo/font, plasma color field, bundled SID and ticker active; 20 displayed frames and 16 extra music refreshes per trial', profiles: [], trials: [], errors: 0 };
(async () => {
  if(summarizeOnly){const saved=JSON.parse(fs.readFileSync(resultFile));saved.summary=summarize(saved);fs.writeFileSync(resultFile,JSON.stringify(saved,null,2)+'\n');console.log(JSON.stringify(saved.summary,null,2));return;}
  try {
    const profiles = [];
    if (baseline) {
      const report = JSON.parse(fs.readFileSync(path.join(baseline, 'build/build-report.json')));
      assert.equal(report.frames, 8);
      profiles.push(profile(baseline, report, 'baseline-8'));
    }
    for (const count of [8, 16, 32]) {
      fs.writeFileSync(fixture, source.replace(/^DEMO_FIREPIT = .*\n/m,'')
        .replace(/^DEMO_LOGO_HEIGHT = \d+$/m,'DEMO_LOGO_HEIGHT = 184')
        .replace(/^DEMO_PAL_TICKS = .*\n/m,'').replace(/^DEMO_PATCH_PLAN = .*\n/m,'').replace(/^DEMO_FPS = \d+$/m,'DEMO_FPS = 10').replace(/^DEMO_FRAMES = \d+$/m, 'DEMO_FRAMES = ' + count).replace(/^DEMO_NAME = .*$/m, `DEMO_NAME = "frame-stress-${count}"`));
      try {
        const report = build({ entry: fixture, outDir: path.join(root, 'build/frame-stress', String(count)) });
        profiles.push(profile(root, report, 'optimized-' + count));
      } catch (error) {
        if (count !== 32 || !/only \d+ fit/.test(error.message)) throw error;
        result.profiles.push({ name: 'optimized-32', frames: 32, fits: false, rejection: error.message });
      }
    }
    for (const p of profiles) result.profiles.push({ name: p.name, frames: p.report.frames, fits: true, patchBytes: p.report.patchBytes, colorFieldBytes: p.report.colorFieldBytes ?? 2188, lowPatchBytes: p.report.lowPatchBytes ?? 0, highMemoryFree: p.report.highMemoryFree ?? (32768 - p.report.patchBytes - 2188) });
    for (let trial = 0; trial < runs; trial++) {
      const order = trial & 1 ? [...profiles].reverse() : profiles;
      for (const p of order) for (const mode of ['pal', 'ntsc']) {
        const sample = await verify(p, mode, trial); result.trials.push(sample);
        fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
        console.log(`${p.name} ${mode} trial ${trial + 1}/${runs}: ${sample.framesVerified} frames, steady ${sample.period}-refresh flips, SID cadence correct`);
      }
    }
  } catch (error) { result.errors++; result.failure = error.message; throw error; }
  finally {
    fs.rmSync(fixture, { force: true }); build();
    result.summary=summarize(result);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
