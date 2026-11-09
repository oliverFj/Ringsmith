// Keep one calculation active and at most one waiting preview. Exports keep
// their own snapshot; older previews never replace newer form values.
export function createGeometryClient(worker,wasm) {
  let active,pending,serial=0,started=false,failed;
  const exports=[];
  let readyResolve,readyReject;
  const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
  function pump() {
    if(!started||active||failed)return;
    active=exports.shift()||pending;if(!active)return;
    if(active===pending)pending=null;
    const {resolve,reject,onProgress,...message}=active;
    onProgress?.('shape');worker.postMessage(message);
  }
  function fail(error) {
    failed=error;readyReject(error);active?.reject(error);pending?.reject(error);
    exports.forEach(job=>job.reject(error));active=pending=null;exports.length=0;
  }
  worker.onmessage=({data})=>{
    if(data.kind==='ready'){started=true;readyResolve();pump();return;}
    if(!started&&data.error){fail(new Error(data.error));return;}
    if(data.id!==active?.id)return;
    if(data.kind==='progress'){active.onProgress?.(data.stage);return;}
    const job=active;active=null;
    if(data.error)job.reject(new Error(data.error));else job.resolve(data.result);
    pump();
  };
  worker.onerror=()=>fail(new Error('3D-beregningen kunne ikke gennemføres. Genindlæs programmet.'));
  worker.postMessage({kind:'initialize',wasm});
  const request=(kind,state,type,onProgress)=>new Promise((resolve,reject)=>{
    if(failed){reject(failed);return;}
    const job={id:++serial,kind,state:structuredClone(state),type,resolve,reject,onProgress};
    if(kind==='preview'){pending?.resolve(null);pending=job;}else exports.push(job);
    onProgress?.(started?'queued':'initialize');pump();
  });
  return {ready,preview:(state,onProgress)=>request('preview',state,undefined,onProgress),export:(state,type,onProgress)=>request('export',state,type,onProgress),
    cancelPreview(){pending?.resolve(null);pending=null;}};
}
