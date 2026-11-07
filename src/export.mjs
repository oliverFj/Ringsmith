import { zipSync, strToU8 } from 'fflate';
// Boolean cuts create small but valid edges. Preserve them in the file;
// display rounding must not collapse faces in the exported solid.
const f = n => Number(n.toFixed(12)).toString();
export function toOBJ(mesh) {
  return '# Ringsmith\n# Coordinates in millimeters; import as mm\no Ring\n' + mesh.vertices.map(v => 'v ' + v.map(f).join(' ')).join('\n') + '\ns 1\n' + mesh.triangles.map(t => 'f ' + t.map(i => i + 1).join(' ')).join('\n') + '\n';
}
export function to3MF(mesh) {
  const model = '<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="da-DK" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">Ringsmith ring</metadata><resources><object id="1" type="model"><mesh><vertices>' + mesh.vertices.map(([x,y,z]) => `<vertex x="${f(x)}" y="${f(y)}" z="${f(z)}"/>`).join('') + '</vertices><triangles>' + mesh.triangles.map(([v1,v2,v3]) => `<triangle v1="${v1}" v2="${v2}" v3="${v3}"/>`).join('') + '</triangles></mesh></object></resources><build><item objectid="1"/></build></model>';
  return zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),
    '3D/3dmodel.model': strToU8(model),
  });
}
