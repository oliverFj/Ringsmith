import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {createProjectFile} from '../design/runtime/files.mjs';
import {ringMesh,validate,volume,presets} from '../src/ring.mjs';
import {signetDefaults as defaults,normalizeSignet} from '../src/signet.mjs';
import {initializeSolid,solidAPI} from '../src/solid.mjs';
import {toOBJ,to3MF} from '../src/export.mjs';
await initializeSolid();
function inspect(p) {
  const mesh=ringMesh(p,1,96,80),edges=new Map();
  for(const t of mesh.triangles) {
    const [a,b,c]=t.map(i=>mesh.vertices[i]);
    const u=b.map((n,i)=>n-a[i]),v=c.map((n,i)=>n-a[i]);
    assert.ok(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])>1e-16,'No degenerate faces');
    for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3],k=[Math.min(a,b),Math.max(a,b)].join(',');const e=edges.get(k)||[0,0];e[0]++;e[1]+=a<b?1:-1;edges.set(k,e);}
  }
  assert.ok([...edges.values()].every(([count,sum])=>count===2&&sum===0),'Closed, consistently oriented surface');
  assert.equal(mesh.vertices.length-edges.size+mesh.triangles.length,0,'One open finger passage; no sealed cavities');
  assert.ok(volume(mesh)>0);
  const base=p.diameter/2+p.thickness,top=base+p.diameter/2+p.headThickness;
  const zz=mesh.vertices.map(v=>v[2]);
  assert.ok(Math.abs(Math.min(...zz))<1e-5);
  assert.ok(Math.abs(Math.max(...zz)-top)<1e-5);
  const flat=mesh.triangles.filter(t=>t.every(i=>Math.abs(mesh.vertices[i][2]-top)<1e-5));
  assert.ok(flat.length>0);
  const cap=mesh.vertices.filter(v=>Math.abs(v[2]-top)<1e-5);
  for(const v of cap) assert.ok(Math.hypot(v[0],v[1])<=p.faceWidth/2+1e-5,'Cap stays circular');
  for(const axis of [0,1]) {const values=cap.map(v=>v[axis]);assert.ok(Math.abs(Math.max(...values)-Math.min(...values)-p.faceWidth)<1e-5);}
  const tolerance=p.diameter/2*(1-Math.cos(Math.PI/96))+2e-5;
  for(const [x,y,z] of mesh.vertices) assert.ok(Math.hypot(x,z-base)>=p.diameter/2-tolerance,'No intrusion beyond tessellation tolerance into bore');
  return mesh;
}
test('Round flat face, rolled edge and hollow body remain closed and oriented',()=>inspect(defaults));
test('Representative extremes, including wide heads, retain valid solids',()=>{
  const cases=[
    {diameter:8,width:1,thickness:.6,faceWidth:4,headThickness:.8,innerRounding:0,hollowWall:.3,edgeSoftness:.1,shoulderFullness:0,channelReach:0},
    {diameter:35,width:8,thickness:4,faceWidth:30,headThickness:8,innerRounding:.5,hollowWall:1.5,edgeSoftness:1,shoulderFullness:1},
    {diameter:8,width:4,thickness:1,faceWidth:20,headThickness:4,hollowWall:.6},
    {diameter:35,width:1,thickness:.6,faceWidth:4,headThickness:2,innerRounding:.27,hollowWall:.3},
    {faceWidth:24,edgeSoftness:1,shoulderFullness:1},
  ];
  for(const c of cases)inspect(normalizeSignet({...defaults,...c}));
});
test('Underside cavity and both channels are empty while roof, rails and lower strap are solid',()=>{
  const p=defaults,mesh=ringMesh(p,1,128,96),api=solidAPI();
  const solid=new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(mesh.vertices.flat()),triVerts:new Uint32Array(mesh.triangles.flat())}));
  const base=p.diameter/2+p.thickness,H=p.diameter/2+p.headThickness;
  const inside=([x,y,z])=>solid.rayCast([x,y,z+base],[x+113.113,y+97.133,z+base+149.339]).length%2===1;
  try {
    assert.equal(inside([.013,.017,H-p.hollowWall-.2]),false,'Open under the crown');
    assert.equal(inside([.013,.017,H-p.hollowWall/2]),true,'Roof retained');
    const r=p.diameter/2+(p.thickness-p.hollowWall)*.5;
    for(const x of [-r,r])assert.equal(inside([x,.013,.017]),false,'Both side channels open');
    for(const x of [-8.54,8.54])assert.equal(inside([x,1.2,.017]),true,'Material beside the channels retained');
    assert.equal(inside([.013,.017,-p.diameter/2-p.thickness/2]),true,'Lower strap retained');
    const parts=solid.decompose();assert.equal(parts.length,1);parts.forEach(s=>s.delete());
  } finally {solid.delete();}
});
test('Front shoulders stay outward bowed and retain wall thickness normal to each side',()=>{
  const p=defaults,mesh=ringMesh(p,1,192,128),api=solidAPI();
  const solid=new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(mesh.vertices.flat()),triVerts:new Uint32Array(mesh.triangles.flat())}));
  const base=p.diameter/2+p.thickness;
  const front=(z,side)=>Math.abs(solid.rayCast([side*30,.017,z+base],[-side*30,.017,z+base])[0].position[0]);
  try {
    for(const side of [-1,1]) {
      const widths=Array.from({length:11},(_,z)=>front(z,side));
      const slopes=widths.slice(1).map((x,i)=>x-widths[i]);
      for(let i=1;i<slopes.length;i++) assert.ok(slopes[i]<=slopes[i-1]+.001,'No inward waist above the shank');
      for(const z of [2,4,6,8,10]) {
        const x=front(z,side),slope=(front(z+.01,side)-front(z-.01,side))/.02;
        const length=Math.hypot(1,slope),nx=side/length,nz=-slope/length;
        const hits=solid.rayCast([side*x+nx*.01,.017,z+base+nz*.01],[side*x-nx*6,.017,z+base-nz*6]);
        const thickness=Math.hypot(...hits[1].position.map((v,i)=>v-hits[0].position[i]));
        assert.ok(thickness>=p.hollowWall-.01,'Measure through the wall, not just its horizontal offset');
      }
    }
  } finally {solid.delete();}
});
test('Export includes cavities, circular face and a single application of allowance',()=>{
  const a=ringMesh(defaults,1,96,80),b=ringMesh(defaults,1.02,96,80);
  a.vertices.forEach((v,i)=>v.forEach((n,j)=>assert.equal(b.vertices[i][j],n*1.02)));
  assert.ok(Math.abs(volume(b)/volume(a)-1.02**3)<1e-9);
  const obj=new OBJLoader().parse(toOBJ(b));assert.equal(obj.children[0].geometry.attributes.position.count,b.triangles.length*3);
  const xml=strFromU8(unzipSync(to3MF(b))['3D/3dmodel.model']);
  assert.match(xml,/unit="millimeter"/);assert.equal([...xml.matchAll(/<vertex /g)].length,b.vertices.length);
});
test('New and legacy files validate; oval legacy data converts explicitly to the round model',async()=>{
  const files=createProjectFile({format:'ringsmith.project',version:1,validate:data=>({valid:validate(data),errors:['Invalid ring']})});
  const old={type:'signet',diameter:16.2,width:3.2,thickness:1.1,faceWidth:10,faceLength:12,headThickness:1.5,innerRounding:.2,edgeSoftness:.35,shoulderFullness:.2,allowance:2};
  for(const p of [defaults,presets[0],old]) {
    const f=new File([JSON.stringify({format:'ringsmith.project',version:1,data:p})],'ring.json');assert.deepEqual(await files.read(f),p);
  }
  assert.equal(normalizeSignet(old).faceLength,10);
  assert.ok(normalizeSignet(old).hollowWall>0);
  for(const p of [{...defaults,type:'other'},{...defaults,headThickness:0},{...defaults,hollowWall:2},{...defaults,channelReach:2},{...defaults,geometryVersion:99},{...defaults,thickness:.6,innerRounding:.5}])assert.equal(validate(p),false);
});
test('Production-resolution 3MF serialization preserves every nonzero-area cut face',()=>{
  const m=ringMesh(defaults,1.02),xml=strFromU8(unzipSync(to3MF(m))['3D/3dmodel.model']);
  const v=[...xml.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)].map(match=>match.slice(1).map(Number));
  assert.equal(v.length,m.vertices.length);
  for(const t of m.triangles) {
    const [a,b,c]=t.map(i=>v[i]);const u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]);
    assert.ok(Math.hypot(u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0])>0,'Export must not collapse a cut face');
  }
});
