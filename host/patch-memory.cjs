// Use high RAM first; when needed, fill the unused $1500..$1fff gap. A stream
// can continue in high RAM after a low-RAM terminator, but splits occur only
// between commands. Separate continuation pointers avoid per-byte bank checks.
function allocatePatches(patches,reservedBytes=0){
 const lowStart=0x1500,lowCapacity=0x2000-lowStart,highStart=0x4000,highLimit=0xc000-reservedBytes;
 const total=patches.reduce((n,p)=>n+p.bytes.length,0),useLow=total>highLimit-highStart;
 if(total+reservedBytes>32768+lowCapacity)throw Error(`Patch streams and tables need ${total+reservedBytes} bytes; only ${32768+lowCapacity} fit across both memory regions.`);
 const low=[],high=[],pointers=[],tails=[];let lowEnd=lowStart,highEnd=highStart;
 for(const p of patches){
  const available=useLow?0x2000-lowEnd:0;
  if(p.bytes.length<=available){pointers.push(lowEnd);tails.push(0);low.push(p.bytes);lowEnd+=p.bytes.length;continue;}
  let split=0;
  if(available>1)while(split<p.bytes.length){
   const command=p.bytes[split],size=command===128?3:command&128?1+(command&127):1;
   if(!command||split+size>available-1)break;
   split+=size;
  }
  if(split){
   pointers.push(lowEnd);tails.push(highEnd);
   low.push(p.bytes.subarray(0,split),Buffer.from([0]));lowEnd+=split+1;
  }else{pointers.push(highEnd);tails.push(0);}
  const rest=p.bytes.subarray(split);high.push(rest);highEnd+=rest.length;
 }
 if(highEnd>highLimit||lowEnd>0x2000)throw Error('Patch allocation exceeds available memory after command alignment.');
 return{pointers,tails,lowStart,low:Buffer.concat(low),high:Buffer.concat(high),highEnd,total};
}
module.exports={allocatePatches};
