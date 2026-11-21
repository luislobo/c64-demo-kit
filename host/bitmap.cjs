/**
 * Algorithm: map pixels to VIC cell order, nearest-neighbor-fit a 320x200 source
 * into the logo area, stamp 8x8 HUD glyphs, then shift each logo row by
 * round(amplitude * sin(2*pi*y/wavelength + 2*pi*phase/frameCount)).
 * Why: precompute sine motion so the C64 only copies patches. Clone the base
 * and clear only the 23 body rows, preserving controls and reserved ticker space.
 * Tradeoff: one bit per pixel and integer shifts give hard edges and discrete
 * phases; this is not antialiasing, resampling for photographs, or multicolor.
 * Frame generation costs O(frameCount * 320 * logoHeight) time on the host.
 * Detailed guide: docs/ALGORITHMS.md
 */
const WIDTH=320,HEIGHT=200,BYTES=8000;
const index=(x,y)=>(y>>3)*320+(x>>3)*8+(y&7);
function fitBitmap(image,height=184){
 if(image.length!==BYTES)throw Error('Image must be an 8000-byte C64 hires bitmap');
 const out=Buffer.alloc(BYTES),width=Math.round(WIDTH*height/HEIGHT),left=Math.floor((WIDTH-width)/2);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const ox=Math.floor(x*WIDTH/width),oy=Math.floor(y*HEIGHT/height);
  if(image[index(ox,oy)]&(128>>(ox&7)))out[index(x+left,y)]|=128>>((x+left)&7);
 }
 return out;
}
function drawText(bitmap,font,text,x=16,y=184){
 if(font.length!==512)throw Error('Font must contain 64 eight-byte glyphs');
 for(let c=0;c<text.length;c++)for(let r=0;r<8;r++)bitmap[index(c*8+x,y+r)]=font[(text.charCodeAt(c)&63)*8+r];
 return bitmap;
}
function waveFrames(base,{frames=8,amplitude=8,wavelength=100,height=184,turns}={}){
 return Array.from(turns??Array.from({length:frames},(_,i)=>i/frames),turn=>{
  const out=Buffer.from(base);out.fill(0,0,23*320);
  for(let y=0;y<height;y++){
   const shift=Math.round(amplitude*Math.sin(y*2*Math.PI/wavelength+turn*2*Math.PI));
   for(let x=0;x<WIDTH;x++)if(base[index(x,y)]&(128>>(x&7))){const dx=x+shift;if(dx>=0&&dx<WIDTH)out[index(dx,y)]|=128>>(dx&7);}
  }return out;
 });
}
module.exports={WIDTH,HEIGHT,BYTES,index,fitBitmap,drawText,waveFrames};
