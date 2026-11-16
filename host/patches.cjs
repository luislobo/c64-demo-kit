// ABI: zero terminates; 1..127 skips; $81..$ff copies literal bytes.
function encodePatch(from,to,force){
 if(from.length!==to.length)throw Error('Bitmap sizes differ');
 const changed=Array.from(to,(v,i)=>force?force[i]:v!==from[i]),out=[];let written=0;
 for(let i=0;i<to.length;){
  if(!changed[i]){const start=i;while(i<to.length&&!changed[i]&&i-start<127)i++;out.push(i-start);}
  else{const start=i;while(i<to.length&&i-start<127){if(!changed[i]){let end=i;while(end<to.length&&!changed[end]&&end-i<=3)end++;if(end===to.length||end-i>3||end-start>=127)break;}i++;}out.push(128|(i-start),...to.subarray(start,i));written+=i-start;}
 }out.push(0);return{bytes:Buffer.from(out),written};
}
function applyPatch(input,patch){
 const out=Buffer.from(input);let at=0,p=0;
 for(;;){if(p>=patch.length)throw Error('Unterminated patch');const c=patch[p++];if(!c)return out;
  if(c&128){const n=c&127;if(!n||p+n>patch.length||at+n>out.length)throw Error('Invalid literal run');patch.copy(out,at,p,p+n);p+=n;at+=n;}
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
