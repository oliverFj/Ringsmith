import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tangentRoundover,signetOpeningArc,signetDefaults as p} from '../src/signet.mjs';
import {initializeSolid,solidAPI} from '../src/solid.mjs';
import {ringMesh} from '../src/ring.mjs';
import {creasedNormals} from '../src/shading.mjs';
await initializeSolid();

test('Opening arc meets a straight bore and curved cavity tangentially with sub-micron chord error',()=>{
  for(const slope of [-1,0,1]) {
    const wall=x=>4+slope*(x-8)+.15*(x-8)**2;
    const {points,center,radius}=tangentRoundover(wall,8,.2);
    assert.ok(Math.abs(points[0][0]-8)<1e-10);
    const end=points.at(-1),derivative=slope+.3*(end[0]-8);
    assert.ok(Math.abs(end[1]-wall(end[0]))<1e-9,'Contact lies on cavity');
    assert.ok(Math.abs((end[0]-center[0])+(end[1]-center[1])*derivative)<1e-8,'Tangent matches cavity');
    for(let i=1;i<points.length;i++) {
      const a=points[i-1],b=points[i],mid=a.map((v,j)=>(v+b[j])/2);
      assert.ok(radius-Math.hypot(mid[0]-center[0],mid[1]-center[1])<.001,'Arc chord error below 1 micron');
    }
  }
});

test('Local opening roundover leaves lower shank and outer shoulders unchanged',()=>{
  const api=solidAPI(),make=blend=>{
    const m=ringMesh({...p,innerBlend:blend},1,192,96);
    return new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(m.vertices.flat()),triVerts:new Uint32Array(m.triangles.flat())}));
  };
  const sharp=make(0),round=make(1),base=p.diameter/2+p.thickness;
  try {
    for(const z of [-8,-6,-4,-2,0])for(const y of [-1,0,1]) {
      const hits=s=>s.rayCast([-30,y,z+base],[30,y,z+base]).map(h=>h.position);
      const a=hits(sharp),b=hits(round);assert.equal(a.length,b.length);
      a.forEach((point,i)=>point.forEach((v,j)=>assert.ok(Math.abs(v-b[i][j])<.00002,'Lower shank unchanged')));
    }
    for(const z of [1,3,5,7,9])for(const side of [-1,1]) {
      const x=s=>s.rayCast([side*30,.01,z+base],[-side*30,.01,z+base])[0].position[0];
      assert.ok(Math.abs(x(sharp)-x(round))<.00002,'Approved shoulder silhouette unchanged');
    }
    assert.ok(round.volume()<sharp.volume(),'Rounded edge removes material locally');
  }finally{sharp.delete();round.delete();}
});

test('Reflections retain distinct nearby vertices and ignore triangulation density',()=>{
  const vertices=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]];
  const simple=creasedNormals(vertices,[[0,1,2],[0,3,1]],Math.PI);
  const denseVertices=[...vertices],dense=[];
  for(let i=0;i<=20;i++)denseVertices.push([Math.cos(i*Math.PI/40),Math.sin(i*Math.PI/40),0]);
  for(let i=0;i<20;i++)dense.push([0,4+i,5+i]);
  dense.push([0,3,1]);
  const normals=creasedNormals(denseVertices,dense,Math.PI);
  for(let i=0;i<3;i++)assert.ok(Math.abs(simple[i]-normals[i])<1e-6);
  const nearby=creasedNormals([[0,0,0],[1,0,0],[0,1,0],[.001,0,0],[.001,0,1],[1,0,1]],[[0,1,2],[3,4,5]]);
  assert.deepEqual(Array.from(nearby.slice(0,3)),[0,0,1]);
  assert.deepEqual(Array.from(nearby.slice(9,12)),[0,1,0]);
});

test('Production mesh follows the analytic opening roundover within 2 microns, including between slices',()=>{
  const api=solidAPI(),mesh=ringMesh(p),base=p.diameter/2+p.thickness;
  const solid=new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(mesh.vertices.flat()),triVerts:new Uint32Array(mesh.triangles.flat())}));
  try {
    for(const theta of [.83,.91,1.19,Math.PI/2,1.94,2.17,2.30]) {
      const arc=signetOpeningArc(p,theta);assert.ok(arc);
      const to3D=([r,y])=>[r*Math.cos(theta),y,r*Math.sin(theta)+base];
      const center=to3D(arc.center),end=arc.points.at(-1);
      let endAngle=Math.atan2(end[1]-arc.center[1],end[0]-arc.center[0]);if(endAngle<0)endAngle+=2*Math.PI;
      for(const fraction of [.15,.35,.55,.75,.9]) {
        const a=Math.PI+(endAngle-Math.PI)*fraction;
        const target=to3D([arc.center[0]+2*arc.radius*Math.cos(a),arc.center[1]+2*arc.radius*Math.sin(a)]);
        const hits=solid.rayCast(center,target);assert.ok(hits.length,`Roundover surface exists at ${theta}, ${fraction}, center ${center}, target ${target}`);
        const distance=Math.hypot(...hits[0].position.map((v,i)=>v-center[i]));
        assert.ok(Math.abs(distance-arc.radius)<.002,`Roundover error ${Math.abs(distance-arc.radius)} mm`);
      }
    }
  }finally{solid.delete();}
});

