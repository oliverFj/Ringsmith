import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { solidAPI } from './solid.mjs';
import { maxEngravingDepth } from './motif.mjs';

function limitContours(contours) {
  if(contours.length>1024||contours.reduce((n,c)=>n+c.length,0)>16000)throw new Error('Motivet har for mange detaljer. Brug en enklere kontur eller et renere sort/hvidt billede.');
  if(contours.some(loop=>loop.some(p=>p.length!==2||p.some(n=>!Number.isFinite(n)||Math.abs(n)>1e9))))throw new Error('Motivets koordinater er ugyldige eller for store.');
}
export function canonicalContours(raw,simplification=0) {
  limitContours(raw);
  const {CrossSection}=solidAPI();let section,simple;
  try {
    section=new CrossSection(raw,'EvenOdd');
    simple=simplification?section.simplify(simplification):section;
    if(simple.isEmpty())throw new Error('Der blev ikke fundet et udfyldt motiv.');
    const loops=simple.toPolygons();limitContours(loops);
    const points=loops.flat(),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const span=Math.max(maxX-minX,maxY-minY),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    if(!Number.isFinite(span)||span<=0)throw new Error('Motivet har ingen bredde eller højde.');
    return loops.map(loop=>loop.map(([x,y])=>[(x-cx)/span,(y-cy)/span]));
  } finally {if(simple&&simple!==section)simple.delete();section?.delete();}
}
export function prepareSVG(text) {
  if(text.length>2*1024*1024)throw new Error('SVG-filen må højst fylde 2 MB.');
  if(/<!ENTITY/i.test(text))throw new Error('SVG med XML-entiteter understøttes ikke. Eksportér som almindelige kurver.');
  // Affinity and other editors emit a standard SVG DOCTYPE. Remove the
  // declaration before either parser sees it; external DTDs are unnecessary.
  // Internal subsets and entity declarations remain unsupported.
  const source=text.replace(/<!DOCTYPE\s+svg(?:\s+PUBLIC\s+(?:"[^"]*"|'[^']*')\s+(?:"[^"]*"|'[^']*')|\s+SYSTEM\s+(?:"[^"]*"|'[^']*'))?\s*>/gi,'');
  if(/<!DOCTYPE/i.test(source))throw new Error('SVG-filens XML-deklaration understøttes ikke. Eksportér uden intern DTD.');
  return source;
}
export function importSVG(text) {
  text=prepareSVG(text);
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw new Error('Filen er ikke en gyldig SVG.');
  const blocked=new Set(['script','foreignobject','image','iframe','object','embed','audio','video','animate','animatetransform','set','use','style','text']);
  for(const node of [doc.documentElement,...doc.querySelectorAll('*')]) {
    if(blocked.has(node.localName.toLowerCase()))throw new Error('Brug SVG med kurver, figurer eller streger. Omdan tekst og genbrugte symboler til kurver først.');
    for(const attr of node.attributes) if(/^on/i.test(attr.name)||/href$/i.test(attr.name)||/url\s*\(|@import|javascript:/i.test(attr.value))throw new Error('SVG med eksternt indhold eller aktive elementer understøttes ikke.');
  }
  const data=new SVGLoader().parse(text),{CrossSection}=solidAPI(),parts=[];
  const points=path=>path.getPoints(16).map(p=>[p.x,-p.y]);
  try {
    let pointCount=0;
    const add=loops=>{limitContours(loops);pointCount+=loops.reduce((n,l)=>n+l.length,0);if(pointCount>16000)throw new Error('SVG-motivet har for mange detaljer. Forenkl kurverne først.');parts.push(new CrossSection(loops,'EvenOdd'));};
    for(const path of data.paths) {
      const style=path.userData.style;
      if(style.visibility==='hidden'||style.display==='none'||Number(style.opacity)===0)continue;
      if(style.fill!=='none'&&Number(style.fillOpacity)!==0&&!(path.color.r>.95&&path.color.g>.95&&path.color.b>.95)) {
        for(const shape of SVGLoader.createShapes(path))add([points(shape),...shape.holes.map(points)]);
      }
      if(style.stroke&&style.stroke!=='none'&&style.stroke!=='white'&&style.stroke!=='#ffffff'&&Number(style.strokeOpacity)!==0) {
        for(const sub of path.subPaths) {
          const geometry=SVGLoader.pointsToStroke(sub.getPoints(16),style,8);
          if(!geometry)continue;
          try {const pos=geometry.attributes.position.array;for(let i=0;i<pos.length;i+=9)add([[[pos[i],-pos[i+1]],[pos[i+3],-pos[i+4]],[pos[i+6],-pos[i+7]]]]);}
          finally {geometry.dispose();}
        }
      }
    }
    if(!parts.length)throw new Error('SVG-filen indeholder ingen synlige, mørke figurer eller streger.');
    const union=CrossSection.union(parts);
    try {return canonicalContours(union.toPolygons());}finally{union.delete();}
  } finally {parts.forEach(p=>p.delete());}
}
// Trace cell boundaries, retaining holes. At a diagonal contact, take a
// clockwise turn so the two foreground islands keep separate boundaries.
export function traceMask(mask,width,height) {
  const edges=[],outgoing=new Map(),filled=(x,y)=>x>=0&&y>=0&&x<width&&y<height&&mask[y*width+x];
  function edge(x,y,xx,yy,dir) {
    const a=y*(width+1)+x,b=yy*(width+1)+xx,index=edges.length;
    edges.push({a,b,dir,used:false});if(!outgoing.has(a))outgoing.set(a,[]);outgoing.get(a).push(index);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(filled(x,y)) {
    if(!filled(x,y-1))edge(x,y,x+1,y,0);
    if(!filled(x+1,y))edge(x+1,y,x+1,y+1,1);
    if(!filled(x,y+1))edge(x+1,y+1,x,y+1,2);
    if(!filled(x-1,y))edge(x,y+1,x,y,3);
  }
  if(edges.length>32000)throw new Error('Billedet er for detaljeret. Brug et tydeligt motiv på ensfarvet baggrund.');
  const contours=[],priority=[1,0,3,2];
  for(let i=0;i<edges.length;i++)if(!edges[i].used) {
    const loop=[],start=edges[i].a;let current=i;
    while(true) {
      const e=edges[current];e.used=true;loop.push([e.a%(width+1),-Math.floor(e.a/(width+1))]);
      if(e.b===start)break;
      const next=(outgoing.get(e.b)||[]).filter(index=>!edges[index].used);
      if(!next.length)throw new Error('Billedets kontur kunne ikke lukkes.');
      next.sort((a,b)=>priority.indexOf((edges[a].dir-e.dir+4)%4)-priority.indexOf((edges[b].dir-e.dir+4)%4));current=next[0];
    }
    if(loop.length>=3)contours.push(loop);
  }
  return contours;
}
export function contoursFromPixels(rgba,width,height,threshold,invert) {
  const mask=new Uint8Array(width*height);
  for(let i=0;i<mask.length;i++) {
    const alpha=rgba[i*4+3]/255,gray=(.2126*rgba[i*4]+.7152*rgba[i*4+1]+.0722*rgba[i*4+2])*alpha+255*(1-alpha);
    mask[i]=alpha>.05&&(invert?gray>=threshold:gray<threshold)?1:0;
  }
  const loops=traceMask(mask,width,height);
  if(!loops.length)throw new Error('Der blev ikke fundet et motiv. Justér sort/hvid-grænsen eller vælg lyse områder.');
  return canonicalContours(loops,.35);
}
async function decodeImage(blob) {
  const bitmap=await createImageBitmap(blob);
  if(bitmap.width*bitmap.height>16000000){bitmap.close();throw new Error('Billedet er for stort. Brug højst 16 megapixel.');}
  const scale=Math.min(1,256/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  return {canvas,rgba:ctx.getImageData(0,0,canvas.width,canvas.height).data};
}
export async function rasterContours(sourceData,threshold,invert) {
  const binary=atob(sourceData.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const {canvas,rgba}=await decodeImage(new Blob([bytes],{type:'image/png'}));
  return contoursFromPixels(rgba,canvas.width,canvas.height,threshold,invert);
}
export async function readMotif(file,p) {
  if(file.size>2*1024*1024)throw new Error('Motivfilen må højst fylde 2 MB.');
  const base={version:1,name:file.name.slice(0,180),mode:'engrave',size:Math.min(8,p.faceWidth*.65),rotation:0,offsetX:0,offsetY:0,depth:Math.min(.2,maxEngravingDepth(p))};
  if(/\.svg$/i.test(file.name))return {...base,source:'svg',contours:importSVG(await file.text())};
  if(!/\.(png|jpe?g|webp)$/i.test(file.name))throw new Error('Vælg SVG, PNG, JPG eller WebP.');
  const {canvas,rgba}=await decodeImage(file),threshold=128,invert=false;
  return {...base,source:'raster',threshold,invert,sourceData:canvas.toDataURL('image/png'),contours:contoursFromPixels(rgba,canvas.width,canvas.height,threshold,invert)};
}
