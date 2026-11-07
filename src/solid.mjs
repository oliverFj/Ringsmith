import createModule from 'manifold-3d';
let api, initializing;
export function initializeSolid(wasmBinary) {
  // The offline IIFE has no import.meta URL. With embedded bytes, locateFile
  // supplies an unused name so Emscripten does not construct a relative URL.
  return initializing ??= createModule(wasmBinary ? { wasmBinary, locateFile: () => 'manifold.wasm' } : {}).then(module => {
    module.setup(); api = module; return module;
  });
}
export function solidAPI() {
  if (!api) throw new Error('Ringværktøjet er ikke klar endnu.');
  return api;
}
