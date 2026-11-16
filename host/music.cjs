/**
 * Algorithm: MIDI -> Hz via 440 * 2^((note-69)/12), then round(Hz*2^24/clock).
 * Emit low/high-byte tables for each of three voices at PAL and NTSC SID clocks.
 * Why: SID phase accumulators use integer frequency words; host-side math keeps
 * runtime note changes to table loads and register writes with no floating point.
 * Tradeoff: extra table memory buys simple runtime code. Rounding quantizes pitch;
 * these nominal clocks do not calibrate an individual machine or analog SID tone.
 * Detailed guide: docs/ALGORITHMS.md
 */
function sidFrequency(midi,clock){return Math.round(440*2**((midi-69)/12)*2**24/clock);}
function musicTables(voices){
 let text='; Generated SID frequency tables. Do not edit.\n';
 for(const[standard,clock]of[['pal',985248],['ntsc',1022727]])for(const[voice,notes]of Object.entries(voices)){
  const words=notes.map(n=>sidFrequency(n,clock));
  for(const[part,fn]of[['lo',n=>n&255],['hi',n=>n>>8]])text+=`${standard}_${voice}_${part}:\n    .byte ${words.map(n=>'$'+fn(n).toString(16)).join(',')}\n`;
 }return text;
}
module.exports={sidFrequency,musicTables};
