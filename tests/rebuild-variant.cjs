/**
 * Validation algorithm: draw a synthetic ring/diamond image, derive a temporary
 * application with different text, volume and four frames, then invoke the same
 * builder and assembler. Finally remove the fixture and rebuild the default.
 * Why: demonstrate reuse by changing only application configuration and assets,
 * not the libraries. Finally restores generated files even if the variant fails.
 * Limit: this is a build/host-patch integration check, not a variant emulator test.
 * It shares generated/ with the application and must not run concurrently.
 * Detailed guide: docs/ALGORITHMS.md
 */
// Integration check: change only the application assembly/config and image.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{build}=require('../build.cjs');
const{index}=require('../host/bitmap.cjs');
const root=path.join(__dirname,'..'),entry=path.join(root,'demo-variant.asm');
const source=fs.readFileSync(path.join(root,'demo.asm'),'utf8');
const image=Buffer.alloc(8000);for(let y=20;y<180;y++)for(let x=20;x<300;x++){const r=Math.hypot(x-160,y-100);if(Math.abs(r-65)<3||Math.abs(x-160)+Math.abs(y-100)<40)image[index(x,y)]|=128>>(x&7);}
fs.mkdirSync(path.join(root,'build'),{recursive:true});fs.writeFileSync(path.join(root,'build/variant-image.bin'),image);
const variant=source.replace('DEMO_NAME = "torqxsendero-c64"','DEMO_NAME = "alternate-demo"').replace(/^DEMO_FRAMES = \d+$/m,'DEMO_FRAMES = 4').replace('DEMO_VOLUME = 12','DEMO_VOLUME = 9').replace('DEMO_IMAGE = "assets/image.bin"','DEMO_IMAGE = "build/variant-image.bin"').replace(/^DEMO_HUD = .+$/m,'DEMO_HUD = "REUSABLE LIBRARY TEST"').replace(/^DEMO_SCROLL_TEXT = .+$/m,'DEMO_SCROLL_TEXT = "        A DIFFERENT IMAGE AND FOUR FRAMES ... SAME LIBRARIES!        "');
try{
 fs.writeFileSync(entry,variant);
 const report=build({entry,outDir:path.join(root,'build/variant')});assert.equal(report.frames,4);assert.equal(report.patches.length,7);
 const builtin=variant.replace(/^DEMO_SID_[A-Z_]+ = .*\n/gm,'').replace('DEMO_COLOR_FIELDS = 1','DEMO_COLOR_FIELDS = 0').replace('DEMO_START_EFFECT = 4','DEMO_START_EFFECT = 1').replace('DEMO_AUTO_SHOW = 1','DEMO_AUTO_SHOW = 0')+'\nDEMO_LEAD = [60,64,67,72]\nDEMO_BASS = [36,36,41,41]\nDEMO_ARP = [48,52,55,60]\n';
 fs.writeFileSync(entry,builtin);
 const legacy=build({entry,outDir:path.join(root,'build/variant-builtin')});
 assert.equal(legacy.music,undefined);assert.equal(legacy.effects,3);assert.equal(legacy.colorFieldBytes,0);
 console.log('Alternate artwork/configuration and built-in music without optional fields built successfully.');
}finally{
 fs.rmSync(entry,{force:true});build();
}
