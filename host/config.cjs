/**
 * Algorithm: recognize literal DEMO_* assignments with a constrained regex,
 * translate assembler hexadecimal numerals outside strings, then JSON-decode.
 * Validate byte ranges, font text, equal voice lengths, and power-of-two masks.
 * Why: one assembly application file serves both assembler and host, without
 * executing arbitrary JavaScript or maintaining a second configuration format.
 * Tradeoff: this is intentionally not a 64tass parser: computed expressions,
 * macros and general assembly syntax are outside the supported config subset.
 * Mask-based runtime loops depend on these checks; malformed settings fail early.
 * Detailed guide: docs/ALGORITHMS.md
 */
const fs=require('node:fs');
const{timingConfig}=require('./timing.cjs');
// Read literal DEMO_* assignments only. This deliberately does not execute JS
// or attempt to interpret arbitrary assembler expressions.
function readConstants(file){
 const text=fs.readFileSync(file,'utf8'),config={};
 for(const m of text.matchAll(/^\s*(DEMO_[A-Z_]+)\s*=\s*(\[[\s\S]*?\]|"(?:[^"\\]|\\.)*"|\$[0-9a-f]+|\d+)\s*(?:;[^\n]*)?$/gmi)){
  const value=m[2].startsWith('"')?m[2]:m[2].replace(/\$([0-9a-f]+)/gi,(_,n)=>String(parseInt(n,16)));
  config[m[1]]=JSON.parse(value);
 }
 return config;
}
function readConfig(file){
 const config=readConstants(file);
 for(const key of ['DEMO_FPS','DEMO_PAL_TICKS']){
  if(config[key]===undefined&&new RegExp('^\\s*'+key+'\\s*=','m').test(fs.readFileSync(file,'utf8')))throw Error(key+' must use an integer literal from 1 to 50');
 }
 config.DEMO_FPS ??= 10;
 timingConfig(config.DEMO_FPS,config.DEMO_PAL_TICKS);
 config.DEMO_PATCH_PLAN ??= 'legacy';
 if(!['legacy','cycles','balanced'].includes(config.DEMO_PATCH_PLAN))throw Error('DEMO_PATCH_PLAN must be legacy, cycles or balanced');
 config.DEMO_COLOR_FIELDS ??= 0;
 config.DEMO_FIRE_PLASMA ??= 0;
 config.DEMO_FIREPIT ??= 0;
 if(![0,1].includes(config.DEMO_FIREPIT))throw Error('DEMO_FIREPIT must be 0 or 1');
 if(![0,1].includes(config.DEMO_FIRE_PLASMA))throw Error('DEMO_FIRE_PLASMA must be 0 or 1');
 config.DEMO_START_EFFECT ??= 1;
 config.DEMO_AUTO_SHOW ??= 0;
 if(![0,1].includes(config.DEMO_AUTO_SHOW))throw Error('DEMO_AUTO_SHOW must be 0 or 1');
 if(![0,1].includes(config.DEMO_COLOR_FIELDS))throw Error('DEMO_COLOR_FIELDS must be 0 or 1');
 if(!Number.isInteger(config.DEMO_START_EFFECT)||config.DEMO_START_EFFECT<1||config.DEMO_START_EFFECT>(config.DEMO_COLOR_FIELDS?6:3))throw Error('Invalid DEMO_START_EFFECT for enabled modes');
 if(config.DEMO_SID_BUILD!==undefined){
  const tune=config.DEMO_SID_BUILD;
  if(!['clockwork','after-hours'].includes(tune)||config.DEMO_SID_FILE!=='generated/'+tune+'.sid')throw Error('DEMO_SID_BUILD requires a bundled tune and its generated SID path');
 }
 if(config.DEMO_CREDITS_FILE!==undefined&&(typeof config.DEMO_CREDITS_FILE!=='string'||!config.DEMO_CREDITS_FILE.trim()))throw Error('DEMO_CREDITS_FILE must name a text notice');
 const stringKeys=['NAME','DISK_NAME','DISK_ID','PRG_NAME','IMAGE','FONT_FILE','HUD','SCROLL_TEXT'];
 for(const k of stringKeys)if(typeof config['DEMO_'+k]!=='string')throw Error('Missing string DEMO_'+k);
 if(!/^[a-z0-9_-]+$/i.test(config.DEMO_NAME))throw Error('DEMO_NAME must be a filename stem');
 for(const [k,max]of [['DISK_NAME',16],['PRG_NAME',16],['DISK_ID',2]])if(config['DEMO_'+k].length<1||config['DEMO_'+k].length>max)throw Error('Invalid DEMO_'+k+' length');
 const pow2=n=>Number.isInteger(n)&&n>0&&(n&(n-1))===0;
 if(!pow2(config.DEMO_FRAMES)||config.DEMO_FRAMES<2||config.DEMO_FRAMES>32)throw Error('DEMO_FRAMES must be a power of two from 2 to 32');
 if(config.DEMO_SID_FILE===undefined){
  if(!pow2(config.DEMO_LEAD?.length)||config.DEMO_LEAD.length>128)throw Error('Tune length must be a power of two up to 128');
  for(const k of ['LEAD','BASS','ARP'])if(config['DEMO_'+k]?.length!==config.DEMO_LEAD.length||!config['DEMO_'+k].every(n=>Number.isInteger(n)&&n>=0&&n<=95))throw Error('Tune voices must have equal lengths and MIDI notes 0..95');
 }
 if(config.DEMO_PALETTE?.length!==8||!config.DEMO_PALETTE.every(n=>Number.isInteger(n)&&n>=16&&n<=240&&n%16===0))throw Error('Palette needs eight foreground-color bytes with black background');
 for(const k of ['LOGO_COLOR','TEXT_COLOR'])if(!Number.isInteger(config['DEMO_'+k])||config['DEMO_'+k]<1||config['DEMO_'+k]>15)throw Error('Invalid DEMO_'+k);
 if(!Number.isInteger(config.DEMO_VOLUME)||config.DEMO_VOLUME<0||config.DEMO_VOLUME>15)throw Error('Volume must be 0..15');
 if(!Number.isInteger(config.DEMO_NOTE_TICKS)||config.DEMO_NOTE_TICKS<2||config.DEMO_NOTE_TICKS>255)throw Error('Note ticks must be 2..255');
 if(!Number.isInteger(config.DEMO_LOGO_HEIGHT)||config.DEMO_LOGO_HEIGHT<8||config.DEMO_LOGO_HEIGHT>184)throw Error('Logo height must be 8..184');
 if(config.DEMO_FIREPIT&&(config.DEMO_LOGO_HEIGHT<48||config.DEMO_LOGO_HEIGHT>88||config.DEMO_LOGO_HEIGHT%8))throw Error('DEMO_FIREPIT needs a logo height from 48 to 88 in eight-pixel rows');
 if(!Number.isFinite(config.DEMO_WAVE_LENGTH)||config.DEMO_WAVE_LENGTH<=0||!Number.isFinite(config.DEMO_WAVE_AMPLITUDE)||config.DEMO_WAVE_AMPLITUDE<0||config.DEMO_WAVE_AMPLITUDE>40)throw Error('Invalid wave geometry');
 if(config.DEMO_HUD.length>38)throw Error('HUD exceeds the 38-column inset');
 for(const k of ['HUD','SCROLL_TEXT'])if(!/^[\x20-\x5f]+$/.test(config['DEMO_'+k]))throw Error('DEMO_'+k+' must use uppercase C64 font characters');
 return config;
}
module.exports={readConstants,readConfig};
