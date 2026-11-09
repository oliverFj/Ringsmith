import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parameterControl,validNumber} from '../src/parameters.mjs';
import {createGeometryClient} from '../src/geometry-client.mjs';

test('Percentage controls cover the old shape ranges and preserve untouched saved precision',()=>{
  for(const [type,key,low,high,value] of [
    ['band','flatness',2,6,4],['band','comfort',.2,.8,.55],
    ['signet','edgeSoftness',.1,1,.35],['signet','innerBlend',0,1,.35],
  ]) {
    const c=parameterControl(type,key);
    assert.equal(c.display(low),0);assert.equal(c.display(high),100);
    assert.equal(c.read(0,value),low);assert.equal(c.read(100,value),high);
    assert.equal(c.read(c.display(value),value),value,'Unrelated edits do not round saved geometry');
    assert.equal(c.step,1);
  }
  assert.equal(parameterControl('band','diameter').step,.1);
  assert.equal(parameterControl('signet','hollowWall').step,.01);
  const input={valueAsNumber:16.253,min:'8',max:'35',validity:{badInput:false,stepMismatch:true}};
  assert.equal(validNumber(input),true,'Finer manually entered measurements stay usable');
  assert.equal(validNumber({...input,valueAsNumber:40}),false);
  assert.equal(validNumber({...input,valueAsNumber:NaN}),false);
});

function setup() {
  const messages=[],worker={postMessage:job=>messages.push(job)};
  const client=createGeometryClient(worker,new Uint8Array());
  worker.onmessage({data:{kind:'ready'}});
  return {client,messages,reply:(job,result)=>worker.onmessage({data:{id:job.id,result}}),
    progress:(job,stage)=>worker.onmessage({data:{id:job.id,kind:'progress',stage}})};
}

test('Progress keeps its job active and queued previews cannot complete it',async()=>{
  const {client,messages,reply,progress}=setup(),phases=[];
  const first=client.preview({diameter:16},stage=>phases.push(stage));
  const second=client.preview({diameter:17});
  progress(messages[1],'hollow');progress({id:999},'motif');
  assert.equal(messages.length,2,'Progress does not start the queued preview');
  assert.equal('onProgress' in messages[1],false,'Functions are never posted to the worker');
  reply(messages[1],{volume:1});assert.deepEqual(await first,{volume:1});
  progress(messages[1],'validate');
  reply(messages[2],{volume:2});await second;
  assert.deepEqual(phases,['queued','shape','hollow']);
});
test('Rapid changes keep only the newest waiting preview and do not mutate submitted snapshots',async()=>{
  const {client,messages,reply}=setup(),state={diameter:16.2};
  const first=client.preview(state);state.diameter=17;
  const obsolete=client.preview(state);state.diameter=18;
  const latest=client.preview(state);state.diameter=19;
  assert.equal(await obsolete,null);
  assert.equal(messages.length,2,'Only initialization and the active job have been sent');
  assert.equal(messages[1].state.diameter,16.2);
  reply(messages[1],{volume:1});assert.deepEqual(await first,{volume:1});
  assert.equal(messages[2].state.diameter,18);
  reply(messages[2],{volume:2});assert.deepEqual(await latest,{volume:2});
});
test('Exports use their click-time snapshot while a newer preview waits',async()=>{
  const {client,messages,reply}=setup();
  const first=client.preview({diameter:16});
  const state={diameter:17,allowance:2};
  const exported=client.export(state,'3mf');state.allowance=5;
  const latest=client.preview(state);
  reply(messages[1],{});await first;
  assert.equal(messages[2].kind,'export');assert.equal(messages[2].state.allowance,2);
  reply(messages[2],new Uint8Array([1,2]));assert.deepEqual(await exported,new Uint8Array([1,2]));
  assert.equal(messages[3].state.allowance,5);reply(messages[3],{});await latest;
});
test('Canceling an invalid draft discards its queued preview; worker failures reject pending work',async()=>{
  const {client,messages,reply}=setup();
  const first=client.preview({diameter:16}),queued=client.preview({diameter:17});
  client.cancelPreview();assert.equal(await queued,null);reply(messages[1],{});await first;
  assert.equal(messages.length,2);
  const worker={postMessage(){}};const failed=createGeometryClient(worker,new Uint8Array());
  const ready=assert.rejects(failed.ready,/could not initialize/);
  const pending=assert.rejects(failed.preview({diameter:16}),/could not initialize/);
  worker.onmessage({data:{error:'could not initialize'}});await Promise.all([ready,pending]);
});
