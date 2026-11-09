import { solidAPI } from './solid.mjs';
import { validateMotif, applyMotif } from './motif.mjs';

// Round, capped loft reconstructed from the Fusion reference. Dimensions stay
// in mm; only the finished mesh receives the export allowance.
export const signetDefaults = {
  type: 'signet', geometryVersion: 3, diameter: 16.2, width: 3.2, thickness: 1.1,
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
  return { ...p, geometryVersion: 3, faceLength: p.faceWidth,
    hollowWall: p.hollowWall ?? Math.min(0.6,maxHollowWall(p)), channelReach: p.channelReach ?? 1, innerBlend: p.innerBlend ?? 0.35 };
}
export function validateSignet(raw) {
  if (!raw || raw.type !== 'signet' || (raw.geometryVersion !== undefined && ![2,3].includes(raw.geometryVersion))) return false;
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
  const mid=half/(1-(R/B)**2)**0.25;
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
  const properties=mesh.normals?mesh.vertices.flatMap((v,i)=>[...v,...mesh.normals[i]]):mesh.vertices.flat();
  const m=new api.Mesh({numProp:mesh.normals?6:3,vertProperties:new Float32Array(properties),triVerts:new Uint32Array(mesh.triangles.flat())});
  const solid=new api.Manifold(m);
  if(solid.status()!=='NoError') { solid.delete(); throw new Error('Ringens overflade kunne ikke dannes.'); }
  if(mesh.normals)return solid;
  // Carry source-surface normals through booleans. Sliver faces at tangent
  // intersections must not contribute new directions to the finished shading.
  try {return solid.calculateNormals(0,60);} finally {solid.delete();}
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
// side=1 rounds into a cavity; side=-1 rounds an exterior opening edge.
// Both meet the same cylindrical finger passage tangentially.
export function tangentRoundover(wallY,rb,radius,samples=24,side=1) {
  const slope=x=>(wallY(x+.0001)-wallY(x-.0001))/.0002;
  let lo=rb,hi=rb+2*radius;
  for(let k=0;k<35;k++) {
    const x=(lo+hi)/2,d=slope(x);
    if(x-side*radius*d/Math.hypot(1,d)>rb+radius)hi=x;else lo=x;
  }
  const end=(lo+hi)/2,d=slope(end),cy=wallY(end)+side*radius/Math.hypot(1,d),cr=rb+radius;
  let angle=Math.atan2(wallY(end)-cy,end-cr);if(side===1&&angle<Math.PI)angle+=2*Math.PI;
  const points=[];
  for(let j=0;j<=samples;j++) {
    const a=Math.PI+(angle-Math.PI)*j/samples;
    points.push([cr+radius*Math.cos(a),cy+radius*Math.sin(a)]);
  }
  return {points,center:[cr,cy],radius};
}
// Positive-Y intersection of a polar ray with the loft. The same section
// equations serve both ends of the channels, including below the shoulders.
function wallAt(p,b,r,theta,cavity=false) {
  const z=r*Math.sin(theta),x=r*Math.cos(theta);
  let section;
  if(z>=0) {
    if(z>(cavity?b.H-p.hollowWall:b.H))return 0;
    section=cavity?cavitySection(p,b,z):upperSection(p,b,z);
  } else {
    const end=cavity?-b.R*(.75+.23*p.channelReach):-b.B;
    if(z<=end)return 0;
    const t=Math.sqrt(Math.max(0,1-(z/end)**2));
    section={a:(b.B-(cavity?p.hollowWall:0))*t,
      b:(b.mid-(cavity?p.hollowWall:0))*Math.sqrt(t),n:4};
  }
  const u=x/section.a;
  return Math.abs(u)<1?section.b*(1-u*u)**(1/section.n):0;
}
const softMin=(...values)=>values.some(v=>v<=0)?0:values.reduce((s,v)=>s+v**-8,0)**(-1/8);
export function signetOpeningArc(raw,theta,edge='cavity') {
  const p=normalizeSignet(raw),b=bodyParameters(p),rb=b.R,outer=edge==='outer';
  const wallY=r=>wallAt(p,b,r,theta,!outer);
  const y0=wallY(rb),outside=wallAt(p,b,rb,theta),inside=wallAt(p,b,rb,theta,true);
  if(y0<=0)return null;
  // Reserve material between the two edge rounds. Fade the cavity round
  // smoothly where a channel closes against the cylindrical bore.
  const gap=outside-inside;
  const wanted=outer?p.innerRounding:p.innerBlend*Math.min(.6,p.hollowWall*.6)*smooth(Math.min(1,y0/.8));
  let lo=rb,hi=b.H+b.B;
  for(let i=0;i<40;i++){const r=(lo+hi)/2;if(wallY(r)>0)lo=r;else hi=r;}
  const radial=lo-rb;
  const radius=softMin(wanted,gap*.35,radial*.2,outer?p.thickness*.45:Infinity);
  if(radius<.0002)return null;
  const side=outer?-1:1,arc=tangentRoundover(wallY,rb,radius,24,side),end=arc.points.at(-1);
  const overlap=Math.min(.025,Math.max(0,(radial+rb-end[0])*.25));
  return {...arc,corner:[rb,y0],
    entry:[rb-.025,arc.points[0][1]+side*.025],
    exit:[end[0]+overlap,wallY(end[0]+overlap)-side*Math.min(.025,wallY(end[0]+overlap)*.25)]};
}
function openingRoundover(p,count,edge) {
  const vertices=[],triangles=[],normals=[],weld=new Map(),rows=[],arcs=[],outer=edge==='outer';
  const index=point=>{
    const v=point.map(Math.fround),key=v.join(',');
    if(!weld.has(key)){weld.set(key,vertices.length);vertices.push(v);normals.push([0,0,0]);}
    return weld.get(key);
  };
  const triangle=(a,b,c)=>{if(a!==b&&b!==c&&a!==c)triangles.push(outer?[a,c,b]:[a,b,c]);};
  const extent=p.faceWidth+p.width+p.diameter;
  for(let i=0;i<count;i++) {
    const theta=2*Math.PI*i/count,co=Math.cos(theta),si=Math.sin(theta);
    const arc=signetOpeningArc(p,theta,edge);arcs.push(arc);if(!arc){rows.push(null);continue;}
    // Ends overlap their source cutters; exterior patches close outside the
    // body, cavity patches close inside the hollowing cutter.
    const y=outer?extent:0;
    const points=[[arc.corner[0]-.025,y],arc.entry,...arc.points,arc.exit,[arc.exit[0],y]];
    rows.push(points.map(([r,y])=>index([r*co,y,r*si])));
  }
  // Differentiate the circular sweep, including its changing radius and
  // center. Closure polygons are buried in the cutters and must not influence
  // the normal at a visible arc's tangent endpoints.
  const step=2*Math.PI/count;
  for(let i=0;i<count;i++)if(arcs[i]) {
    const arc=arcs[i],prev=arcs[(i+count-1)%count]??arc,next=arcs[(i+1)%count]??arc;
    const dr=(next.center[0]-prev.center[0])/(2*step),dy=(next.center[1]-prev.center[1])/(2*step),ds=(next.radius-prev.radius)/(2*step);
    const co=Math.cos(i*step),si=Math.sin(i*step),row=rows[i];
    for(let j=0;j<arc.points.length;j++) {
      const [r,y]=arc.points[j],u=r-arc.center[0],v=y-arc.center[1],angular=-(u*dr+v*dy+arc.radius*ds)/r;
      const n=[-u*co+angular*si,-v,-u*si-angular*co],length=Math.hypot(...n)||1;
      normals[row[j+2]]=n.map(x=>x/length);
    }
    // Entry/exit corners have the matching endpoint direction; they are only
    // used to overlap the independently tessellated bore and loft cutters.
    normals[row[0]]=normals[row[1]]=normals[row[2]];
    normals[row.at(-1)]=normals[row.at(-2)]=normals[row.at(-3)];
  }
  for(let i=0;i<count;i++) {
    const a=rows[i],c=rows[(i+1)%count];if(!a||!c)continue;
    for(let j=0;j<a.length;j++){const n=(j+1)%a.length;triangle(a[j],c[j],a[n]);triangle(a[n],c[j],c[n]);}
  }
  for(let i=0;i<count;i++)if(rows[i]) {
    const row=rows[i];
    if(!rows[(i+count-1)%count])for(let j=1;j<row.length-1;j++)triangle(row[0],row[j],row[j+1]);
    if(!rows[(i+1)%count])for(let j=1;j<row.length-1;j++)triangle(row[0],row[j+1],row[j]);
  }
  return {vertices,triangles,normals};
}
function boreMesh(p,b,count) {
  const extent=Math.max(b.mid,b.face+b.edge)+p.faceWidth+2;
  const mesh=loft([-extent,extent].map(y=>({z:y,a:b.R,b:b.R,n:2})),count);
  mesh.vertices=mesh.vertices.map(([x,y,z])=>[x,-z,y]);
  return mesh;
}
// The worker owns this bounded native cache for its lifetime. Tests can release
// it explicitly. Allowance and all motif data are deliberately absent from keys.
const blankCache=new Map();
export function clearSignetCache(){for(const solid of blankCache.values())solid.delete();blankCache.clear();}
export function signetMesh(raw,scale=1,segments=384,samples=128,onProgress=()=>{}) {
  if(!validateSignet(raw)||!Number.isFinite(scale)||scale<=0) throw new Error('Ugyldige mål til signetringen.');
  const p=normalizeSignet(raw),b=bodyParameters(p),api=solidAPI();
  const count=Math.max(192,Math.round(segments/4)*4),layers=Math.max(80,Math.round(samples));
  const solids=[];
  try {
    const key=JSON.stringify([count,layers,...Object.keys(signetLimits).filter(k=>k!=='allowance').map(k=>p[k])]);
    let blank=blankCache.get(key);
    if(blank)onProgress('reuse');
    else {
      onProgress('shape');
      const body=asSolid(outerMesh(p,b,count,layers),api);solids.push(body);
      const bore=asSolid(boreMesh(p,b,count),api);solids.push(bore);
      onProgress('hollow');
      const cavity=asSolid(cavityMesh(p,b,count,layers),api);solids.push(cavity);
      const united=bore.add(cavity);solids.push(united);
      let cutter=united;
      for(const edge of ['outer','cavity']) {
        onProgress(edge==='outer'?'outer-edge':'inner-edge');
        const patch=openingRoundover(p,count,edge);
        if(patch.triangles.length) {
          const front=asSolid(patch,api);solids.push(front);
          // Mirror the explicit normal field together with its source mesh.
          // This avoids mixing transformed scalar properties with normals
          // recorded by calculateNormals on the other CSG inputs.
          const back=asSolid({vertices:patch.vertices.map(([x,y,z])=>[x,-y,z]),
            triangles:patch.triangles.map(([a,b,c])=>[a,c,b]),
            normals:patch.normals.map(([x,y,z])=>[x,-y,z])},api);solids.push(back);
          const both=front.add(back);solids.push(both);
          cutter=cutter.add(both);solids.push(cutter);
        }
      }
      blank=body.subtract(cutter);solids.push(blank);
      // Evaluate while the source solids are alive; retain only the finished
      // blank. Motif tools never modify this solid. Keep two resolutions.
      blank.getMesh();
      blankCache.set(key,blank);solids.pop();
      if(blankCache.size>2){const first=blankCache.keys().next().value;blankCache.get(first).delete();blankCache.delete(first);}
    }
    onProgress(p.motif?'motif':'surface');
    const decorated=applyMotif(blank,p,b.H,solids);
    // Rebuild from the actual export precision. Two distinct double precision
    // intersections can become identical Float32 vertices on a very wide head.
    // Weld exact duplicates and let the solid kernel remove collapsed faces.
    const output=decorated.getMesh(0),positions=[],indices=[],sources=[],weld=new Map(),remap=[];
    for(let i=0;i<output.vertProperties.length;i+=output.numProp) {
      const v=Array.from(output.vertProperties.subarray(i,i+3)),key=v.join(',');
      if(!weld.has(key)){weld.set(key,positions.length/3);positions.push(...v);}
      remap.push(weld.get(key));
    }
    for(let i=0;i<output.triVerts.length;i+=3) {
      const t=Array.from(output.triVerts.subarray(i,i+3),v=>remap[v]);
      if(t[0]!==t[1]&&t[1]!==t[2]&&t[2]!==t[0]){indices.push(...t);sources.push(i);}
    }
    // Collapse only adjacent sub-micron slivers. Bounding every cluster in a
    // 0.0001 mm box prevents a chain of short edges from drifting the surface.
    const parent=Array.from({length:positions.length/3},(_,i)=>i);
    const bounds=parent.map(i=>positions.slice(i*3,i*3+3).flatMap(v=>[v,v]));
    const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++) {
      const a=root(indices[i+j]),c=root(indices[i+(j+1)%3]);if(a===c)continue;
      const aa=bounds[a],cc=bounds[c];
      if(Math.max(aa[1],cc[1])-Math.min(aa[0],cc[0])>.0001 ||
         Math.max(aa[3],cc[3])-Math.min(aa[2],cc[2])>.0001 ||
         Math.max(aa[5],cc[5])-Math.min(aa[4],cc[4])>.0001)continue;
      const lo=Math.min(a,c),hi=Math.max(a,c);parent[hi]=lo;
      for(let k=0;k<6;k++)bounds[lo][k]=k%2?Math.max(aa[k],cc[k]):Math.min(aa[k],cc[k]);
    }
    // Preserve each source corner's normal while welding only positions.
    // Property seams are joined explicitly so the solid stays manifold.
    const clean=[],properties=[],mergeFromVert=[],mergeToVert=[],first=new Map();
    for(let i=0;i<indices.length;i+=3) {
      const roots=[root(indices[i]),root(indices[i+1]),root(indices[i+2])];
      if(roots[0]===roots[1]||roots[1]===roots[2]||roots[2]===roots[0])continue;
      for(let j=0;j<3;j++) {
        const position=roots[j],source=output.triVerts[sources[i/3]+j]*output.numProp,index=properties.length/6;
        properties.push(positions[position*3],positions[position*3+1],positions[position*3+2],
          output.vertProperties[source+3],output.vertProperties[source+4],output.vertProperties[source+5]);
        clean.push(index);
        if(first.has(position)){mergeFromVert.push(index);mergeToVert.push(first.get(position));}
        else first.set(position,index);
      }
    }
    onProgress('validate');
    const result=new api.Manifold(new api.Mesh({numProp:6,vertProperties:new Float32Array(properties),triVerts:new Uint32Array(clean),mergeFromVert:new Uint32Array(mergeFromVert),mergeToVert:new Uint32Array(mergeToVert)}));solids.push(result);
    if(result.status()!=='NoError'||result.isEmpty()) throw new Error('Udhulingen kunne ikke dannes med disse mål.');
    const parts=result.decompose(),partCount=parts.length; parts.forEach(part=>part.delete());
    if(partCount!==1||result.genus()!==1) throw new Error('Målene giver ikke en sammenhængende ring. Justér fladens diameter eller højden over fingerhullet.');
    const mesh=result.getMesh(0),vertices=[],triangles=[],normals=new Float32Array(mesh.triVerts.length*3),vertexMap=new Map(),vertexRemap=[];
    for(let i=0;i<mesh.vertProperties.length;i+=mesh.numProp) {
      const v=[mesh.vertProperties[i]*scale,mesh.vertProperties[i+1]*scale,(mesh.vertProperties[i+2]+b.B)*scale],key=v.join(',');
      if(!vertexMap.has(key)){vertexMap.set(key,vertices.length);vertices.push(v);}
      vertexRemap.push(vertexMap.get(key));
    }
    for(let i=0;i<mesh.triVerts.length;i+=3) {
      triangles.push(Array.from(mesh.triVerts.subarray(i,i+3),v=>vertexRemap[v]));
      for(let j=0;j<3;j++) {
        const k=mesh.triVerts[i+j]*mesh.numProp+3,x=mesh.vertProperties[k],y=mesh.vertProperties[k+1],z=mesh.vertProperties[k+2],length=Math.hypot(x,y,z)||1;
        normals.set([x/length,y/length,z/length],(i+j)*3);
      }
    }
    return {vertices,triangles,normals};
  } finally { for(const solid of solids.reverse()) solid.delete(); }
}
export function signetSectionPoints(p,count=64) {
  const b=bodyParameters(p),points=[],arc=signetOpeningArc(p,-Math.PI/2,'outer');
  const end=arc?.points.at(-1);
  const edgeY=end?end[1]:b.half;
  for(let i=0;i<=count;i++) {
    const y=-edgeY+i/count*2*edgeY;
    points.push([y,b.B*Math.sqrt(1-(y/b.mid)**4)-b.R]);
  }
  if(arc)for(const [r,y] of [...arc.points].reverse())points.push([y,r-b.R]);
  points.push([- (arc?arc.points[0][1]:b.half),0]);
  if(arc)for(const [r,y] of arc.points)points.push([-y,r-b.R]);
  return points;
}
