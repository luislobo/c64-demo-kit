// Original 88 BPM score for After Hours Roll. One row is one 4/4 bar.
const { musicTables } = require('../../host/music.cjs');

const H=255,R=254;
// One bar per row. Each beat has three equal subdivisions. The lead
// alternates long notes with pickups on the last triplet of the beat.
const lead=[
 [76,H,H,R,H,74,71,H,69,67,H,68],
 [76,H,H,74,H,71,69,H,67,64,H,R],
 [R,H,67,68,H,71,74,H,76,79,H,76],
 [74,H,H,71,H,69,67,68,H,64,H,R],
 [76,H,H,R,H,73,72,H,74,76,H,79],
 [81,H,H,79,H,76,73,H,72,69,H,R],
 [76,H,H,74,H,71,69,H,67,68,H,71],
 [76,H,H,R,H,74,71,H,69,67,68,69],
 [78,H,H,R,H,75,74,H,71,69,H,66],
 [76,H,H,74,H,72,73,H,69,67,H,R],
 [76,H,H,74,H,71,69,H,67,64,H,H],
 [R,H,67,68,H,69,71,H,74,75,H,R]
];
const roots=[40,40,40,40,45,45,40,40,47,45,40,47];
const voicing=roots.map(root=>[root+12,root+19,root+22]);
const bass=roots.map((root,i)=>{
 const pickup=roots[(i+1)%roots.length]-1;
 return [root,H,R,root+4,H,R,root+7,H,R,root+9,H,i%2?pickup:root+10];
});
const rhythm=roots.map((_,i)=>i%4===3
 ? [1,0,2,3,0,2,1,0,2,3,2,4]
 : [1,0,2,3,0,2,1,0,2,3,0,4]);
const pulse=Array.from({length:32},(_,i)=>Math.round(154+33*Math.sin(i*2*Math.PI/16)));
const vibrato=Array.from({length:32},(_,i)=>i<4?-150+i*40:Math.round(42*Math.sin(i*2*Math.PI/8)));
const table=(label,values)=>label+':\n'+Array.from({length:Math.ceil(values.length/16)},(_,i)=>
 '    .byte '+values.slice(i*16,i*16+16).join(',')).join('\n')+'\n';

for(const phrase of [lead,bass,rhythm]){
 if(phrase.length!==12||phrase.some(bar=>bar.length!==12))throw Error('Expected 12 bars of 12 subdivisions');
}
let score=table('lead',lead.flat())+table('bass',bass.flat())+table('rhythm',rhythm.flat())+table('pulse',pulse)+table('vibrato_lo',vibrato.map(n=>n&255))+table('vibrato_hi',vibrato.map(n=>(n>>8)&255))+table('chord_bar',roots.flatMap((_,i)=>Array(12).fill(i)));
['low','middle','high'].forEach((part,i)=>{score+=table('voicing_'+part,voicing.map(chord=>chord[i]));});
score += musicTables({ pitch: Array.from({ length: 87 }, (_, midi) => midi) })
  .replace(/^(pal|ntsc)_pitch_/gm, '$1_');
module.exports = score;
