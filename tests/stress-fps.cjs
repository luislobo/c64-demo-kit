// Measure displayed phase cadence with all moving modes, then verify the static
// mode, music and ticker. Trial order alternates; the monitor's guest ticks,
// rather than host elapsed time, define FPS. --probe records overloaded targets.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {build}=require('../build.cjs');
const {frameCadence}=require('../host/timing.cjs');
const {runVice,readSymbols}=require('./vice.cjs');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'demo.asm'),'utf8');
const fixture=path.join(root,'fps-stress.asm'),output=path.join(root,'build/fps-stress.json');
let runs=5,rates=[12],baseline,probe=false;
for(let i=2;i<process.argv.length;i++){
 if(process.argv[i]==='--runs')runs=Number(process.argv[++i]);
 else if(process.argv[i]==='--rates')rates=process.argv[++i].split(',').map(Number);
 else if(process.argv[i]==='--baseline')baseline=path.resolve(process.argv[++i]);
 else if(process.argv[i]==='--probe')probe=true;
 else throw Error('Usage: node tests/stress-fps.cjs [--runs 5] [--rates 12,13] [--baseline checkout] [--probe]');
}
assert.ok(Number.isInteger(runs)&&runs>=1&&runs<=20);
for(const fps of rates)assert.ok(Number.isInteger(fps)&&fps>=1&&fps<=50);
function profile(project,report,name){
 const data=fs.readFileSync(path.join(project,'generated/frames.bin'));
 return{name,report,fps:report.fps??10,s:readSymbols(path.join(path.dirname(report.prg),'symbols.labels')),music:readSymbols(path.join(project,'build/example-music/symbols.labels')),base:fs.readFileSync(path.join(project,'generated/static-bitmap.bin')),frames:Array.from({length:16},(_,i)=>data.subarray(i*8000,(i+1)*8000))};
}
async function verify(p,mode,trial){
 const hz=mode==='pal'?50:60,expected=frameCadence(hz,p.fps,240);
 return runVice(mode,`fps-${p.name}-${trial}`,async(m,directory)=>{
  await m.command(`load "${p.report.prg}" 0`);
  await m.command('break '+p.s.idle.toString(16));await m.command('g 810');await m.command('delete');
  await m.write(0x28,[0]);await m.write(6,[1]);
  let previous=(await m.bytes(7,1))[0],ticks=0,index=0;
  const startupTicks=p.report.startupTicks??0;
  expected[0]+=startupTicks;
  const effects=[];
  for(const effect of [1,2,4,5,6]){
   await m.write(15,[effect]);const intervals=[];let missedIntervals=0;
   for(let frame=0;frame<48;frame++){
    await m.until(p.s.flip_record);const state=await m.bytes(2,12),phase=state[0];
    assert.equal(phase,index&15,'every phase must be displayed in sequence');
    assert.ok((await m.bytes(state[3]?0xe000:0x2000,7680)).equals(p.frames[phase].subarray(0,7680)),`${p.name} ${mode} effect ${effect} bitmap`);
    const elapsed=(state[5]-previous)&255;previous=state[5];ticks+=elapsed;
    if(elapsed!==expected[index++])missedIntervals++;
    intervals.push(elapsed);
   }
   effects.push({effect,framesVerified:48,phaseSequenceVerified:true,missedIntervals,intervalTicks:intervals});
  }
  // Verify the application's IRQ clock against real guest CPU cycles while
  // plasma/music/ticker remain active, so a lost raster IRQ cannot inflate FPS.
  await m.write(15,[4]);await m.until(p.s.irq);
  const activeCalls=(await m.bytes(p.music.sample_calls,2)).readUInt16LE();
  await m.command('stopwatch reset');
  for(let i=0;i<16;i++)await m.until(p.s.irq);
  const irqCycles=Number((await m.command('stopwatch')).match(/Stopwatch:\s*(\d+)/i)?.[1]);
  const cyclesPerRefresh=mode==='pal'?19656:17095;
  assert.ok(Math.abs(irqCycles-16*cyclesPerRefresh)<512,'IRQ cadence must match physical raster refreshes');
  assert.equal(((await m.bytes(p.music.sample_calls,2)).readUInt16LE()-activeCalls)&65535,16);
  const counter=(await m.bytes(0x23,1))[0];
  // Static mode must restore both bitmaps while music and the ticker continue.
  await m.write(0x10,[3]);await m.until(p.s.idle);
  for(const start of [0x2000,0xe000])assert.ok((await m.bytes(start,7680)).equals(p.base.subarray(0,7680)));
  await m.until(p.s.irq);
  const calls=(await m.bytes(p.music.sample_calls,2)).readUInt16LE(),before=await m.bytes(0x13,9);
  for(let i=0;i<16;i++)await m.until(p.s.irq);
  assert.equal(((await m.bytes(p.music.sample_calls,2)).readUInt16LE()-calls)&65535,16);
  const after=await m.bytes(0x13,9),updates=Math.floor((before[0]+16*50)/hz);
  assert.equal((after[8]-before[8])&255,Math.floor((updates+(before[1]&1))/2));
  const ticker=await m.bytes(0x3e00,320);assert.ok(ticker.some(Boolean));assert.ok(ticker.equals(await m.bytes(0xfe00,320)));
  assert.equal((await m.bytes(1,1))[0],0x35);
  const missedIntervals=effects.reduce((n,e)=>n+e.missedIntervals,0);
  return{profile:p.name,mode,trial,targetFPS:p.fps,startupTicks,measuredNominalFPS:240*hz/(ticks-startupTicks),totalTicks:ticks,framesVerified:240,missedIntervals,deadlineMissCounter:counter,targetMet:missedIntervals===0&&counter===0,effects,staticRestored:true,sidCallsPer16Refreshes:16,irqCyclesFor16Refreshes:irqCycles,cyclesPerRefresh,tickerClockVerified:true,errors:0};
 });
}
const result={runs,probe,metric:'displayed bitmap phases per nominal 50/60 Hz raster tick; no host wall-clock timing',trials:[],errors:0};
(async()=>{
 try{
  const profiles=[];
  if(baseline){const report=JSON.parse(fs.readFileSync(path.join(baseline,'build/build-report.json')));assert.equal(report.frames,16);assert.equal(report.fps??10,10);profiles.push(profile(baseline,report,'baseline-10'));}
  for(const fps of rates){fs.writeFileSync(fixture,source.replace(/^DEMO_FPS = \d+$/m,'DEMO_FPS = '+fps).replace(/^DEMO_NAME = .*$/m,`DEMO_NAME = "fps-${fps}"`));const report=build({entry:fixture,outDir:path.join(root,'build/fps-stress',String(fps))});assert.equal(report.frames,16);assert.equal(report.fps,fps);profiles.push(profile(root,report,'updated-'+fps));}
  for(let trial=0;trial<runs;trial++)for(const p of trial&1?[...profiles].reverse():profiles)for(const mode of ['pal','ntsc']){
   const sample=await verify(p,mode,trial);result.trials.push(sample);fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
   console.log(`${p.name} ${mode} trial ${trial+1}/${runs}: ${sample.measuredNominalFPS.toFixed(3)} fps, ${sample.missedIntervals} interval misses, ${sample.deadlineMissCounter} resyncs; all bitmaps/music/ticker verified`);
   if(!probe)assert.ok(sample.targetMet,'Target FPS missed');
  }
 }catch(error){result.errors++;result.failure=error.message;throw error;}
 finally{fs.rmSync(fixture,{force:true});build();result.failedTargets=result.trials.filter(t=>!t.targetMet).length;fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
