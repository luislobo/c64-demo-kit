// Specify refresh-to-frame cadence independently of the native scheduler.
// Prefix totals must stay within one refresh of the requested nominal rate.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timingConfig, frameCadence } = require('../host/timing.cjs');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {readConfig}=require('../host/config.cjs');
test('12 fps uses five PAL four-tick intervals then five, and fixed NTSC five', () => {
  assert.deepEqual(frameCadence(50,12,6),[4,4,4,4,4,5]);
  assert.deepEqual(frameCadence(60,12,12),Array(12).fill(5));
  assert.equal(timingConfig(12).palRemainder,2);
  assert.equal(timingConfig(12).startupTicks,1);
  assert.equal(timingConfig(10).startupTicks,0);
});
test('all supported cadences track nominal time without accumulating drift', () => {
  for (const hz of [50,60]) for(let fps=1;fps<=50;fps++) {
    const intervals=frameCadence(hz,fps,300);let total=0;
    intervals.forEach((ticks,i)=>{total+=ticks;assert.ok(ticks>=1);assert.equal(total,Math.floor((i+1)*hz/fps));});
  }
  assert.deepEqual(frameCadence(50,10,16),Array(16).fill(5));
  assert.deepEqual(frameCadence(60,10,16),Array(16).fill(6));
});
test('invalid frame rates fail before assembly', () => {
  for(const fps of [0,51,12.5,NaN])assert.throws(()=>timingConfig(fps),/FPS/);
});
test('explicit unsupported FPS literals cannot silently fall back to 10 fps', () => {
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'c64-fps-'));
 const file=path.join(directory,'demo.asm'),source=fs.readFileSync(path.join(__dirname,'../demo.asm'),'utf8');
 try{
  for(const value of ['12.5','-1','60 / 5']){
   fs.writeFileSync(file,source.replace(/^DEMO_FPS = .*$/m,'DEMO_FPS = '+value));
   assert.throws(()=>readConfig(file),/FPS/);
  }
  fs.writeFileSync(file,source.replace(/^DEMO_FPS = .*\n/m,''));
  assert.equal(readConfig(file).DEMO_FPS,10);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
