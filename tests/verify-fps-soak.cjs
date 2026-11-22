// Run three complete automatic shows in warp: this reaches the long ticker
// wrap and a full color-phase cycle while checking deadline and SID clocks.
// Each eight-second sample contains fewer than 256 frames at the tested rate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {build}=require('../build.cjs');
const {runVice,readSymbols,readMusicSymbols}=require('./vice.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const report=build();assert.equal(report.frames,16);assert.ok(Math.max(report.palFPS,report.fps)<=30);
 const s=readSymbols(path.join(root,'build/symbols.labels')),music=readMusicSymbols(report);
 for(const mode of ['pal','ntsc'])await runVice(mode,'fps-soak',async(m,directory)=>{
  await m.command(`load "${report.prg}" 0`);await m.command('break '+s.idle.toString(16));await m.command('g 810');await m.command('delete');
  const modes=[];
  for(let i=0;i<18;i++){
   await m.until(s.show_request);
   assert.equal((await m.bytes(0x23,1))[0],0,'no missed deadlines during automatic playback');
   modes.push((await m.bytes(15,1))[0]);
  }
  await m.until(s.irq); // Complete the final show/ticker update before sampling.
  const calls=144*(mode==='pal'?50:60);
  assert.equal((await m.bytes(music.sample_calls,2)).readUInt16LE(),calls);
  const tempo=(await m.bytes(music.limit_lo,2)).readUInt16LE();
  assert.equal(tempo,mode==='pal'?1000:1200);
  assert.equal((await m.bytes(music.step,1))[0],Math.floor(calls*88/tempo)%144);

  assert.equal((await m.bytes(0x1b,1))[0],3600&255);
  assert.equal(new Set(modes).size,6);
  const result={mode,nominalFPS:mode==='pal'?report.palFPS:report.fps,nominalSeconds:144,automaticTransitions:18,allModes:true,deadlineMisses:0,sidClockVerified:true,scoreProgressVerified:true,tickerClockVerified:true};
  fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
 });
})().catch(error=>{console.error(error);process.exitCode=1;});
