/**
 * Algorithm: use dynamic programming to balance bytes and writes across runs
 * of at most 127 and repeated-byte fills of at most 255. Build two
 * static warm-ups, frame[i-2] -> frame[i] transitions, and a union-based restore.
 * Why: hidden buffers lag by two phases. The restore includes every location
 * that any wave can alter, allowing safe stop/restart from any displayed phase.
 * The JS decoder simulates both buffers for five cycles and checks restoration.
 * The legacy score is 5*encodedBytes + writtenBytes + 2*commands. This keeps fills from
 * overwriting large unchanged areas just to save a header byte. The score is
 * a storage/CPU heuristic. The planner can instead price storage in cycles.
 * Detailed guide: docs/ALGORITHMS.md
 */
// ABI: zero ends; 1..127 skips; $81..$ff copies; $80,count,value fills.
function encodePatch(from,to,force,bytePrice){
 if(from.length!==to.length)throw Error('Bitmap sizes differ');
 if(force&&force.length!==to.length)throw Error('Force mask size differs');
 const changed=Array.from(to,(v,i)=>force?force[i]:v!==from[i]);
 let end=to.length;while(end&&!changed[end-1])end--;
 const costs=new Float64Array(end+1),sizes=new Uint32Array(end+1),kinds=new Uint8Array(end),counts=new Uint8Array(end);
 for(let i=end-1;i>=0;i--){
  let best=Infinity,tie=Infinity,size=0;
  const consider=(kind,n,bytes)=>{
   const cost=bytePrice===undefined?5*bytes+(kind?n:0)+2:
    bytePrice===Infinity?bytes:256*bytePrice*bytes+commandCycles(kind,n,i);
   const score=cost+costs[i+n],encoded=bytes+sizes[i+n];
   const secondary=bytePrice===undefined?1+sizes[i+n]:encoded;
   if(score<best||(score===best&&secondary<tie)){
    best=score;tie=secondary;size=secondary;kinds[i]=kind;counts[i]=n;
   }
  };
  for(let n=1;n<=127&&i+n<=end;n++)consider(1,n,n+1);
  for(let n=1;n<=127&&i+n<=end&&!changed[i+n-1];n++)consider(0,n,1);
  for(let n=3;n<=255&&i+n<=end;n++){
   if(to[i+n-1]!==to[i]||to[i+1]!==to[i])break;
   consider(2,n,3);
  }
  costs[i]=best;sizes[i]=size;
 }
 const out=[];let written=0,fills=0,cycles=0;
 for(let i=0;i<end;){const n=counts[i],kind=kinds[i];
  if(kind===0)out.push(n);
  if(kind===1){out.push(128|n,...to.subarray(i,i+n));written+=n;}
  if(kind===2){out.push(128,n,to[i]);written+=n;fills++;}
  cycles+=commandCycles(kind,n,i);i+=n;
 }
 out.push(0);return{bytes:Buffer.from(out),written,fills,cycles};
}

// Instruction totals for the 6510 decoder in lib/bitmap.asm. The destination
// starts page-aligned, so its carries are exact. Before allocation, the source
// low byte is unknown. Average its pointer carries and indexed read penalties
// over all 256 offsets. Scores use 1/256 cycle units to keep DP ties exact.
function commandCycles(kind,n,destination){
 const carry=(destination&255)+n>=256;
 if(kind===0)return 256*(30+4*carry)+7;
 if(kind===1){
  const cycles=n<8?64+16*n:85+13*n+3*Math.ceil(n/8);
  return 256*(cycles+7*carry)+4+4*n+n*(n-1)/2;
 }
 const cycles=n<128?80+11*n:75+13*n;
 return 256*(cycles+7*carry)+15;
}
function applyPatch(input,patch){
 const out=Buffer.from(input);let at=0,p=0;
 for(;;){if(p>=patch.length)throw Error('Unterminated patch');const c=patch[p++];if(!c)return out;
  if(c===128){if(p+2>patch.length)throw Error('Invalid fill run');const n=patch[p++],value=patch[p++];if(!n||at+n>out.length)throw Error('Invalid fill run');out.fill(value,at,at+n);at+=n;}
  else if(c&128){const n=c&127;if(p+n>patch.length||at+n>out.length)throw Error('Invalid literal run');patch.copy(out,at,p,p+n);p+=n;at+=n;}
  else{at+=c;if(at>out.length)throw Error('Skip overrun');}
 }
}
function makeDoubleBufferedPatches(base,frames){
 const patches=[encodePatch(base,frames[0]),encodePatch(base,frames[1])];
 for(let i=0;i<frames.length;i++)patches.push(encodePatch(frames[(i+frames.length-2)%frames.length],frames[i]));
 const union=Array.from(base,(_,i)=>frames.some(f=>f[i]!==base[i]));
 patches.push(encodePatch(base,base,union));return patches;
}
function verifyPatches(base,frames,patches){
 const buffers=[Buffer.from(base),Buffer.from(base)];let visible=0;
 for(let i=0;i<frames.length*5;i++){
  const f=i%frames.length,d=visible^1,p=i<2?f:f+2;buffers[d]=applyPatch(buffers[d],patches[p].bytes);
  if(!buffers[d].equals(frames[f]))throw Error('Double-buffer frame mismatch');visible=d;
  for(const b of buffers)if(!applyPatch(b,patches[frames.length+2].bytes).equals(base))throw Error('Restore mismatch');
 }
}
module.exports={encodePatch,applyPatch,makeDoubleBufferedPatches,verifyPatches};
