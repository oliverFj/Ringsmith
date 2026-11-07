import { solidAPI } from './solid.mjs';
import { validateMotif, applyMotif } from './motif.mjs';

// Round, capped loft reconstructed from the Fusion reference. Dimensions stay
// in mm; only the finished mesh receives the export allowance.
export const signetDefaults = {
  type: 'signet', geometryVersion: 2, diameter: 16.2, width: 3.2, thickness: 1.1,
  faceWidth: 14.7, faceLength: 14.7, headThickness: 3,
  innerRounding: 0.2, edgeSoftness: 0.35, shoulderFullness: 0.35,
  hollowWall: 0.6, channelReach: 1, innerBlend: 0.35, motif: null, allowance: 2,
};
export const signetLimits = {
  diameter: [8,35], width: [1,8], thickness: [0.6,4],
  faceWidth: [4,30], headThickness: [0.8,8], innerRounding: [0,0.5],
  edgeSoftness: [0.1,1], shoulderFullness: [0,1], hollowWall: [0.3,1.5],
  channelReach: [0,1], innerBlend: [0,1], allowance: [0,15],
};
export const maxHollowWall = p => Math.min(1.5, p.thickness*0.8, p.width*0.4, p.headThickness*0.8, p.faceWidth*0.25);
export function normalizeSignet(p) {
  return { ...p, geometryVersion: 2, faceLength: p.faceWidth,
    hollowWall: p.hollowWall ?? Math.min(0.6,maxHollowWall(p)), channelReach: p.channelReach ?? 1, innerBlend: p.innerBlend ?? 0.35 };
}
export function validateSignet(raw) {
  if (!raw || raw.type !== 'signet' || (raw.geometryVersion !== undefined && raw.geometryVersion !== 2)) return false;
  const p = normalizeSignet(raw);
  return Object.entries(signetLimits).every(([key,[min,max]]) => Number.isFinite(p[key]) && p[key]>=min && p[key]<=max)
    && p.innerRounding<=p.thickness*0.45 && p.hollowWall<=maxHollowWall(p)
    && (raw.faceLength === undefined || (Number.isFinite(raw.faceLength) && raw.faceLength>=4 && raw.faceLength<=30)) && validateMotif(p.motif,p);
}
const smooth = t => t*t*(3-2*t);
export function signetSection(p) {
  return {width:p.width,thickness:p.thickness,flatness:4,comfort:p.innerRounding/p.thickness};
}
function bodyParameters(p) {
  const R=p.diameter/2, B=R+p.thickness, H=R+p.headThickness;
  const half=p.width/2;
  const mid=half/(1-((R+p.innerRounding)/B)**2)**0.25;
  const edge=Math.min(0.12+0.48*p.edgeSoftness, p.headThickness*0.22);
  const face=p.faceWidth/2,circleZ=H-edge;
  // Match a convex quadratic shoulder to the circular edge roundover.
  // Its slope is zero at the lower shank, then steadily tapers toward the
  // head; flattening that slope again would produce an inward waist.
  let lo=-Math.PI/2+0.001,hi=Math.PI/2-0.001;
  for(let i=0;i<48;i++) {
    const angle=(lo+hi)/2,join=circleZ+edge*Math.sin(angle),radius=face+edge*Math.cos(angle);
    if(Math.tan(angle)*join-2*(B-radius)>0) hi=angle; else lo=angle;
  }
  const rollAngle=(lo+hi)/2,join=circleZ+edge*Math.sin(rollAngle),joinRadius=face+edge*Math.cos(rollAngle);
  return {R,B,H,half,mid,edge,join,face,circleZ,rollAngle,joinRadius};
}
function upperSection(p,b,z) {
  if (z>=b.join) {
    const dz=Math.min(b.edge,Math.max(-b.edge,z-b.circleZ));
    const radius=b.face+Math.sqrt(Math.max(0,b.edge*b.edge-dz*dz));
    return {z,a:radius,b:radius,n:2};
  }
  const t=z/b.join, s=smooth(t), u=smooth(t**(1.8-0.8*p.shoulderFullness));
  const belly=p.faceWidth*(0.04+0.1*p.shoulderFullness)*16*t*t*(1-t)*(1-t);
  const nominal=b.B+(b.joinRadius-b.B)*t*t;
  // Even a very small head must wrap around the circular finger passage.
  // A smooth lower envelope prevents the loft from cutting across the bore.
  const support=b.R+Math.min(p.thickness,p.headThickness)*0.6;
  const floor=Math.sqrt(Math.max(0,support*support-z*z));
  const blend=0.08*Math.min(p.thickness,p.headThickness);
  const a=Math.max(nominal,floor)+Math.max(0,blend-Math.abs(nominal-floor))**2/(4*blend);
  return {z,a,
    b:b.mid+(b.joinRadius-b.mid)*u+belly,n:4-2*s};
}
// A closed loft with shared seam vertices and explicit cap fans. The top ring
// is an actual circle; there is no radial influence field to distort its rim.
function loft(sections, count, bottomPoint = null) {
  const vertices=[],triangles=[];
  if (bottomPoint) vertices.push(bottomPoint);
  const starts=[];
  for (const section of sections) {
    starts.push(vertices.length);
    for(let j=0;j<count;j++) {
      const angle=j*2*Math.PI/count,c=Math.cos(angle),s=Math.sin(angle);
      vertices.push([section.a*c,section.b*Math.sign(s)*Math.abs(s)**(2/section.n),section.z]);
    }
  }
  if (bottomPoint) for(let j=0;j<count;j++) triangles.push([0,starts[0]+(j+1)%count,starts[0]+j]);
  else {
    const i=vertices.length; vertices.push([0,0,sections[0].z]);
    for(let j=0;j<count;j++) triangles.push([i,starts[0]+(j+1)%count,starts[0]+j]);
  }
  for(let k=0;k<starts.length-1;k++) for(let j=0;j<count;j++) {
    const a=starts[k]+j,b=starts[k]+(j+1)%count,c=starts[k+1]+j,d=starts[k+1]+(j+1)%count;
    triangles.push([a,b,c],[b,d,c]);
  }
  const top=vertices.length; vertices.push([0,0,sections.at(-1).z]);
  for(let j=0;j<count;j++) triangles.push([top,starts.at(-1)+j,starts.at(-1)+(j+1)%count]);
  return {vertices,triangles};
}
function asSolid(mesh, api) {
  const m=new api.Mesh({numProp:3,vertProperties:new Float32Array(mesh.vertices.flat()),triVerts:new Uint32Array(mesh.triangles.flat())});
  const solid=new api.Manifold(m);
  if(solid.status()!=='NoError') { solid.delete(); throw new Error('Ringens overflade kunne ikke dannes.'); }
  return solid;
}
function outerMesh(p,b,count,layers) {
  const sections=[];
  for(let i=1;i<=layers;i++) {
    const t=i/layers*Math.PI/2;
    sections.push({z:-b.B*Math.cos(t),a:b.B*Math.sin(t),b:b.mid*Math.sqrt(Math.sin(t)),n:4});
  }
  for(let i=1;i<=layers;i++) sections.push(upperSection(p,b,b.join*i/layers));
  for(let i=1;i<=12;i++) {
    const t=b.rollAngle+(Math.PI/2-b.rollAngle)*i/12;
    sections.push({z:b.circleZ+b.edge*Math.sin(t),a:b.face+b.edge*Math.cos(t),b:b.face+b.edge*Math.cos(t),n:2});
  }
  return loft(sections,count,[0,0,-b.B]);
}
function cavitySection(p,b,z) {
  const s=upperSection(p,b,z),wall=p.hollowWall;
  const dz=0.001,slope=(upperSection(p,b,s.z+dz).a-upperSection(p,b,Math.max(0,s.z-dz)).a)/(s.z<dz?dz:2*dz);
  const t=Math.min(1,s.z/b.join);
  const reinforcement=Math.max(0,b.B-b.joinRadius)*2*t*t*(1-t)*(1-t);
  return {...s,a:s.a-wall*Math.sqrt(1+slope*slope)-reinforcement,b:s.b-wall};
}
function cavityMesh(p,b,count,layers) {
  const sections=[],wall=p.hollowWall,end=-b.R*(0.75+0.23*p.channelReach);
  const a=b.B-wall, width=b.mid-wall;
  for(let i=1;i<=layers;i++) {
    const t=i/layers*Math.PI/2;
    sections.push({z:end*Math.cos(t),a:a*Math.sin(t),b:width*Math.sqrt(Math.sin(t)),n:4});
  }
  // An open underside joins the bore and continues as two inside channels.
  // The cavity closes above the lower strap, rather than continuing around it.
  const roof=b.H-wall;
  for(let i=1;i<=layers;i++) {
    sections.push(cavitySection(p,b,roof*i/layers));
  }
  return loft(sections,count,[0,0,end]);
}
// Round only the upper bore/cavity junction. Each polar section contains a
// circular arc tangent to the cylindrical bore and the analytic cavity wall.
// Lofting these arcs gives a tangent surface, without moving either source
// surface or clamping interpolated points back onto the finger diameter.
export function tangentRoundover(wallY,rb,radius,samples=24) {
  const slope=x=>(wallY(x+.0001)-wallY(x-.0001))/.0002;
  let lo=rb,hi=rb+2*radius;
  for(let k=0;k<35;k++) {
    const x=(lo+hi)/2,d=slope(x);
    if(x-radius*d/Math.hypot(1,d)>rb+radius)hi=x;else lo=x;
  }
  const end=(lo+hi)/2,d=slope(end),cy=wallY(end)+radius/Math.hypot(1,d),cr=rb+radius;
  let angle=Math.atan2(wallY(end)-cy,end-cr);if(angle<Math.PI)angle+=2*Math.PI;
  const points=[];
  for(let j=0;j<=samples;j++) {
    const a=Math.PI+(angle-Math.PI)*j/samples;
    points.push([cr+radius*Math.cos(a),cy+radius*Math.sin(a)]);
  }
  return {points,center:[cr,cy],radius};
}
export function signetOpeningArc(raw,theta) {
  const p=normalizeSignet(raw),b=bodyParameters(p),rb=b.R+p.innerRounding,roof=b.H-p.hollowWall;
  const co=Math.cos(theta),si=Math.sin(theta);
  const wallY=r=>{
    const z=r*si;if(z>roof)return NaN;
    const s=cavitySection(p,b,z),u=r*co/s.a;
    return Math.abs(u)<1?s.b*Math.pow(1-u*u,1/s.n):0;
  };
  const y0=wallY(rb);
  if(!Number.isFinite(y0)||y0<=b.half)return null;
  const fade=smooth(Math.max(0,Math.min(1,(y0-b.half)/.8)))*smooth(Math.max(0,Math.min(1,rb*si/2)));
  const wanted=p.innerBlend*Math.min(.6,p.hollowWall*.6)*fade;
  const clearance=Math.max(0,(roof/Math.max(si,1e-10)-rb)*.45);
  const radius=Math.pow(wanted**-8+clearance**-8,-1/8);
  if(radius<.0002)return null;
  const arc=tangentRoundover(wallY,rb,radius),end=arc.points.at(-1);
  const overlap=Math.min(.025,Math.max(0,(roof/Math.max(si,1e-10)-end[0])*.5));
  return {...arc,corner:[rb,y0],
    entry:[rb-.025,arc.points[0][1]+.025],
    exit:[end[0]+overlap,wallY(end[0]+overlap)-.025]};
}
function openingRoundover(p,count) {
  const vertices=[],triangles=[],weld=new Map(),rows=[];
  const index=point=>{
    const v=point.map(Math.fround),key=v.join(',');
    if(!weld.has(key)){weld.set(key,vertices.length);vertices.push(v);}
    return weld.get(key);
  };
  const triangle=(a,b,c)=>{if(a!==b&&b!==c&&a!==c)triangles.push([a,b,c]);};
  for(let i=0;i<=count/2;i++) {
    const theta=Math.PI*i/(count/2),co=Math.cos(theta),si=Math.sin(theta);
    // Fade into the unmodified side channels before the comfort radius.
    const arc=signetOpeningArc(p,theta);if(!arc){rows.push(null);continue;}
    // Bury both ends inside their source cutters. Tangent-only contact with
    // an independently tessellated surface can leave microscopic tunnels.
    const points=[[arc.corner[0]-.025,0],arc.entry,...arc.points,arc.exit,[arc.exit[0],0]];
    rows.push(points.map(([x,y])=>index([x*co,y,x*si])));
  }
  for(let i=1;i<rows.length;i++) {
    const a=rows[i-1],c=rows[i];if(!a||!c)continue;
    for(let j=0;j<a.length;j++){const n=(j+1)%a.length;triangle(a[j],c[j],a[n]);triangle(a[n],c[j],c[n]);}
  }
  // The caps lie inside the cutters; they never become part of the ring.
  for(let i=0;i<rows.length;i++)if(rows[i]) {
    const row=rows[i];
    if(!rows[i-1])for(let j=1;j<row.length-1;j++)triangle(row[0],row[j],row[j+1]);
    if(!rows[i+1])for(let j=1;j<row.length-1;j++)triangle(row[0],row[j+1],row[j]);
  }
  return {vertices,triangles};
}
function boreMesh(p,b,count) {
  const sections=[],extent=Math.max(b.mid,b.face+b.edge)+p.faceWidth+2;
  const values=[-extent];
  // Use an ellipse for the inside edge comfort rounding; sampling in angle
  // resolves its near-vertical tangent without tiny, irregular triangles.
  for(let i=0;i<=48;i++) values.push(b.half*Math.sin(-Math.PI/2+i*Math.PI/48));
  values.push(extent);
  for(const y of values) {
    const u=Math.min(1,Math.abs(y)/b.half);
    const r=b.R+p.innerRounding*(1-Math.sqrt(Math.max(0,1-u*u)));
    sections.push({z:y,a:r,b:r,n:2});
  }
  const mesh=loft(sections,count);
  // Rotate the cutter's Z axis to Y, keeping orientation right-handed.
  mesh.vertices=mesh.vertices.map(([x,y,z])=>[x,-z,y]);
  return mesh;
}
export function signetMesh(raw,scale=1,segments=384,samples=128) {
  if(!validateSignet(raw)||!Number.isFinite(scale)||scale<=0) throw new Error('Ugyldige mål til signetringen.');
  const p=normalizeSignet(raw),b=bodyParameters(p),api=solidAPI();
  const count=Math.max(192,Math.round(segments/4)*4),layers=Math.max(80,Math.round(samples));
  const solids=[];
  try {
    const body=asSolid(outerMesh(p,b,count,layers),api);solids.push(body);
    const bore=asSolid(boreMesh(p,b,count),api);solids.push(bore);
    const cavity=asSolid(cavityMesh(p,b,count,layers),api);solids.push(cavity);
    const united=bore.add(cavity);solids.push(united);
    let cutter=united;
    if(p.innerBlend>0) {
      const patch=openingRoundover(p,count);
      if(patch.triangles.length) {
        const front=asSolid(patch,api);solids.push(front);
        const back=front.mirror([0,1,0]);solids.push(back);
        const both=front.add(back);solids.push(both);
        cutter=united.add(both);solids.push(cutter);
      }
    }
    const blank=body.subtract(cutter);solids.push(blank);
    const decorated=applyMotif(blank,p,b.H,solids);
    // Rebuild from the actual export precision. Two distinct double precision
    // intersections can become identical Float32 vertices on a very wide head.
    // Weld exact duplicates and let the solid kernel remove collapsed faces.
    const output=decorated.getMesh(),positions=[],indices=[],weld=new Map(),remap=[];
    for(let i=0;i<output.vertProperties.length;i+=output.numProp) {
      const v=Array.from(output.vertProperties.subarray(i,i+3)),key=v.join(',');
      if(!weld.has(key)){weld.set(key,positions.length/3);positions.push(...v);}
      remap.push(weld.get(key));
    }
    for(let i=0;i<output.triVerts.length;i+=3) {
      const t=Array.from(output.triVerts.subarray(i,i+3),v=>remap[v]);
      if(new Set(t).size===3)indices.push(...t);
    }
    // Collapse only adjacent sub-micron slivers. Bounding every cluster in a
    // 0.0001 mm box prevents a chain of short edges from drifting the surface.
    const parent=Array.from({length:positions.length/3},(_,i)=>i);
    const bounds=parent.map(i=>positions.slice(i*3,i*3+3).flatMap(v=>[v,v]));
    const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++) {
      const a=root(indices[i+j]),c=root(indices[i+(j+1)%3]);if(a===c)continue;
      const box=bounds[a].map((v,k)=>k%2?Math.max(v,bounds[c][k]):Math.min(v,bounds[c][k]));
      if([0,2,4].every(k=>box[k+1]-box[k]<=.0001)){const lo=Math.min(a,c),hi=Math.max(a,c);parent[hi]=lo;bounds[lo]=box;}
    }
    const clean=[];
    for(let i=0;i<indices.length;i+=3){const t=indices.slice(i,i+3).map(root);if(new Set(t).size===3)clean.push(...t);}
    const result=new api.Manifold(new api.Mesh({numProp:3,vertProperties:new Float32Array(positions),triVerts:new Uint32Array(clean)}));solids.push(result);
    if(result.status()!=='NoError'||result.isEmpty()) throw new Error('Udhulingen kunne ikke dannes med disse mål.');
    const parts=result.decompose(),partCount=parts.length; parts.forEach(part=>part.delete());
    if(partCount!==1||result.genus()!==1) throw new Error('Målene giver ikke en sammenhængende ring. Justér fladens diameter eller højden over fingerhullet.');
    const mesh=result.getMesh(),vertices=[],triangles=[];
    for(let i=0;i<mesh.vertProperties.length;i+=mesh.numProp) vertices.push([mesh.vertProperties[i]*scale,mesh.vertProperties[i+1]*scale,(mesh.vertProperties[i+2]+b.B)*scale]);
    for(let i=0;i<mesh.triVerts.length;i+=3) triangles.push(Array.from(mesh.triVerts.subarray(i,i+3)));
    return {vertices,triangles};
  } finally { for(const solid of solids.reverse()) solid.delete(); }
}
export function signetSectionPoints(p,count=64) {
  const b=bodyParameters(p),points=[];
  for(let i=0;i<=count;i++) {
    const y=-b.half+i/count*2*b.half;
    const outer=b.B*Math.sqrt(1-(y/b.mid)**4)-b.R;
    points.push([y,outer]);
  }
  for(let i=count;i>=0;i--) {
    const y=-b.half+i/count*2*b.half,u=Math.min(1,Math.abs(y)/b.half);
    points.push([y,p.innerRounding*(1-Math.sqrt(1-u*u))]);
  }
  return points;
}
