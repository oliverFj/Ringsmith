import {initializeSolid} from './solid.mjs';
import {ringMesh,volume} from './ring.mjs';
import {toOBJ,to3MF} from './export.mjs';

self.onmessage=async ({data:job})=>{
  try {
    if(job.kind==='initialize') {
      await initializeSolid(job.wasm);self.postMessage({kind:'ready'});return;
    }
    if(job.kind==='preview') {
      const signet=job.state.type==='signet';
      const mesh=ringMesh(job.state,1,signet?128:192,signet?96:128);
      self.postMessage({id:job.id,result:{mesh,volume:volume(mesh)}});
    }else {
      const mesh=ringMesh(job.state,1+job.state.allowance/100);
      const data=job.type==='3mf'?to3MF(mesh):toOBJ(mesh);
      self.postMessage({id:job.id,result:data},data instanceof Uint8Array?[data.buffer]:[]);
    }
  }catch(error){self.postMessage({id:job.id,error:error.message});}
};
