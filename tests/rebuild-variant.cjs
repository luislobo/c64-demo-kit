// Integration check: change only the application assembly/config and image.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{build}=require('../build.cjs');
const{index}=require('../host/bitmap.cjs');
const root=path.join(__dirname,'..'),entry=path.join(root,'demo-variant.asm');
const source=fs.readFileSync(path.join(root,'demo.asm'),'utf8');
const image=Buffer.alloc(8000);for(let y=20;y<180;y++)for(let x=20;x<300;x++){const r=Math.hypot(x-160,y-100);if(Math.abs(r-65)<3||Math.abs(x-160)+Math.abs(y-100)<40)image[index(x,y)]|=128>>(x&7);}
fs.mkdirSync(path.join(root,'build'),{recursive:true});fs.writeFileSync(path.join(root,'build/variant-image.bin'),image);
const variant=source.replace('DEMO_NAME = "torqxsendero-c64"','DEMO_NAME = "alternate-demo"').replace('DEMO_FRAMES = 8','DEMO_FRAMES = 4').replace('DEMO_VOLUME = 12','DEMO_VOLUME = 9').replace('DEMO_IMAGE = "assets/image.bin"','DEMO_IMAGE = "build/variant-image.bin"').replace('DEMO_HUD = "1 WAVE  2 RAINBOW  3 COLOR  M MUSIC"','DEMO_HUD = "REUSABLE LIBRARY TEST"').replace(/^DEMO_SCROLL_TEXT = .+$/m,'DEMO_SCROLL_TEXT = "        A DIFFERENT IMAGE AND FOUR FRAMES ... SAME LIBRARIES!        "');
try{
 fs.writeFileSync(entry,variant);
 const report=build({entry,outDir:path.join(root,'build/variant')});assert.equal(report.frames,4);assert.equal(report.patches.length,7);
 console.log('Alternate image, text, volume and frame count built without any library changes.');
}finally{
 fs.rmSync(entry,{force:true});build();
}
