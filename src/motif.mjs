import { solidAPI } from './solid.mjs';
export const maxEngravingDepth = p => Number(Math.max(0,Math.min(2,p.hollowWall-0.2)).toFixed(9));
export function motifContours(m) {
  const a=m.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return m.contours.map(loop=>loop.map(([x,y])=>[m.offsetX+m.size*(x*c-y*s),m.offsetY+m.size*(x*s+y*c)]));
}
export function validateMotif(m,p) {
  if(m===undefined||m===null) return true;
  if(m.version!==1||!['svg','raster'].includes(m.source)||typeof m.name!=='string'||m.name.length>180||!['engrave','relief'].includes(m.mode))return false;
  for(const [k,min,max] of [['size',.2,30],['rotation',-180,180],['offsetX',-15,15],['offsetY',-15,15],['depth',.02,m.mode==='engrave'?maxEngravingDepth(p):2]])if(!Number.isFinite(m[k])||m[k]<min||m[k]>max)return false;
  if(!Array.isArray(m.contours)||!m.contours.length||m.contours.length>1024)return false;
  let count=0;
  for(const loop of m.contours){if(!Array.isArray(loop)||loop.length<3)return false;count+=loop.length;for(const v of loop)if(!Array.isArray(v)||v.length!==2||!v.every(n=>Number.isFinite(n)&&Math.abs(n)<=1))return false;}
  if(count>16000)return false;
  if(m.source==='raster'&&(!Number.isInteger(m.threshold)||m.threshold<1||m.threshold>255||typeof m.invert!=='boolean'||typeof m.sourceData!=='string'||m.sourceData.length>600000||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(m.sourceData)))return false;
  const radius=p.faceWidth/2-.15;
  return motifContours(m).every(loop=>loop.every(([x,y])=>Math.hypot(x,y)<=radius+1e-8));
}
export function applyMotif(body,p,H,solids) {
  const m=p.motif;if(!m)return body;
  if(!validateMotif(m,p))throw new Error('Motivet går ud over fladen, eller graveringen er for dyb. Tilpas størrelse, placering eller dybde.');
  const {CrossSection}=solidAPI();let section;
  try {
    section=new CrossSection(motifContours(m),'NonZero');
    if(section.isEmpty())throw new Error('Motivet har ingen udfyldt flade.');
    const relief=m.mode==='relief';
    const raised=section.extrude(m.depth+.04);solids.push(raised);
    const tool=raised.translate([0,0,relief?H-.04:H-m.depth]);solids.push(tool);
    const result=relief?body.add(tool):body.subtract(tool);solids.push(result);
    return result;
  } finally {section?.delete();}
}
