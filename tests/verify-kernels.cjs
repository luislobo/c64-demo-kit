// Exercise literal/fill boundary lengths through the actual native renderer,
// including source/destination page crossings, then inject an overdue deadline.
// The injected stream/trampoline live in KERNAL workspace owned by this demo.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {build}=require('../build.cjs');
const {runVice,readSymbols}=require('./vice.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const report=build(),s=readSymbols(path.join(root,'build/symbols.labels'));
 const frames=fs.readFileSync(path.join(root,'generated/frames.bin'));
 for(const mode of ['pal','ntsc'])await runVice(mode,'copy-kernels',async(m,directory)=>{
  await m.command(`load "${report.prg}" 0`);await m.command('break '+s.idle.toString(16));await m.command('g 810');await m.command('delete');
  await m.write(0x28,[0]);
  const original=await m.bytes(0xe000,1024),pointer=await m.bytes(s.patch_pointers,2),tail=await m.bytes(s.patch_tails,2);
  const literal=Buffer.from(Array.from({length:127},(_,i)=>(i*29)&255));
  const stream=Buffer.concat([Buffer.from([127,123,255]),literal,Buffer.from([128,255,0xa7,129,0x5a,128,127,0x55,128,128,0x66,0])]);
  await m.write(0x2f0,stream);await m.write(s.patch_pointers,[0xf0,2]);await m.write(s.patch_tails,[0,0]);
  await m.write(0x380,[0xa9,0,0x20,s.render&255,s.render>>8,0x4c,0x90,3]);
  await m.command('break 390');await m.command('g 380');await m.command('delete');
  const expected=Buffer.from(original);literal.copy(expected,250);expected.fill(0xa7,377,632);expected[632]=0x5a;
  expected.fill(0x55,633,760);expected.fill(0x66,760,888);
  assert.ok((await m.bytes(0xe000,1024)).equals(expected),'page-crossing literal/fill output');
  await m.write(0xe000,original);await m.write(s.patch_pointers,pointer);await m.write(s.patch_tails,tail);
  await m.command('break '+s.flip_record.toString(16));await m.command('g '+s.idle.toString(16));await m.command('delete');
  const tick=(await m.bytes(7,1))[0];assert.equal((await m.bytes(0x23,1))[0],0);
  await m.write(8,[(tick-80)&255]); // Deliberately corrupt the next target time.
  await m.until(s.flip_record);
  const state=await m.bytes(2,12),gap=(state[5]-tick)&255;
  assert.ok(gap>0&&gap<=12,'late frame recovers without a signed-byte wrap stall');
  assert.ok((await m.bytes(0x23,1))[0]>0,'overload is counted');
  assert.equal(state[0],1);
  assert.ok((await m.bytes(state[3]?0xe000:0x2000,7680)).equals(frames.subarray(8000,15680)));
  const result={mode,literal127CrossesPages:true,fill127And128:true,fill255CrossesPage:true,singleByteLiteral:true,lateDeadlineRecoveryGap:gap,bitmapAfterRecovery:true};
  fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
 });
})().catch(error=>{console.error(error);process.exitCode=1;});
