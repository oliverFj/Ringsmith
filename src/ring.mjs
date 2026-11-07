import { validateSignet, signetMesh } from './signet.mjs';
export const presets = [
  { name: 'Smal · 16,2 mm', diameter: 16.2, width: 4, thickness: 2, flatness: 4, comfort: 0.55, allowance: 2 },
  { name: 'Bred · 19,1 mm', diameter: 19.1, width: 5, thickness: 2, flatness: 4, comfort: 0.55, allowance: 2 },
];
export const limits = { diameter: [8, 35], width: [1, 15], thickness: [0.5, 5], flatness: [2, 6], comfort: [0.2, 0.8], allowance: [0, 15] };
export function validate(p) {
  if (p?.type === 'signet') return validateSignet(p);
  return !!p && (p.type === undefined || p.type === 'band') && Object.entries(limits).every(([key, [min, max]]) => Number.isFinite(p[key]) && p[key] >= min && p[key] <= max);
}
// Closed asymmetric superellipse: the lower ellipse rounds the finger-facing
// surface, while the upper exponent controls the flatter outer face.
export function profile(p, count = 128) {
  return Array.from({ length: count }, (_, j) => {
    const a = j / count * 2 * Math.PI, s = Math.sin(a), c = Math.cos(a);
    const n = c >= 0 ? p.flatness : 2;
    const x = p.width / 2 * Math.sign(s) * Math.abs(s) ** (2 / n);
    const y = p.thickness * p.comfort + (c >= 0 ? p.thickness * (1 - p.comfort) : -p.thickness * p.comfort) * Math.abs(c) ** (2 / n);
    return [x, y];
  });
}
export function ringMesh(p, scale = 1, segments = 384, samples = 128) {
  if (p?.type === 'signet') return signetMesh(p, scale, segments, samples);
  if (!validate(p) || !Number.isFinite(scale) || scale <= 0) throw new Error('Ugyldige ringmål.');
  const section = profile(p, samples), vertices = [], triangles = [];
  // Surface normals come from the profile's implicit superellipse, rather
  // than triangle areas. Flat profiles have very uneven sample spacing;
  // averaging their triangles creates visible bands in polished reflections.
  const sectionNormals=section.map((_,j)=>{
    const angle=j/samples*2*Math.PI,s=Math.sin(angle),c=Math.cos(angle);
    const n=c>=0?p.flatness:2,exponent=2-2/n;
    const radial=Math.sign(c)*Math.abs(c)**exponent/(p.thickness*(c>=0?1-p.comfort:p.comfort));
    const axial=Math.sign(s)*Math.abs(s)**exponent/(p.width/2),length=Math.hypot(radial,axial);
    return [radial/length,axial/length];
  });
  const normals=new Float32Array(segments*samples*3);
  for (let i = 0; i < segments; i++) {
    const a = i / segments * Math.PI * 2;
    for (let j=0;j<section.length;j++) {
      const [z,offset]=section[j],[radial,axial]=sectionNormals[j];
      const r = p.diameter / 2 + offset;
      vertices.push([r * Math.cos(a) * scale, r * Math.sin(a) * scale, (z + p.width / 2) * scale]);
      normals.set([radial*Math.cos(a),radial*Math.sin(a),axial],(i*samples+j)*3);
    }
  }
  for (let i = 0; i < segments; i++) for (let j = 0; j < samples; j++) {
    const a = i * samples + j, b = ((i + 1) % segments) * samples + j;
    const c = ((i + 1) % segments) * samples + (j + 1) % samples, d = i * samples + (j + 1) % samples;
    triangles.push([a, b, d], [b, c, d]);
  }
  const normalProfile=[p.diameter/2+p.thickness*p.comfort,p.width/2,p.thickness*(1-p.comfort),p.thickness*p.comfort].map(v=>v*scale);
  return { vertices, triangles, normals,normalProfile:[...normalProfile,p.flatness] };
}
export function volume(mesh) {
  let total = 0;
  for (const [i, j, k] of mesh.triangles) {
    const a = mesh.vertices[i], b = mesh.vertices[j], c = mesh.vertices[k];
    total += a[0] * (b[1]*c[2]-b[2]*c[1]) + a[1] * (b[2]*c[0]-b[0]*c[2]) + a[2] * (b[0]*c[1]-b[1]*c[0]);
  }
  return total / 6;
}
