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
const{parseSid,prepareSid,sidConstants}=require('./host/sid.cjs');
const{createD64}=require('./host/d64.cjs');
const{colorFieldAssets,firePlasmaAssets}=require('./host/color-fields.cjs');
const{allocatePatches}=require('./host/patch-memory.cjs');
const{timingConfig}=require('./host/timing.cjs');
const{planPatches}=require('./host/patch-planner.cjs');
function build({entry=path.join(__dirname,'demo.asm'),outDir=path.join(__dirname,'build'),compiler=process.env.TASS64||path.join(__dirname,'tools/64tass/64tass.exe')}={}){
 entry=path.resolve(entry);outDir=path.resolve(outDir);const project=path.dirname(entry),c=readConfig(entry),generated=path.join(project,'generated');
 if(c.DEMO_SID_FILE!==undefined&&(typeof c.DEMO_SID_FILE!=='string'||!c.DEMO_SID_FILE.trim()))throw Error('DEMO_SID_FILE must name a PSID file');
 if(c.DEMO_SID_BUILD!==undefined){
  if(project!==__dirname)throw Error('Bundled SID source generation requires an entry beside build.cjs');
  require('./tools/build-example-music.cjs').buildExampleMusic(compiler,c.DEMO_SID_BUILD);
 }
 const sid=c.DEMO_SID_FILE===undefined?null:prepareSid(parseSid(fs.readFileSync(path.resolve(project,c.DEMO_SID_FILE))),c);
 fs.mkdirSync(generated,{recursive:true});fs.mkdirSync(outDir,{recursive:true});
 const releaseCredits=c.DEMO_CREDITS_FILE===undefined?null:fs.readFileSync(path.resolve(project,c.DEMO_CREDITS_FILE));
 const image=fs.readFileSync(path.resolve(project,c.DEMO_IMAGE)),font=fs.readFileSync(path.resolve(project,c.DEMO_FONT_FILE));
 const base=drawText(fitBitmap(image,c.DEMO_LOGO_HEIGHT),font,c.DEMO_HUD);
 const geometry={frames:c.DEMO_FRAMES,amplitude:c.DEMO_WAVE_AMPLITUDE,wavelength:c.DEMO_WAVE_LENGTH,height:c.DEMO_LOGO_HEIGHT};
 const fields=c.DEMO_COLOR_FIELDS?colorFieldAssets():Buffer.alloc(0),fieldBytes=fields.length+(c.DEMO_COLOR_FIELDS?92:0);
 let frames,patches,layout,turns;
 if(c.DEMO_PATCH_PLAN==='legacy'){
  frames=waveFrames(base,geometry);patches=makeDoubleBufferedPatches(base,frames);
  layout=allocatePatches(patches,fieldBytes);
 }else{
  ({frames,patches,layout,turns}=planPatches(base,geometry,fieldBytes,c.DEMO_PATCH_PLAN==='balanced'));
 }
 verifyPatches(base,frames,patches);
 const pointers=layout.pointers;
 fs.writeFileSync(path.join(generated,'patches-low.bin'),layout.low);
 fs.writeFileSync(path.join(generated,'patch-layout.inc'),`PATCH_LOW_BYTES = ${layout.low.length}\nPATCH_LOW_START = $${layout.lowStart.toString(16)}\n`);
 fs.writeFileSync(path.join(generated,'patch-tails.inc'),layout.tails.map(p=>'    .word $'+p.toString(16)).join('\n')+'\n');
 fs.writeFileSync(path.join(generated,'color-fields.bin'),fields);
 if(c.DEMO_COLOR_FIELDS&&c.DEMO_FIRE_PLASMA)fs.writeFileSync(path.join(generated,'fire-plasma.bin'),firePlasmaAssets());
 const timing=timingConfig(c.DEMO_FPS,c.DEMO_PAL_TICKS);
 fs.writeFileSync(path.join(generated,'effects-config.inc'),`KIT_COLOR_FIELDS = ${c.DEMO_COLOR_FIELDS}\nKIT_FIRE_PLASMA = ${c.DEMO_FIRE_PLASMA}\nKIT_START_EFFECT = ${c.DEMO_START_EFFECT}\nKIT_AUTO_SHOW = ${c.DEMO_AUTO_SHOW}\nKIT_FPS = ${timing.fps}\nKIT_STARTUP_TICKS = ${timing.startupTicks}\nKIT_PAL_BASE = ${timing.palBase}\nKIT_PAL_REMAINDER = ${timing.palRemainder}\nKIT_NTSC_BASE = ${timing.ntscBase}\nKIT_NTSC_REMAINDER = ${timing.ntscRemainder}\n`);
 for(const[name,data]of[['static-bitmap.bin',base],['frames.bin',Buffer.concat(frames)],['patches.bin',layout.high],['patch-pointers.inc',pointers.map(p=>'    .word $'+p.toString(16)).join('\n')+'\n'],['music-config.inc',sidConstants(sid)],['music.inc',sid?'':musicTables({lead:c.DEMO_LEAD,bass:c.DEMO_BASS,arp:c.DEMO_ARP})]])fs.writeFileSync(path.join(generated,name),data);
 if(sid)fs.writeFileSync(path.join(generated,'sid-payload.bin'),sid.data);else fs.rmSync(path.join(generated,'sid-payload.bin'),{force:true});
 const prg=path.join(outDir,c.DEMO_NAME+'.prg'),d64=path.join(outDir,c.DEMO_NAME+'.d64');
 execFileSync(compiler,['--cbm-prg','-a','-o',prg,'--labels='+path.join(outDir,'symbols.labels'),'--vice-labels','-L',path.join(outDir,'assembly.list'),entry],{cwd:project,stdio:'inherit'});
 const program=fs.readFileSync(prg);fs.writeFileSync(d64,createD64(program,{diskName:c.DEMO_DISK_NAME,diskId:c.DEMO_DISK_ID,filename:c.DEMO_PRG_NAME}));
 const report={entry,frames:c.DEMO_FRAMES,fps:c.DEMO_FPS,startupTicks:timing.startupTicks,effects:c.DEMO_COLOR_FIELDS?6:3,startEffect:c.DEMO_START_EFFECT,colorFieldBytes:fieldBytes,programBytes:program.length,patchBytes:layout.low.length+layout.high.length,encodedPatchBytes:layout.total,lowPatchBytes:layout.low.length,highPatchBytes:layout.high.length,highMemoryFree:0xc000-layout.highEnd-fieldBytes,prg,d64,patches:patches.map((p,i)=>({address:pointers[i],continuation:layout.tails[i],bytes:p.bytes.length,writes:p.written,fills:p.fills}))};
 const creditsFile=path.join(outDir,c.DEMO_NAME+'-music-credits.json');
 if(c.DEMO_SID_BUILD)report.musicSymbols=path.join(project,'build',c.DEMO_SID_BUILD==='clockwork'?'example-music':'after-hours','symbols.labels');
 report.palFPS=timing.palFPS;
 report.palTicks=timing.palTicks;
 report.patchPlan=c.DEMO_PATCH_PLAN;
 report.phaseTurns=turns;
 report.estimatedDecodeCycles=patches.map(p=>Math.round(p.cycles/256));
 const noticeFile=path.join(outDir,c.DEMO_NAME+'-credits.txt');
 if(releaseCredits)fs.writeFileSync(noticeFile,releaseCredits);else fs.rmSync(noticeFile,{force:true});
 if(sid){const{data,...credits}=sid;report.music=credits;fs.writeFileSync(creditsFile,JSON.stringify(credits,null,2)+'\n');}else fs.rmSync(creditsFile,{force:true});
 fs.writeFileSync(path.join(outDir,'build-report.json'),JSON.stringify(report,null,2));return report;
}
if(require.main===module){try{const args=process.argv.slice(2);let entry,outDir;for(let i=0;i<args.length;i++){if(args[i]==='--entry')entry=args[++i];else if(args[i]==='--out')outDir=args[++i];else throw Error('Usage: node build.cjs [--entry demo.asm] [--out output-folder]');}console.log(JSON.stringify(build({entry,outDir}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={build};
