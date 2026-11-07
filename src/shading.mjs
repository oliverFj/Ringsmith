// Angle weights make the reflection independent of how a boolean happens to
// triangulate a surface. Use shared mesh indices, never a spatial hash that
// merges nearby (but distinct) points on a small roundover.
export function creasedNormals(vertices,triangles,crease=Math.PI/3) {
  const faces=[],incident=Array.from({length:vertices.length},()=>[]);
  for(let f=0;f<triangles.length;f++) {
    const t=triangles[f],[a,b,c]=t.map(i=>vertices[i]);
    const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]);
    const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const length=Math.hypot(...cross),normal=cross.map(n=>n/(length||1));faces.push(normal);
    for(let j=0;j<3;j++) {
      const p=vertices[t[j]],q=vertices[t[(j+1)%3]],r=vertices[t[(j+2)%3]];
      const e=q.map((n,i)=>n-p[i]),d=r.map((n,i)=>n-p[i]);
      const angle=Math.acos(Math.max(-1,Math.min(1,e.reduce((s,n,i)=>s+n*d[i],0)/(Math.hypot(...e)*Math.hypot(...d)))));
      incident[t[j]].push({normal,angle});
    }
  }
  const result=new Float32Array(triangles.length*9),cos=Math.cos(crease);
  for(let f=0;f<triangles.length;f++)for(let j=0;j<3;j++) {
    const sum=[0,0,0],face=faces[f];
    for(const {normal,angle} of incident[triangles[f][j]])if(normal.reduce((s,n,i)=>s+n*face[i],0)>cos) {
      for(let k=0;k<3;k++)sum[k]+=normal[k]*angle;
    }
    const length=Math.hypot(...sum)||1;result.set(sum.map(n=>n/length),f*9+j*3);
  }
  return result;
}
