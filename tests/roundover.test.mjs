import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tangentRoundover,signetOpeningArc,signetDefaults as p} from '../src/signet.mjs';
import {initializeSolid,solidAPI} from '../src/solid.mjs';
import {ringMesh} from '../src/ring.mjs';
import {creasedNormals} from '../src/shading.mjs';
await initializeSolid();

test('Source normals survive tangent cuts, property welding and both mirrored openings',()=>{
  const mesh=ringMesh(p,1,192,96),base=p.diameter/2+p.thickness;
  assert.equal(mesh.normals.length,mesh.triangles.length*9);
  for(let i=0;i<mesh.normals.length;i+=3)assert.ok(Math.abs(Math.hypot(...mesh.normals.subarray(i,i+3))-1)<1e-5);
  for(const edge of ['outer','cavity'])for(const theta of [Math.PI/2,3*Math.PI/2])for(const side of [-1,1]) {
    const arc=signetOpeningArc(p,theta,edge);if(!arc)continue;
    const [r,y]=arc.points[12],target=[r*Math.cos(theta),side*y,r*Math.sin(theta)+base];
    const expected=[(r-arc.center[0])*Math.cos(theta),side*(y-arc.center[1]),(r-arc.center[0])*Math.sin(theta)];
    const length=Math.hypot(...expected);let best=Infinity,corner;
    for(let f=0;f<mesh.triangles.length;f++)for(let j=0;j<3;j++) {
      const v=mesh.vertices[mesh.triangles[f][j]],distance=Math.hypot(...v.map((x,k)=>x-target[k]));
      if(distance<best){best=distance;corner=f*9+j*3;}
    }
    assert.ok(best<.00001,'The normal is tested on the actual fillet surface');
    assert.ok(expected.reduce((sum,n,k)=>sum+n/length*mesh.normals[corner+k],0)>.99999,'Normal follows the circular sweep, not cut-face slivers');
  }
});

test('A curved fan shares one normal across every smooth edge and retains sharp creases',()=>{
  const vertices=[[0,0,0],[1,0,0],[0,1,0],[-1,0,1],[0,-1,2]];
  const triangles=[[0,1,2],[0,2,3],[0,3,4]],normals=creasedNormals(vertices,triangles);
  assert.deepEqual(normals.slice(0,3),normals.slice(9,12));
  assert.deepEqual(normals.slice(9,12),normals.slice(18,21));
  const sharp=creasedNormals([[0,0,0],[1,0,0],[0,1,0],[0,0,1]],[[0,1,2],[0,3,1]]);
  assert.deepEqual(Array.from(sharp.slice(0,3)),[0,0,1]);
  assert.deepEqual(Array.from(sharp.slice(9,12)),[0,1,0]);
});

test('Opening arc meets a straight bore and curved cavity tangentially with sub-micron chord error',()=>{
  for(const side of [-1,1])for(const slope of [-1,0,1]) {
    const wall=x=>4+slope*(x-8)+.15*(x-8)**2;
    const {points,center,radius}=tangentRoundover(wall,8,.2,24,side);
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

test('Channel roundover preserves solid lower strap and outer shoulders',()=>{
  const api=solidAPI(),make=blend=>{
    const m=ringMesh({...p,innerBlend:blend},1,192,96);
    return new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(m.vertices.flat()),triVerts:new Uint32Array(m.triangles.flat())}));
  };
  const sharp=make(0),round=make(1),base=p.diameter/2+p.thickness;
  try {
    for(const z of [-8])for(const y of [-1,0,1]) {
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
  for(let i=1;i<=20;i++)denseVertices.push([Math.cos(i*Math.PI/40),Math.sin(i*Math.PI/40),0]);
  for(let i=0;i<20;i++)dense.push([0,i===0?1:3+i,4+i]);
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
    for(const edge of ['outer','cavity'])for(const theta of [-.4,-.75,.83,.91,1.19,Math.PI/2,1.94,2.17,2.30]) {
      const arc=signetOpeningArc(p,theta,edge);assert.ok(arc);
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


test('Exterior opening round is continuous around the bore and independent of the shank width',()=>{
  for(const width of [1,3.2,8])for(let i=0;i<360;i++) {
    const theta=i*Math.PI/180;
    const arc=signetOpeningArc({...p,width},theta,'outer');
    assert.ok(arc,'An exterior edge round exists at every angle');
    assert.ok(Math.abs(arc.points[0][0]-p.diameter/2)<1e-9,'Same cylindrical bore through shank and shoulders');
    assert.ok(arc.points.every(([r,y])=>Number.isFinite(r)&&Number.isFinite(y)&&r>=p.diameter/2-1e-9));
  }
  assert.equal(signetOpeningArc({...p,innerRounding:0},0,'outer'),null);
  assert.equal(signetOpeningArc({...p,innerBlend:0},0),null);
});
