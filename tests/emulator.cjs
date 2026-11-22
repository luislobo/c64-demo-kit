/**
 * Validation algorithm: drive a running VICE remote monitor over TCP, load the
 * PRG, break at renderer/flip boundaries, dump bitmap memory and compare against
 * host frames. Measure decoder cycles and tick spacing; test restore/restart,
 * mode requests, PSID progress and matching nonempty ticker buffers.
 * Why: actual emulator execution checks assembly contracts and timing that a
 * host decoder cannot. A short quiet interval coalesces monitor prompt packets.
 * Limit: default-demo fixture; mode events are queued in RAM, not physical keys.
 * PSID progress is not an audible-quality test; real hardware is untested.
 * The test quits the target emulator on success; failed runs may need cleanup.
 * Detailed guide: docs/ALGORITHMS.md
 */
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const project=path.resolve(__dirname,'..'),root=path.join(project,'build'),mode=process.argv[2]||'pal',port=Number(process.argv[3]||6522);
const {readMusicSymbols}=require('./vice.cjs');
const {colorFieldRow}=require('../host/color-fields.cjs');
const {frameCadence}=require('../host/timing.cjs');
const {readConfig}=require('../host/config.cjs'); const config=readConfig(path.join(project,'demo.asm'));
const symbols=Object.fromEntries(fs.readFileSync(path.join(root,'symbols.labels'),'utf8').trim().split(/\r?\n/).map(l=>{const [,a,n]=l.split(/\s+/);return[n.slice(1),parseInt(a,16)];}));
const h=n=>n.toString(16);
class Monitor {
 constructor(){this.buffer='';this.log='';this.socket=net.connect(port,'127.0.0.1',()=>this.socket.write('\n'));this.socket.on('data',d=>{this.buffer+=d;this.log+=d;this.pump();});this.socket.on('error',e=>this.reject?.(e));}
 pump(){clearTimeout(this.quiet);if(this.resolve&&/\(C:\$[0-9a-f]+\)\s*$/i.test(this.buffer)){this.quiet=setTimeout(()=>{if(!this.resolve)return;const r=this.buffer;this.buffer='';const done=this.resolve;this.resolve=null;clearTimeout(this.timeout);done(r);},15);}}
 wait(){return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;this.timeout=setTimeout(()=>reject(Error('Monitor timeout: '+this.buffer.slice(-500))),15000);this.pump();});}
 async command(c){if(process.platform==='win32')c=c.replace(/"[^"]*"/g,operand=>operand.replaceAll('\\','/'));fs.appendFileSync(path.join(root,'monitor-'+mode+'-live.txt'),c+'\n');const p=this.wait();this.socket.write(c+'\n');return p;}
 async until(label){return this.command('until '+h(symbols[label]));}
 async bytes(start,end,name){const file=path.join(root,mode+'-'+name+'.bin').replaceAll('\\','/');await this.command(`bsave "${file}" 0 ${h(start)} ${h(end)}`);return fs.readFileSync(file);}
}
(async()=>{
const m=new Monitor();await m.wait();
await m.command(`load "${path.join(root,config.DEMO_NAME+'.prg').replaceAll('\\','/')}" 0`);
await m.command('break '+h(symbols.idle));await m.command('g 810');await m.command('delete 1');
let state=await m.bytes(2,13,'state');
await m.command('> 28 00'); // Test manual modes without automatic scene changes.
const refresh=mode==='pal'?50:60;
const basePeriod=frameCadence(refresh,config.DEMO_FPS,1,config.DEMO_PAL_TICKS)[0];
const nominalFPS=mode==='pal'&&config.DEMO_PAL_TICKS?50/config.DEMO_PAL_TICKS:config.DEMO_FPS;
if(state[7] !== basePeriod)throw Error('Incorrect frame base period: '+state[7]);
const base=fs.readFileSync(path.join(project,'generated/static-bitmap.bin'));
for(const start of [0x2000,0xe000])if(!(await m.bytes(start,start+7999,'initial-'+h(start))).subarray(0,7680).equals(base.subarray(0,7680)))throw Error('Initial bitmap mismatch');
const index=(x,y)=>(y>>3)*320+(x>>3)*8+(y&7);
const allFrames=fs.readFileSync(path.join(project,'generated/frames.bin'));
const frames=Array.from({length:config.DEMO_FRAMES},(_,i)=>allFrames.subarray(i*8000,(i+1)*8000));
await m.command('> 06 01');
const times=[],flips=[];
const frameChecks=config.DEMO_FRAMES*2+4;
for(let i=0;i<frameChecks;i++){
 await m.until('render');await m.command('stopwatch reset');
 await m.until('render_done');
 const sw=await m.command('stopwatch');
 const cycles=Number(sw.match(/Stopwatch:\s*(\d+)/i)?.[1] || sw.match(/(\d+)\s*\n\(C:/)?.[1]);
 times.push(cycles);
 await m.until('flip_record');state=await m.bytes(2,13,'state');
 const phase=state[0],visible=state[3],tick=state[5];
 const start=visible?0xe000:0x2000;
 if(!(await m.bytes(start,start+7999,'frame')).subarray(0,7680).equals(frames[phase].subarray(0,7680)))throw Error('Emulated frame mismatch '+i+' phase '+phase);
 flips.push({phase,tick});
 if(i===3)await m.command(`screenshot "${path.join(root,mode+'-optimized-wave.png').replaceAll('\\','/')}" 2`);
}
const expectedIntervals=frameCadence(refresh,config.DEMO_FPS,frameChecks,config.DEMO_PAL_TICKS);
for(let i=1;i<flips.length;i++)if(((flips[i].tick-flips[i-1].tick)&255)!==expectedIntervals[i])throw Error('Uneven frame timing '+JSON.stringify({times,flips}));
// Queue the same event the IRQ generates on a Space press; verify stop and restart.
await m.command('> 06 01');await m.until('idle');
for(const start of [0x2000,0xe000])if(!(await m.bytes(start,start+7999,'restored-'+h(start))).subarray(0,7680).equals(base.subarray(0,7680)))throw Error('Static restore failed');
await m.command('> 06 01');await m.until('flip_record');
state=await m.bytes(2,13,'state');const start=state[3]?0xe000:0x2000;
if(!(await m.bytes(start,start+7999,'restart')).subarray(0,7680).equals(frames[0].subarray(0,7680)))throw Error('Restart failed');
await m.command('> 06 01');await m.until('idle');
await m.command(`screenshot "${path.join(root,mode+'-optimized-static.png').replaceAll('\\','/')}" 2`);
// Exercise the demo's mode-request path while music and the ticker keep running.
await m.command('> 10 02');
for(let i=0;i<12;i++)await m.until('flip_record');
const colors=await m.bytes(0x400,0x7e7,'rainbow-colors');
if(!colors.subarray(0,920).some(v=>v!==0x60))throw Error('Rainbow mode did not color the logo');
if(!colors.subarray(920).every(v=>v===0x10))throw Error('Controls/ticker colors were altered');
await m.command(`screenshot "${path.join(root,mode+'-rainbow-demo.png').replaceAll('\\','/')}" 2`);
await m.command('> 10 03');await m.until('idle');
const music=readMusicSymbols(JSON.parse(fs.readFileSync(path.join(root,'build-report.json'))),project);
const callsBefore=(await m.bytes(music.sample_calls,music.sample_calls+1,'music-before')).readUInt16LE();
const before=await m.bytes(0x0f,0x20,'demo-before');
for(let i=0;i<32;i++)await m.until('scroll_done');
const after=await m.bytes(0x0f,0x20,'demo-after');
if(after[0]!==3)throw Error('Color-only mode was not selected');
if(callsBefore===(await m.bytes(music.sample_calls,music.sample_calls+1,'music-after')).readUInt16LE())throw Error('SID player did not advance');
const ticker=await m.bytes(0x3e00,0x3f3f,'ticker');
if(!ticker.some(v=>v!==0))throw Error('Ticker stayed blank');
if(!(await m.bytes(0xfe00,0xff3f,'ticker-secondary')).equals(ticker))throw Error('Ticker buffers disagree');
await m.command(`screenshot "${path.join(root,mode+'-full-demo.png').replaceAll('\\','/')}" 2`);
await m.command('> 10 01');
for(let i=0;i<8;i++)await m.until('flip_record');
if(!(await m.bytes(0x400,0x797,'blue-colors')).every(v=>v===0x60))throw Error('Blue mode did not restore colors');
// Compare every native color cell in all new modes, including a phase wrap.
const fieldResults=[];
for(const effect of [4,5,6]){
 await m.command('> 10 '+h(effect));await m.until('effect_return');
 if((await m.bytes(0x0f,0x0f,'effect'))[0]!==effect)throw Error('Field request was not consumed');
 await m.command('> 19 00 f9');
 const seenRows=new Set();
 for(let i=0;i<46;i++){
  await m.until('color_row_done');
  const [row,phase]=await m.bytes(0x19,0x1a,'field-state');
  const expected=colorFieldRow(effect,phase,row,config.DEMO_PALETTE);
  for(const screen of [0x400,0xc000]){
   if(!(await m.bytes(screen+row*40,screen+row*40+39,'field-row')).equals(expected))throw Error(`Field ${effect} row ${row} phase ${phase} differs`);
  }
  seenRows.add(row);
 }
 if(seenRows.size!==23)throw Error('Field did not cover every logo row');
 for(const screen of [0x400,0xc000])if(!(await m.bytes(screen+920,screen+999,'field-hud')).every(v=>v===0x10))throw Error('Field altered text colors');
 const fieldFlips=[];
 for(let i=0;i<config.DEMO_FRAMES+2;i++){
  await m.until('flip_record');const state=await m.bytes(2,13,'field-flip');
  const start=state[3]?0xe000:0x2000;
  if(!(await m.bytes(start,start+7359,'field-bitmap')).equals(frames[state[0]].subarray(0,7360)))throw Error('Field corrupted wave bitmap');
  fieldFlips.push({tick:state[5],interval:(await m.bytes(0x2d,0x2d,'frame-interval'))[0]});
 }
 for(let i=1;i<fieldFlips.length;i++)if(((fieldFlips[i].tick-fieldFlips[i-1].tick)&255)!==fieldFlips[i].interval)throw Error('Field delayed bitmap flips');
 await m.command(`screenshot "${path.join(root,mode+'-logo-'+['plasma','xor','tunnel'][effect-4]+'.png')}" 2`);
 fieldResults.push({effect,rowsVerified:46,bitmapFramesVerified:config.DEMO_FRAMES+2,phaseWrap:true});
}
// Native VBI calls remain one per IRQ with the most expensive field enabled.
await m.until('irq');const tick=(await m.bytes(7,7,'call-tick'))[0];
const sidCalls=(await m.bytes(music.sample_calls,music.sample_calls+1,'call-start')).readUInt16LE();
for(let i=0;i<16;i++)await m.until('irq');
if((((await m.bytes(7,7,'call-tick-end'))[0]-tick)&255)!==16)throw Error('Raster tick drift');
if((((await m.bytes(music.sample_calls,music.sample_calls+1,'call-end')).readUInt16LE()-sidCalls)&65535)!==16)throw Error('SID call drift');
if((await m.bytes(0x23,0x23,'deadline-misses'))[0]!==0)throw Error('Frame deadline was missed');
const report={mode,nominalFPS,deadlineMisses:0,framesVerified:frameChecks+3*(config.DEMO_FRAMES+2),colorFields:fieldResults,sidCallsPer16Refreshes:16,basePeriod,decoderCycles:times,flips,stopAndRestart:true,rainbowMode:true,colorOnlyMode:true,psidPlayback:true,scrollingText:true};
fs.writeFileSync(path.join(root,'test-'+mode+'.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'monitor-'+mode+'.txt'),m.log);
console.log(JSON.stringify(report,null,2));m.socket.end('quit\n');
})().catch(e=>{console.error(e);process.exit(1);});
