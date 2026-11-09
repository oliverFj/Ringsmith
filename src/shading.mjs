// Smooth connected corners across non-sharp edges. Every corner in a group
// gets the same angle-weighted normal, independent of its own face direction.
// No positional welding: nearby surfaces and actual hard edges stay separate.
export function creasedNormals(vertices,triangles,crease=Math.PI/3) {
  const count=triangles.length*3,parent=new Int32Array(count),faceNormals=new Float64Array(count),angles=new Float64Array(count);
  for(let i=0;i<count;i++)parent[i]=i;
  const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const join=(a,b)=>{a=root(a);b=root(b);if(a!==b)parent[b]=a;};
  for(let f=0;f<triangles.length;f++) {
    const t=triangles[f],a=vertices[t[0]],b=vertices[t[1]],c=vertices[t[2]];
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,length=Math.hypot(nx,ny,nz);
    faceNormals.set([nx/(length||1),ny/(length||1),nz/(length||1)],f*3);
    for(let j=0;j<3;j++) {
      const p=vertices[t[j]],q=vertices[t[(j+1)%3]],r=vertices[t[(j+2)%3]];
      const ex=q[0]-p[0],ey=q[1]-p[1],ez=q[2]-p[2],dx=r[0]-p[0],dy=r[1]-p[1],dz=r[2]-p[2];
      // atan2 remains stable for the very thin triangles left by boolean cuts.
      angles[f*3+j]=Math.atan2(length,ex*dx+ey*dy+ez*dz);
    }
  }
  const edges=new Map(),cos=Math.cos(crease),stride=vertices.length;
  const next=c=>c-c%3+(c%3+1)%3;
  for(let c=0;c<count;c++) {
    const f=Math.floor(c/3),a=triangles[f][c%3],b=triangles[f][(c%3+1)%3];
    const key=Math.min(a,b)*stride+Math.max(a,b),previous=edges.get(key);
    if(previous===undefined){edges.set(key,c);continue;}
    const other=Math.floor(previous/3)*3,k=f*3;
    if(faceNormals[k]*faceNormals[other]+faceNormals[k+1]*faceNormals[other+1]+faceNormals[k+2]*faceNormals[other+2]>cos) {
      const same=triangles[Math.floor(previous/3)][previous%3]===a;
      join(c,same?previous:next(previous));join(next(c),same?next(previous):previous);
    }
    edges.delete(key);
  }
  const sums=new Float64Array(count*3);
  for(let c=0;c<count;c++) {
    const r=root(c)*3,f=c-c%3,w=angles[c];
    sums[r]+=faceNormals[f]*w;sums[r+1]+=faceNormals[f+1]*w;sums[r+2]+=faceNormals[f+2]*w;
  }
  const result=new Float32Array(count*3);
  for(let c=0;c<count;c++) {
    const r=root(c)*3,length=Math.hypot(sums[r],sums[r+1],sums[r+2])||1;
    result[c*3]=sums[r]/length;result[c*3+1]=sums[r+1]/length;result[c*3+2]=sums[r+2]/length;
  }
  return result;
}
