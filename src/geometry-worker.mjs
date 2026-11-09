import {initializeSolid} from './solid.mjs';
import {ringMesh,volume} from './ring.mjs';
import {toOBJ,to3MF} from './export.mjs';
import {creasedNormals} from './shading.mjs';

self.onmessage=async ({data:job})=>{
  try {
    if(job.kind==='initialize') {
      await initializeSolid(job.wasm);self.postMessage({kind:'ready'});return;
    }
    const progress=stage=>self.postMessage({id:job.id,kind:'progress',stage});
    if(job.kind==='preview') {
      const signet=job.state.type==='signet';
      const mesh=ringMesh(job.state,1,signet?128:192,signet?96:128,progress);
      if(signet&&!mesh.normals){progress('normals');mesh.normals=creasedNormals(mesh.vertices,mesh.triangles);}
      self.postMessage({id:job.id,result:{mesh,volume:volume(mesh)}},mesh.normals?[mesh.normals.buffer]:[]);
    }else {
      const mesh=ringMesh(job.state,1+job.state.allowance/100,384,128,progress);
      progress('serialize');
      const data=job.type==='3mf'?to3MF(mesh):toOBJ(mesh);
      self.postMessage({id:job.id,result:data},data instanceof Uint8Array?[data.buffer]:[]);
    }
  }catch(error){self.postMessage({id:job.id,error:error.message});}
};
