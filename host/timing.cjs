// Split a target frame period into an integer base and a carried remainder.
// Native scheduling adds the remainder once per displayed phase, independently
// of the 50 Hz music/ticker clock. The reference exposes exact tick sequences.
function timingConfig(fps=10){
 if(!Number.isInteger(fps)||fps<1||fps>50)throw Error('DEMO_FPS must be an integer from 1 to 50');
 return{fps,startupTicks:fps>10?1:0,palBase:Math.floor(50/fps),palRemainder:50%fps,ntscBase:Math.floor(60/fps),ntscRemainder:60%fps};
}
function frameCadence(hz,fps,count){
 timingConfig(fps);
 if(![50,60].includes(hz)||!Number.isInteger(count)||count<0)throw Error('Invalid cadence request');
 let accumulator=0;
 return Array.from({length:count},()=>{accumulator+=hz%fps;let ticks=Math.floor(hz/fps);if(accumulator>=fps){accumulator-=fps;ticks++;}return ticks;});
}
module.exports={timingConfig,frameCadence};
