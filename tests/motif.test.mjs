import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeSolid,solidAPI} from '../src/solid.mjs';
import {ringMesh,volume,validate} from '../src/ring.mjs';
import {signetDefaults as p} from '../src/signet.mjs';
import {validateMotif,motifContours} from '../src/motif.mjs';
import {traceMask,canonicalContours,contoursFromPixels,prepareSVG} from '../src/motif-import.mjs';
await initializeSolid();
const circle=(r,reverse=false)=>Array.from({length:64},(_,i)=>{const a=(reverse?-1:1)*i*Math.PI/32;return[r*Math.cos(a),r*Math.sin(a)];});
const motif={version:1,source:'svg',name:'Ringmotiv.svg',contours:[circle(.5),circle(.2,true)],mode:'engrave',size:6,rotation:0,offsetX:0,offsetY:0,depth:.2};
function solidOf(mesh) {const api=solidAPI();return new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(mesh.vertices.flat()),triVerts:new Uint32Array(mesh.triangles.flat())}));}

test('Standard SVG DOCTYPE from illustration editors is removed before parsing; entities and internal DTDs stay blocked',()=>{
  const svg='<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 0L0 10Z"/></svg>';
  for(const doctype of [
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    "<!DOCTYPE svg SYSTEM 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>",
    '<!DOCTYPE svg>',
  ])assert.equal(prepareSVG(doctype+'\n'+svg),'\n'+svg);
  assert.equal(prepareSVG(svg),svg);
  assert.throws(()=>prepareSVG('<!DOCTYPE svg [<!ENTITY file SYSTEM "file:///private">]>'+svg),/entiteter/);
  assert.throws(()=>prepareSVG('<!DOCTYPE svg [<!ELEMENT svg ANY>]>'+svg),/intern DTD/);
  assert.throws(()=>prepareSVG(' '.repeat(2*1024*1024+1)),/2 MB/);
});
test('Motif transform preserves proportions; invalid placements and unsafe depths are rejected',()=>{
  assert.equal(validateMotif(motif,p),true);
  assert.equal(validateMotif({...motif,depth:.1},{...p,hollowWall:.3}),true,'Exact decimal depth boundary remains usable');
  for(const m of [{...motif,size:30},{...motif,offsetX:10},{...motif,depth:.5},{...motif,rotation:Infinity},{...motif,contours:[[[NaN,0],[0,1],[1,0]]]},{...motif,source:'script'}])assert.equal(validateMotif(m,p),false);
  assert.equal(validate({...p,motif:{...motif,depth:.5}}),false);
  const transformed=motifContours({...motif,contours:[[[-.5,-.25],[.5,-.25],[0,.25]]],size:4,rotation:90,offsetX:.5});
  assert.ok(Math.abs(transformed[0][0][0]-1.5)<1e-10);assert.ok(Math.abs(transformed[0][0][1]+2)<1e-10);
});
test('Engraving and relief are real, connected solids and preserve the holes in the artwork',()=>{
  const blank=ringMesh(p,1,96,80),top=p.diameter+p.thickness+p.headThickness;
  for(const mode of ['engrave','relief']) {
    const m={...motif,mode},mesh=ringMesh({...p,motif:m},1,96,80),solid=solidOf(mesh);
    try {
      assert.equal(solid.status(),'NoError');assert.equal(solid.genus(),1);
      const parts=solid.decompose();assert.equal(parts.length,1);parts.forEach(s=>s.delete());
      const inside=([x,y,z])=>solid.rayCast([x,y,z],[x+113.13,y+91.53,z+133.17]).length%2===1;
      assert.equal(inside([2,.017,top+(mode==='relief'?.1:-.1)]),mode==='relief','Extruded/removed ring-shaped region');
      assert.equal(inside([.013,.017,top+(mode==='relief'?.1:-.1)]),mode==='engrave','Hole stays empty in relief and stays metal in engraving');
      assert.equal(inside([2,.017,top-.5]),true,'Roof remains below the engraving');
      assert.ok(mode==='relief'?volume(mesh)>volume(blank):volume(mesh)<volume(blank));
    } finally {solid.delete();}
  }
});
test('Binary image tracing retains holes and diagonal foreground islands',()=>{
  const mask=new Uint8Array(64).fill(1);for(let y=2;y<6;y++)for(let x=2;x<6;x++)mask[y*8+x]=0;
  const contours=canonicalContours(traceMask(mask,8,8));
  const section=new (solidAPI().CrossSection)(contours,'NonZero');
  try{assert.ok(Math.abs(section.area()-.75)<1e-8);assert.equal(section.toPolygons().length,2);}finally{section.delete();}
  const diagonal=canonicalContours(traceMask(new Uint8Array([1,0,0,1]),2,2));assert.equal(diagonal.length,2);
  const rgba=new Uint8Array([0,0,0,255,255,255,255,255,180,180,180,255,0,0,0,0]);
  assert.ok(contoursFromPixels(rgba,2,2,128,false).length>0);
  assert.throws(()=>canonicalContours([[[Infinity,0],[0,1],[1,0]]]),/koordinater/);
  assert.throws(()=>contoursFromPixels(new Uint8Array(16),2,2,128,false),/ikke fundet/);
});
test('Local opening roundover changes exported geometry while retaining the nominal bore',()=>{
  const sharp=ringMesh({...p,innerBlend:0},1,96,80),rounded=ringMesh({...p,innerBlend:1},1,96,80);
  assert.ok(Math.abs(volume(sharp)-volume(rounded))>.001);
  const base=p.diameter/2+p.thickness,tolerance=p.diameter/2*(1-Math.cos(Math.PI/96))+2e-5;
  for(const [x,y,z] of rounded.vertices)assert.ok(Math.hypot(x,z-base)>=p.diameter/2-tolerance);
  const solid=solidOf(rounded);assert.equal(solid.status(),'NoError');assert.equal(solid.genus(),1);solid.delete();
});
