import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildStamp } from '../design/tools/offline-checks.mjs';
import {TABLER_LICENSE} from '../design/runtime/icons.mjs';
import {SIGNATURE_LICENSE} from '../design/runtime/signature-assets.mjs';

export async function buildHTML(root) {
  const worker=await build({
    absWorkingDir:root,entryPoints:['src/geometry-worker.mjs'],bundle:true,write:false,
    format:'iife',target:'es2022',minify:true,legalComments:'none',metafile:true,external:['node:module'],
  });
  const bundle = await build({
    absWorkingDir: root,
    entryPoints: ['src/app.mjs'],
    bundle: true, write: false, format: 'iife', target: 'es2022',
    minify: true, legalComments: 'none', metafile: true,
    loader: { '.wasm': 'binary' }, external: ['node:module'],
    plugins:[{name:'embedded-worker',setup(builder){
      builder.onResolve({filter:/^ringsmith:geometry-worker$/},()=>({path:'geometry-worker',namespace:'embedded-worker'}));
      builder.onLoad({filter:/.*/,namespace:'embedded-worker'},()=>({contents:worker.outputFiles[0].text,loader:'text'}));
    }}],
  });
  const [template, themeCSS, appCSS, threeLicense, fflateLicense, manifoldLicense, ...fontLicenses] = await Promise.all([
    readFile(path.join(root, 'src/index.html'), 'utf8'),
    readFile(path.join(root, 'design/design.css'), 'utf8'),
    readFile(path.join(root, 'src/styles.css'), 'utf8'),
    readFile(path.join(root, 'node_modules/three/LICENSE'), 'utf8'),
    readFile(path.join(root, 'node_modules/fflate/LICENSE'), 'utf8'),
    readFile(path.join(root, 'node_modules/manifold-3d/LICENSE'), 'utf8'),
    ...['inter-OFL.txt','roboto-mono-OFL.txt','source-serif-4-OFL.txt'].map(file=>readFile(path.join(root,'design/assets',file),'utf8')),
  ]);
  const css = (themeCSS + '\n' + appCSS).replace(/<\/style/gi, '<\\/style');
  const script = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const stamp = await buildStamp(root, [...new Set([...Object.keys(bundle.metafile.inputs).filter(p=>!p.startsWith('embedded-worker:')),...Object.keys(worker.metafile.inputs)]), 'src/index.html', 'src/styles.css', 'design/design.css', 'package.json', 'tools/build.mjs', 'design/tools/offline-checks.mjs',...['inter-OFL.txt','roboto-mono-OFL.txt','source-serif-4-OFL.txt'].map(file=>'design/assets/'+file)]);
  return template
    .replace('</head>', () => stamp + '\n<script type="text/plain" id="tabler-license">'+TABLER_LICENSE+'\n\n'+SIGNATURE_LICENSE+'\n\nThree.js\n'+threeLicense+'\n\nfflate\n'+fflateLicense+'\n\nManifold (Copyright the Manifold Authors)\n'+manifoldLicense+'\n\nFonts\n'+fontLicenses.join('\n\n')+'</script>\n</head>')
    .replace('<link rel="stylesheet" href="./styles.css">', () => '<style>' + css + '</style>')
    .replace('<script type="module" src="./app.mjs"></script>', () => '<script>' + script + '</script>');
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await writeFile(path.join(root, 'index.html'), await buildHTML(root));
  console.log('Offlineprojekt bygget: index.html. Genindlæs browseren.');
}
