// Split a target frame period into an integer base and a carried remainder.
// Native scheduling adds the remainder once per displayed phase, independently
// of the 50 Hz music/ticker clock. The reference exposes exact tick sequences.
function timingConfig(fps=10,palTicks){
 if(!Number.isInteger(fps)||fps<1||fps>50)throw Error('DEMO_FPS must be an integer from 1 to 50');
 if(palTicks!==undefined&&(!Number.isInteger(palTicks)||palTicks<1||palTicks>50))throw Error('DEMO_PAL_TICKS must be an integer from 1 to 50');
 const palFPS=palTicks===undefined?fps:50/palTicks;
 return{fps,palFPS,palTicks,startupTicks:Math.max(fps,palFPS)>10?1:0,palBase:palTicks??Math.floor(50/fps),palRemainder:palTicks===undefined?50%fps:0,ntscBase:Math.floor(60/fps),ntscRemainder:60%fps};
}
function frameCadence(hz,fps,count,palTicks){
 const timing=timingConfig(fps,palTicks);
 if(![50,60].includes(hz)||!Number.isInteger(count)||count<0)throw Error('Invalid cadence request');
 const base=hz===50?timing.palBase:timing.ntscBase,remainder=hz===50?timing.palRemainder:timing.ntscRemainder;
 let accumulator=0;
 return Array.from({length:count},()=>{accumulator+=remainder;let ticks=base;if(accumulator>=fps){accumulator-=fps;ticks++;}return ticks;});
}
module.exports={timingConfig,frameCadence};
