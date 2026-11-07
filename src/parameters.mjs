import {limits} from './ring.mjs';
import {signetLimits} from './signet.mjs';

const percentKeys=new Set(['flatness','comfort','edgeSoftness','channelReach','shoulderFullness','innerBlend']);
export function parameterControl(type,key) {
  const [low,high]=(type==='signet'?signetLimits:limits)[key];
  const percent=percentKeys.has(key);
  return {
    min:percent?0:low,max:percent?100:high,
    step:percent?1:key==='allowance'?.1:['thickness','hollowWall','innerRounding'].includes(key)?.01:.1,
    display:value=>percent?Number(((value-low)/(high-low)*100).toFixed(1)):value,
    read:(value,previous)=>{
      // Display rounding must not change legacy precision in untouched fields.
      if(value===(percent?Number(((previous-low)/(high-low)*100).toFixed(1)):previous))return previous;
      return percent?value===0?low:value===100?high:low+(high-low)*value/100:value;
    },
  };
}
export function validNumber(input) {
  // The native step controls the arrows. Typed and saved measurements may
  // retain finer precision, so a step mismatch is not a measurement error.
  const value=input.valueAsNumber;
  return Number.isFinite(value)&&!input.validity.badInput&&
    (input.min===''||value>=Number(input.min))&&(input.max===''||value<=Number(input.max));
}
