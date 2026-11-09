import {test} from 'node:test';
import assert from 'node:assert/strict';
import {materials,validDensity,weightInGrams} from '../src/weight.mjs';

test('Finished volume in mm³ converts to grams without export allowance or rounding',()=>{
  assert.equal(weightInGrams(1000,10.4),10.4);
  assert.equal(weightInGrams(300,13.3),3.99);
  assert.equal(weightInGrams(0,10.4),0);
  assert.equal(weightInGrams(342.0769322978981,10.4),342.0769322978981*10.4/1000);
});
test('Invalid volume and density cannot produce a misleading weight',()=>{
  for(const volume of [null,undefined,NaN,Infinity,-1])assert.equal(weightInGrams(volume,10.4),null);
  for(const density of [null,undefined,NaN,Infinity,0,-1,31]){
    assert.equal(validDensity(density),false);assert.equal(weightInGrams(300,density),null);
  }
  assert.equal(new Set(materials.map(m=>m.id)).size,materials.length);
  assert.ok(materials.every(m=>validDensity(m.density)&&m.source.url.startsWith('https://')));
});
