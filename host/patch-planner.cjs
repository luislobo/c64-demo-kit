// Plan the offscreen bitmap transitions before assigning their RAM addresses.
const {waveFrames}=require('./bitmap.cjs');
const {encodePatch}=require('./patches.cjs');
const {allocatePatches}=require('./patch-memory.cjs');

function patchInputs(base,frames){
 const inputs=[[base,frames[0]],[base,frames[1]]];
 for(let i=0;i<frames.length;i++)inputs.push([frames[(i+frames.length-2)%frames.length],frames[i]]);
 inputs.push([base,base,Uint8Array.from(base,(_,i)=>frames.some(frame=>frame[i]!==base[i]))]);
 return inputs;
}

function compilePatches(inputs,reservedBytes){
 // The allocator may need a terminator and up to 127 unused low bytes.
 // Start with the full budget and reserve alignment space only if needed.
 const capacity=0x8b00-reservedBytes;
 const prices=[undefined,0,8,12,16,20,24,28,32,40,48,64,96,192,Infinity];
 const options=inputs.map(([from,to,mask])=>prices.map(price=>encodePatch(from,to,mask,price)));
 const last=options.length-1;
 // Static mode and Space both use this stream twice. Keep its latency within
 // the legacy encoder's estimate even when the moving frames need more RAM.
 options[last]=options[last].filter(p=>p.cycles<=options[last][0].cycles);
 const levels=[...new Set(options.slice(0,last).flatMap(row=>row.map(p=>p.cycles)))].sort((a,b)=>a-b);
 function smallest(row,limit){
  let best=null;
  for(const patch of row){
   if(patch.cycles>limit)continue;
   if(!best||patch.bytes.length<best.bytes.length||
      (patch.bytes.length===best.bytes.length&&patch.cycles<best.cycles))best=patch;
  }
  return best;
 }
 const pick=(limit)=>options.map((row,i)=>smallest(row,i===last?Infinity:limit));
 for(const space of [capacity,capacity-128]){
  let low=0,high=levels.length;
  while(low<high){
   const mid=(low+high)>>1,chosen=pick(levels[mid]);
   if(chosen.every(Boolean)&&chosen.reduce((size,p)=>size+p.bytes.length,0)<=space)high=mid;
   else low=mid+1;
  }
  if(low===levels.length)continue;
  const chosen=pick(levels[low]);
  let free=space-chosen.reduce((size,p)=>size+p.bytes.length,0);
  // Spend spare bytes on the best decoder-cycle savings per byte, including
  // restoration. Zero-cost improvements have already been included by pick.
  for(;;){
   let best=null;
   for(let i=0;i<options.length;i++)for(const p of options[i]){
    const bytes=p.bytes.length-chosen[i].bytes.length;
    const cycles=chosen[i].cycles-p.cycles;
    if(bytes<=0||bytes>free||cycles<=0)continue;
    if(!best||cycles*best.bytes>best.cycles*bytes)best={i,p,bytes,cycles};
   }
   if(!best)break;
   chosen[best.i]=best.p;free-=best.bytes;
  }
  try{return {patches:chosen,layout:allocatePatches(chosen,reservedBytes)};}
  catch(error){if(!/Patch allocation exceeds/.test(error.message))throw error;}
 }
 return null;
}

function frameCost(costs){
 return 2*Math.max(...costs)+costs.reduce((sum,cost)=>sum+cost,0)/costs.length;
}

function balanceTurns(base,geometry,turns,frames){
 const count=frames.length;
 // Move each pose by at most an eighth of its uniform spacing. Consecutive
 // angular steps stay between 75% and 125% of the original, including wrap.
 const offsets=[0,-1,1];
 const candidates=turns.map((turn,i)=>[frames[i],...waveFrames(base,{
  ...geometry, turns:offsets.slice(1).map(offset=>turn+offset/(count*8))
 })]);
 const choices=turns.map(()=>0);
 const cache=new Map();
 function edge(i){
  const from=(i+count-2)%count;
  const key=i*9+choices[from]*3+choices[i];
  if(!cache.has(key))cache.set(key,encodePatch(candidates[from][choices[from]],candidates[i][choices[i]],undefined,32));
  return cache.get(key);
 }
 function score(){
  return frameCost(choices.map((_,i)=>edge(i).cycles));
 }
 let best=score();
 for(let pass=0;pass<3;pass++){
  let improved=false;
  for(let i=0;i<count;i++){
   let selected=choices[i];
   for(const candidate of [0,1,2]){
    choices[i]=candidate;
    const cost=score();
    if(cost<best){best=cost;selected=candidate;improved=true;}
   }
   choices[i]=selected;
  }
  if(!improved)break;
 }
 return turns.map((turn,i)=>turn+offsets[choices[i]]/(count*8));
}

function planPatches(base,geometry,reservedBytes,balance){
 const uniform=Array.from({length:geometry.frames},(_,i)=>i/geometry.frames);
 const frames=waveFrames(base,geometry);
 const reference=compilePatches(patchInputs(base,frames),reservedBytes);
 if(balance){
  const turns=balanceTurns(base,geometry,uniform,frames);
  const balancedFrames=waveFrames(base,{...geometry,turns});
  const balanced=compilePatches(patchInputs(base,balancedFrames),reservedBytes);
  const cost=plan=>frameCost(plan.patches.slice(0,-1).map(p=>p.cycles));
  if(balanced&&(!reference||cost(balanced)<cost(reference)))return {...balanced,frames:balancedFrames,turns};
 }
 if(!reference)throw Error('Cycle-aware patch options do not fit the bitmap patch regions.');
 return {...reference,frames,turns:uniform};
}
module.exports={planPatches};
