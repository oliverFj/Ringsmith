import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unzipSync, strFromU8 } from 'fflate';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ringMesh, presets, volume, validate } from '../src/ring.mjs';
import { toOBJ, to3MF } from '../src/export.mjs';

function checkMesh(mesh, p, scale) {
  const edges = new Map();
  for (const t of mesh.triangles) {
    const [a,b,c] = t.map(i => mesh.vertices[i]);
    const ab = b.map((n,i) => n-a[i]), ac = c.map((n,i) => n-a[i]);
    assert.ok(Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]) > 1e-10);
    for (let j=0;j<3;j++) { const a=t[j],b=t[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(','); const e=edges.get(key)||[0,0]; e[0]++;e[1]+=a<b?1:-1;edges.set(key,e); }
  }
  assert.ok([...edges.values()].every(([count,balance]) => count===2 && balance===0), 'Closed, consistently oriented surface');
  assert.equal(mesh.vertices.length-edges.size+mesh.triangles.length,0, 'Torus topology');
  const radii=mesh.vertices.map(([x,y])=>Math.hypot(x,y)),z=mesh.vertices.map(v=>v[2]);
  assert.ok(Math.abs(Math.min(...radii)*2-p.diameter*scale)<1e-10);
  assert.ok(Math.abs(Math.max(...radii)*2-(p.diameter+2*p.thickness)*scale)<1e-10);
  assert.ok(Math.abs(Math.max(...z)-Math.min(...z)-p.width*scale)<1e-10);
  assert.ok(volume(mesh)>0,'Outward faces');
}
test('Both requested sizes and extreme profiles produce closed rings with exact dimensions',()=>{
  for(const p of presets) for(const flatness of [2,4,6]) for(const comfort of [.2,.55,.8]) {
    const data={...p,flatness,comfort};checkMesh(ringMesh(data,1.02,64,128),data,1.02);
  }
});
test('Allowance is applied exactly once to all axes',()=>{
  const p=presets[0], a=ringMesh(p,1,64,64), b=ringMesh(p,1.02,64,64);
  for(let i=0;i<a.vertices.length;i++) a.vertices[i].forEach((n,j)=>assert.equal(b.vertices[i][j],n*1.02));
  assert.ok(Math.abs(volume(b)/volume(a)-1.02**3)<1e-10);
  assert.equal(p.diameter,16.2);
});

test('Band normals follow the smooth surface and rotate consistently, independently of triangle areas',()=>{
  for(const flatness of [2,4,6])for(const comfort of [.2,.55,.8]) {
    const p={...presets[0],flatness,comfort},segments=64,samples=128,m=ringMesh(p,1,segments,samples);
    assert.equal(m.normals.length,m.vertices.length*3);
    for(let i=0;i<m.vertices.length;i++) {
      const [x,y,z]=m.vertices[i],r=Math.hypot(x,y),offset=r-p.diameter/2-p.thickness*comfort;
      const n=offset>=0?flatness:2,b=p.thickness*(offset>=0?1-comfort:comfort),a=p.width/2;
      const gr=Math.sign(offset)*Math.abs(offset/b)**(n-1)/b;
      const gz=Math.sign(z-a)*Math.abs((z-a)/a)**(n-1)/a;
      const length=Math.hypot(gr,gz),actual=Array.from(m.normals.subarray(i*3,i*3+3));
      const expected=[gr*x/r/length,gr*y/r/length,gz/length];
      assert.ok(Math.abs(Math.hypot(...actual)-1)<1e-6);
      assert.ok(actual.every((v,k)=>Math.abs(v-expected[k])<1e-6),'Normal matches the curved surface at every rotation');
    }
  }
});
test('OBJ roundtrips through an independent loader and 3MF contains the same indexed mesh in mm',()=>{
  const mesh=ringMesh(presets[1],1.02,64,64),obj=toOBJ(mesh);
  const loaded=new OBJLoader().parse(obj).children[0];
  assert.equal(loaded.geometry.attributes.position.count,mesh.triangles.length*3);
  const files=unzipSync(to3MF(mesh)),xml=strFromU8(files['3D/3dmodel.model']);
  assert.match(xml,/unit="millimeter"/);assert.match(xml,/<item objectid="1"\/>/);
  assert.equal([...xml.matchAll(/<vertex /g)].length,mesh.vertices.length);
  assert.equal([...xml.matchAll(/<triangle /g)].length,mesh.triangles.length);
  assert.match(strFromU8(files['_rels/.rels']),/Target="\/3D\/3dmodel.model"/);
});
test('Invalid projects and geometry are rejected',()=>{
  for(const p of [null,{}, {...presets[0],width:0},{...presets[0],diameter:NaN},{...presets[0],allowance:-1}])assert.equal(validate(p),false);
  assert.throws(()=>ringMesh({...presets[0],thickness:-1}));
});
