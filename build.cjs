/**
 * Algorithm: parse the application constants, fit artwork and add HUD, generate
 * wave frames, encode/verify two-buffer patches, allocate streams, emit assets,
 * run 64tass, package a D64 and write a build report.
 * Why: expensive image/sine/pitch work is done once on the host; the C64 plays
 * validated data. Fixed memory limits fail during build, before producing overlap.
 * Paths resolve from the application file; compiler selection is overridable.
 * Tradeoff: generated/ is shared by entries in one project: builds must be serial.
 * The build report records paths/sizes, not a proof of runtime timing for every image.
 * Detailed guide: docs/ALGORITHMS.md
 */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const{readConfig}=require('./host/config.cjs');
const{fitBitmap,drawText,waveFrames}=require('./host/bitmap.cjs');
const{makeDoubleBufferedPatches,verifyPatches}=require('./host/patches.cjs');
const{musicTables}=require('./host/music.cjs');
const{createD64}=require('./host/d64.cjs');
function build({entry=path.join(__dirname,'demo.asm'),outDir=path.join(__dirname,'build'),compiler=process.env.TASS64||path.join(__dirname,'tools/64tass/64tass.exe')}={}){
 entry=path.resolve(entry);outDir=path.resolve(outDir);const project=path.dirname(entry),c=readConfig(entry),generated=path.join(project,'generated');
 fs.mkdirSync(generated,{recursive:true});fs.mkdirSync(outDir,{recursive:true});
 const image=fs.readFileSync(path.resolve(project,c.DEMO_IMAGE)),font=fs.readFileSync(path.resolve(project,c.DEMO_FONT_FILE));
 const base=drawText(fitBitmap(image,c.DEMO_LOGO_HEIGHT),font,c.DEMO_HUD);
 const frames=waveFrames(base,{frames:c.DEMO_FRAMES,amplitude:c.DEMO_WAVE_AMPLITUDE,wavelength:c.DEMO_WAVE_LENGTH,height:c.DEMO_LOGO_HEIGHT});
 const patches=makeDoubleBufferedPatches(base,frames);verifyPatches(base,frames,patches);
 let end=0x4000;const pointers=patches.map(p=>{const a=end;end+=p.bytes.length;return a;});
 if(end>0xc000)throw Error(`Image patches need ${end-0x4000} bytes; only 32768 fit. Simplify the image or wave before rebuilding.`);
 for(const[name,data]of[['static-bitmap.bin',base],['frames.bin',Buffer.concat(frames)],['patches.bin',Buffer.concat(patches.map(p=>p.bytes))],['patch-pointers.inc',pointers.map(p=>'    .word $'+p.toString(16)).join('\n')+'\n'],['music.inc',musicTables({lead:c.DEMO_LEAD,bass:c.DEMO_BASS,arp:c.DEMO_ARP})]])fs.writeFileSync(path.join(generated,name),data);
 const prg=path.join(outDir,c.DEMO_NAME+'.prg'),d64=path.join(outDir,c.DEMO_NAME+'.d64');
 execFileSync(compiler,['--cbm-prg','-a','-o',prg,'--labels='+path.join(outDir,'symbols.labels'),'--vice-labels','-L',path.join(outDir,'assembly.list'),entry],{cwd:project,stdio:'inherit'});
 const program=fs.readFileSync(prg);fs.writeFileSync(d64,createD64(program,{diskName:c.DEMO_DISK_NAME,diskId:c.DEMO_DISK_ID,filename:c.DEMO_PRG_NAME}));
 const report={entry,frames:c.DEMO_FRAMES,programBytes:program.length,patchBytes:end-0x4000,prg,d64,patches:patches.map(p=>({bytes:p.bytes.length,writes:p.written}))};
 fs.writeFileSync(path.join(outDir,'build-report.json'),JSON.stringify(report,null,2));return report;
}
if(require.main===module){try{const args=process.argv.slice(2);let entry,outDir;for(let i=0;i<args.length;i++){if(args[i]==='--entry')entry=args[++i];else if(args[i]==='--out')outDir=args[++i];else throw Error('Usage: node build.cjs [--entry demo.asm] [--out output-folder]');}console.log(JSON.stringify(build({entry,outDir}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={build};
