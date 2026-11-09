import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { creasedNormals } from './shading.mjs';
export function createViewer(host) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  host.append(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(36, 1, 0.1, 500);
  camera.up.set(0, 0, 1); camera.position.set(29, -37, 31);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 2); controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 22; controls.maxDistance = 120;
  const pmrem = new T.PMREMGenerator(renderer), room = new RoomEnvironment();
  const env = pmrem.fromScene(room); scene.environment = env.texture; room.dispose(); pmrem.dispose();
  const material = new T.MeshStandardMaterial({ color: 0xe8bd65, metalness: 1, roughness: 0.22 });
  // The signet never uses the band's analytic normal shader.
  const signetMaterial = material.clone();
  const bandEnabled={value:false},bandProfile={value:new T.Vector4()},bandFlatness={value:4};
  // Polished reflections expose interpolation errors even with exact vertex
  // normals. Evaluate the band's implicit profile per fragment; the signet
  // keeps its crease-aware normals and genuine sharp detail boundaries.
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,{bandEnabled,bandProfile,bandFlatness});
    shader.vertexShader='varying vec3 ringPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nringPosition = position;');
    shader.fragmentShader='varying vec3 ringPosition;\nuniform mat3 normalMatrix;\nuniform bool bandEnabled;\nuniform vec4 bandProfile;\nuniform float bandFlatness;\n'+shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
      if(bandEnabled) {
        float radius=length(ringPosition.xy);
        float offset=radius-bandProfile.x;
        float n=offset>=0.0?bandFlatness:2.0;
        float height=offset>=0.0?bandProfile.z:bandProfile.w;
        float axial=ringPosition.z-bandProfile.y;
        float gr=sign(offset)*pow(abs(offset)/height,n-1.0)/height;
        float gz=sign(axial)*pow(abs(axial)/bandProfile.y,n-1.0)/bandProfile.y;
        normal=normalize(normalMatrix*vec3(gr*ringPosition.xy/radius,gz));
        nonPerturbedNormal=normal;
      }`);
  };
  const ring = new T.Mesh(new T.BufferGeometry(), material); scene.add(ring);
  const grid = new T.GridHelper(90, 30, 0xc2bcae, 0xdcd6c9); grid.rotation.x = Math.PI / 2; grid.position.z = -0.1;
  grid.material.transparent = true; grid.material.opacity = 0.33; scene.add(grid);
  function resize() { const { width, height } = host.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  host.addEventListener('keydown', event => {
    const offset = camera.position.clone().sub(controls.target);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') offset.applyAxisAngle(new T.Vector3(0,0,1), event.key === 'ArrowLeft' ? -.1 : .1);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') offset.z += event.key === 'ArrowUp' ? 2 : -2;
    else if (event.key === '+' || event.key === '=') offset.multiplyScalar(.92);
    else if (event.key === '-') offset.multiplyScalar(1.08);
    else return;
    event.preventDefault(); camera.position.copy(controls.target).add(offset); controls.update();
  });
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
  let modelCenter = new T.Vector3(0, 0, 2), modelSize = 20;
  function reset() {
    camera.up.set(0,0,1);
    controls.target.copy(modelCenter);
    camera.position.copy(new T.Vector3(29,-37,31).normalize().multiplyScalar(modelSize*2.7).add(modelCenter));
    controls.update();
  }
  return {
    update(mesh, frame = false, keepCreases = false, detail = null) {
      ring.material=mesh.normalProfile?material:signetMaterial;
      bandEnabled.value=Boolean(mesh.normalProfile);
      if(mesh.normalProfile){bandProfile.value.fromArray(mesh.normalProfile);bandFlatness.value=mesh.normalProfile[4];}
      const geometry = new T.BufferGeometry();
      if (keepCreases) {
        const positions=new Float32Array(mesh.triangles.length*9);
        for(let f=0;f<mesh.triangles.length;f++)for(let j=0;j<3;j++)positions.set(mesh.vertices[mesh.triangles[f][j]],f*9+j*3);
        geometry.setAttribute('position',new T.BufferAttribute(positions,3));
        geometry.setAttribute('normal',new T.BufferAttribute(mesh.normals??creasedNormals(mesh.vertices,mesh.triangles),3));
      }
      else {
        geometry.setAttribute('position',new T.Float32BufferAttribute(mesh.vertices.flat(),3));geometry.setIndex(mesh.triangles.flat());
        if(mesh.normals)geometry.setAttribute('normal',new T.BufferAttribute(mesh.normals,3));
        else geometry.computeVertexNormals();
      }
      // Slightly shade the flat detail surface so shallow gold-on-gold work
      // remains legible under the environment light. Export geometry is untouched.
      if(detail) {
        const pos=geometry.attributes.position,colors=new Float32Array(pos.count*3);
        for(let i=0;i<pos.count;i++) {
          const value=Math.abs(pos.getZ(i)-detail.z)<1e-4?(detail.mode==='engrave'?.58:.76):1;
          colors.set([value,value,value],i*3);
        }
        geometry.setAttribute('color',new T.BufferAttribute(colors,3));
      }
      if(signetMaterial.vertexColors!==Boolean(detail)){signetMaterial.vertexColors=Boolean(detail);signetMaterial.needsUpdate=true;}
      geometry.computeBoundingBox(); geometry.boundingBox.getCenter(modelCenter);
      const size = geometry.boundingBox.getSize(new T.Vector3()); modelSize = Math.max(size.x, size.y, size.z);
      controls.minDistance = modelSize*0.8; controls.maxDistance = modelSize*6;
      ring.geometry.dispose(); ring.geometry = geometry;
      if (frame) reset();
    },
    reset,
    front() {
      camera.up.set(0,0,1);
      controls.target.copy(modelCenter);
      camera.position.copy(modelCenter).add(new T.Vector3(0,-modelSize*2.7,0));
      controls.update();
    },
    inside() {
      camera.up.set(0,0,1);
      controls.target.copy(modelCenter);
      camera.position.copy(new T.Vector3(25,-34,-13).normalize().multiplyScalar(modelSize*2.1).add(modelCenter));
      camera.position.z = Math.max(0.5,camera.position.z); controls.update();
    },
    top() {
      camera.up.set(0,1,0);controls.target.copy(modelCenter);
      camera.position.copy(modelCenter).add(new T.Vector3(0,0,modelSize*1.8));controls.update();
    },
  };
}
