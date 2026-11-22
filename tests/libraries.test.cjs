/**
 * Validation algorithm: exercise skip/literal boundaries and erasure, simulate
 * four-frame double buffering, then independently walk D64 chains and count BAM
 * free bits at several payload lengths, including exact 254-byte boundaries.
 * Also check SID pitch rounding/config shape and application-free library source.
 * Why: validate format invariants and cross-component behavior rather than just
 * asserting the same individual operations used by the implementation.
 * Limit: host tests do not execute 6510 code or prove analog SID/audio quality.
 * Detailed guide: docs/ALGORITHMS.md
 */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{readConfig}=require('../host/config.cjs');
const{encodePatch,applyPatch,makeDoubleBufferedPatches,verifyPatches}=require('../host/patches.cjs');
const{createD64,offset,sectors}=require('../host/d64.cjs');
const{sidFrequency}=require('../host/music.cjs');
test('sparse patches erase old pixels, cross run boundaries and reject corruption',()=>{
 const a=Buffer.alloc(8000,255),b=Buffer.alloc(8000);for(let i=0;i<8000;i+=29)b[i]=i&255;
 assert.deepEqual(applyPatch(a,encodePatch(a,b).bytes),b);
 assert.deepEqual(applyPatch(b,encodePatch(b,a).bytes),a);
 assert.throws(()=>applyPatch(b,Buffer.from([0xff,1])),/literal/);
 assert.throws(()=>applyPatch(Buffer.alloc(1),Buffer.from([2,0])),/overrun/);
});
test('double-buffer transitions support a different image and four-frame configuration',()=>{
 const base=Buffer.alloc(8000),frames=Array.from({length:4},(_,n)=>{const b=Buffer.alloc(8000);b.fill(n+1,n*137,n*137+300);return b;});
 verifyPatches(base,frames,makeDoubleBufferedPatches(base,frames));
});
test('D64 PRG chains and allocation map agree at sector boundaries',()=>{
 for(const size of [2,253,254,255,508,38752,65535]){
  const prg=Buffer.alloc(size);for(let i=0;i<size;i++)prg[i]=(i*17)&255;
  const d=createD64(prg),dir=offset(18,1),bam=offset(18,0),chunks=[];let t=d[dir+3],s=d[dir+4],count=0;const used=new Set(['18/0','18/1']);
  while(t){const key=t+'/'+s;assert(!used.has(key));used.add(key);const at=offset(t,s),nt=d[at],ns=d[at+1];chunks.push(d.subarray(at+2,at+(nt?256:ns+1)));t=nt;s=ns;count++;}
  assert.deepEqual(Buffer.concat(chunks),prg);assert.equal(count,d.readUInt16LE(dir+30));
  for(let track=1;track<=35;track++){let free=0;for(let sector=0;sector<sectors(track);sector++){const bit=d[bam+track*4+1+(sector>>3)]&(1<<(sector&7));assert.equal(Boolean(bit),!used.has(track+'/'+sector));if(bit)free++;}assert.equal(free,d[bam+track*4]);}
 }
});
test('application is read from assembly literals and SID pitches use the right clock',()=>{
 const c=readConfig(path.join(__dirname,'../demo.asm'));assert.equal(c.DEMO_FRAMES,16);assert.equal(c.DEMO_FPS,15);assert.equal(c.DEMO_PAL_TICKS,4);assert.equal(c.DEMO_SID_BUILD,'after-hours');assert.equal(c.DEMO_COLOR_FIELDS,1);
 assert(Math.abs(sidFrequency(69,985248)*985248/2**24-440)<0.04);
 assert(Math.abs(sidFrequency(69,1022727)*1022727/2**24-440)<0.04);
});
test('reusable libraries contain no application brand, melody or absolute paths',()=>{
 for(const dir of ['lib','host'])for(const file of fs.readdirSync(path.join(__dirname,'..',dir))){const text=fs.readFileSync(path.join(__dirname,'..',dir,file),'utf8');assert(!/TORQ|SENDERO|D:[/\\]|C:[/\\]/i.test(text),dir+'/'+file);}
});
