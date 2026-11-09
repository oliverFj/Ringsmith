import theme from '../design/design.json';
import { createComponent as component } from '../design/runtime/components.mjs';
import { createProjectFile, downloadFile } from '../design/runtime/files.mjs';
import { presets, validate, profile } from './ring.mjs';
import { signetDefaults, normalizeSignet, maxHollowWall, signetSection, signetSectionPoints } from './signet.mjs';
import { initializeSolid } from './solid.mjs';
import solidWasm from 'manifold-3d/manifold.wasm';
import workerSource from 'ringsmith:geometry-worker';
import {createGeometryClient} from './geometry-client.mjs';
import {parameterControl,validNumber} from './parameters.mjs';
import {createParameterField} from './parameter-field.mjs';
import { createViewer } from './viewer.mjs';
import { createMotifPanel } from './motif-panel.mjs';
import { validateMotif } from './motif.mjs';
import { createWeightPanel } from './weight-panel.mjs';
const root = document.querySelector('#app');
root.dataset.layout = 'fluid';
root.innerHTML = `<header class="topbar"><div class="identity"><span class="mark" aria-hidden="true">◎</span><div><h1>Ringsmith</h1><p>Et lille værksted til præcise ringe</p></div></div><div id="file-actions" class="actions"></div></header>
<div class="workspace"><aside class="settings ds-layout" data-layout="panel"><div class="section-heading"><span class="eyebrow">01 / DESIGN</span><h2>Form din ring</h2><p>Arbejd i smykkets færdige mål.</p></div><div id="ring-type"></div><section><h3 id="dimension-heading">Ringens mål <span>mm</span></h3><div id="dimensions" class="fields"></div></section><section id="face-settings" hidden><h3>Signetflade</h3><div id="face" class="fields"></div><p class="muted">Rund, plan flade med afrundet kant. Diameteren gælder den plane del.</p></section><section id="motif-settings" hidden><h3>Motiv på fladen</h3><div id="motif-controls"></div></section><section id="hollow-settings" hidden><h3>Udhuling</h3><div id="hollow" class="fields"></div><p class="muted">Åbent hulrum under toppen og to baner ned langs indersiden. Bunden af ringskinnen bevares massiv.</p></section><section id="shoulder-settings" hidden><h3>Skuldre og inderside</h3><div id="shoulders" class="fields"></div></section><section id="profile-settings"><h3>Profil</h3><div id="shape" class="fields"></div><p class="muted">Fladere yderside og afrundet inderside. Diameteren måles ved det smalleste sted i hullet.</p></section></aside>
<section class="stage" aria-label="Ringens udformning"><div class="stage-heading"><div><span class="eyebrow">DIT DESIGN</span><h2 id="ring-title"></h2></div><div id="view-actions"></div></div><div id="viewer" tabindex="0" role="img" aria-label="Drejelig 3D-ring. Træk for at dreje, rul for at zoome. Piletaster drejer, plus og minus zoomer."></div><p class="viewer-help" id="viewer-help">Træk for at dreje · Rul for at zoome</p><div class="stage-bottom"><div class="profile-card"><div><span class="eyebrow" id="profile-title">TVÆRSNIT</span><p>Yderside ↑</p></div><svg id="profile" viewBox="0 0 320 140" role="img" aria-label="Ringens tværsnit i korrekt størrelsesforhold"></svg><p class="muted">Afrundet mod fingeren ↓</p></div><div class="design-facts"><span class="eyebrow">FÆRDIGT SMYKKE</span><dl><div><dt>Indvendig omkreds</dt><dd id="circumference"></dd></div><div><dt id="outer-label">Udvendig diameter</dt><dd id="outer"></dd></div><div><dt>Volumen</dt><dd id="volume"></dd></div></dl></div></div></section>
<aside class="export-panel ds-layout" data-layout="panel"><span class="eyebrow">02 / FREMSTILLING</span><h2>Klar til støbning</h2><p>Tilføj tillægget, når designet er på plads.</p><div id="allowance"></div><div class="scale-note">Tillægget skalerer hele ringen ens i alle retninger. Dine designmål bevares.</div><section><h3>Mål ved eksport <span>mm</span></h3><dl class="export-dimensions" id="export-dimensions"></dl><p class="muted">Vises med 3 decimaler. Eksporten bruger de uafrundede mål.</p></section><div id="export-actions" class="export-actions"></div><p class="muted">3MF indeholder millimeter som enhed. Ved OBJ-import skal du vælge mm.</p><p class="prototype-note">Første udgave · kontrollér mål og profil i din slicer før produktion.</p></aside></div><footer><span>Lokalt værksted · fungerer offline</span><span id="status" role="status" aria-live="polite">Klar til at forme.</span></footer>`;
let state = { ...presets[0], type: 'band' }, dirty = false, viewer, lastType, motifPanel, motifValid=true;
const designs = { band: state, signet: { ...signetDefaults } };
let inputs = {},fieldControls={};
let formValid=true,geometryValid=false,exportBusy=false,previewRevision=0,requestedKey;
const exportButtons = [];
const fmt = (n, digits = 2) => n.toLocaleString('da-DK', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const $ = id => document.getElementById(id);
const weightPanel=createWeightPanel(theme);$('export-actions').before(weightPanel.node);
const calculation=document.createElement('div');
calculation.className='calculation-status';calculation.hidden=true;
calculation.setAttribute('role','status');calculation.setAttribute('aria-live','polite');
calculation.setAttribute('aria-atomic','true');
const activity=component(theme,'spinner',{label:'Forbereder beregning…',announce:false,variant:'small'});
const viewerFrame=document.createElement('div');viewerFrame.className='viewer-frame';
$('viewer').before(viewerFrame);viewerFrame.append($('viewer'),calculation);
calculation.append(activity);
let previewStage=null,exportStage=null;
const phaseLabels={initialize:'Starter beregningsværktøjet…',queued:'Venter på den igangværende beregning…',
  shape:'Beregner ringens grundform…',reuse:'Genbruger ringens grundform…',hollow:'Danner fingerhul, baner og udhuling…',
  'outer-edge':'Afrunder den ydre åbningskant…','inner-edge':'Afrunder kanter mod baner og hulrum…',
  motif:'Beregner motiv og samler overflader…',surface:'Samler ringens overflader…',
  validate:'Kontrollerer, at ringen hænger sammen…',normals:'Udglatter overfladens normals…',
  serialize:'Pakker eksportfilen…'};
function showCalculation() {
  const phase=exportBusy?exportStage:previewStage;
  calculation.hidden=!phase;
  activity.querySelector('.ds-spinner__label').textContent=phase?(exportBusy?'Eksport · ':'')+phaseLabels[phase]:'';
}
const notify = text => { $('status').textContent = text; };
function button(host, text, action, primary = false) {
  const el = component(theme, 'button', { text, variant: primary ? 'primary' : 'secondary' });
  el.addEventListener('click', action); $(host).append(el); return el;
}
function setValidity(valid) {
  formValid=valid;
  const ready=valid&&geometryValid&&!exportBusy&&(state.type!=='signet'||(motifValid&&(!motifPanel||motifPanel.valid())));
  exportButtons.forEach(b => b.disabled = !ready); saveButton.disabled = !ready;
}
const readInputs=()=>Object.fromEntries(Object.entries(inputs).map(([key,input])=>[key,parameterControl(state.type,key).read(input.valueAsNumber,state[key])]));
function invalidatePreview() {
  weightPanel.setVolume(null);
  previewStage=null;showCalculation();
  ++previewRevision;requestedKey=null;geometryValid=false;geometry.cancelPreview();
  $('viewer').setAttribute('aria-busy','false');$('volume').textContent='—';$('viewer-help').textContent='Kontrollér målene for at opdatere modellen.';
}
function field(host, key, label, hint = '') {
  const control=parameterControl(state.type,key),{min,step}=control;
  let max=control.max;
  if (key === 'innerRounding') max = Math.min(max, state.thickness * 0.45);
  if (key === 'hollowWall') max = maxHollowWall(state);
  const fieldControl=createParameterField(theme,{idPrefix:key,label,value:control.display(state[key]),min,max,step,hint,onInput:() => {
    dirty = true;
    const values=readInputs();
    fieldControls.innerRounding?.setBounds({max:Math.min(0.5,values.thickness*0.45)});
    fieldControls.hollowWall?.setBounds({max:maxHollowWall(values)});
    const valid = Object.values(inputs).every(validNumber);
    for (const el of Object.values(inputs)) el.setAttribute('aria-invalid', String(!validNumber(el)));
    if(!valid)invalidatePreview();
    setValidity(valid);
    if (!valid) { notify('Udfyld målene inden for felternes grænser.'); return; }
    state = { ...state, ...values };
    if (state.type === 'signet') state = normalizeSignet(state);
    motifPanel.refreshLimits();
    designs[state.type] = state;
    try { update(); notify('Designet er ændret.'); }
    catch (error) { setValidity(false); notify(error.message); }
  }});
  $(host).append(fieldControl.node);inputs[key]=fieldControl.number;fieldControls[key]=fieldControl;
}
const typeField = component(theme, 'field', {
  idPrefix: 'ring-type', label: 'Ringtype', hint: '',
  slots: { control: { tag: 'select', children: [['band','Almindelig ring'],['signet','Signetring']].map(([value,text]) => ({ tag:'option',attrs:{value},text })) } },
});
const typeSelect = typeField.querySelector('select');
typeSelect.value = state.type; $('ring-type').append(typeField);
typeSelect.addEventListener('change', () => {
  motifPanel.cancel(); motifValid=true;
  designs[state.type] = state;
  state = { ...designs[typeSelect.value] }; dirty = true;
  sync(); notify(state.type === 'signet' ? 'Signetring valgt.' : 'Almindelig ring valgt.');
});
function renderFields() {
  Object.values(fieldControls).forEach(control=>control.destroy());inputs = {};fieldControls={};
  for (const id of ['dimensions','shape','allowance','face','shoulders','hollow']) $(id).replaceChildren();
  const signet = state.type === 'signet';
  $('profile-settings').hidden = signet; $('face-settings').hidden = !signet; $('shoulder-settings').hidden = !signet; $('hollow-settings').hidden = !signet; $('motif-settings').hidden = !signet; $('inside-view').hidden = !signet; $('front-view').hidden = !signet; $('top-view').hidden = !signet;
  $('dimension-heading').innerHTML = `${signet ? 'Ringskinne og størrelse' : 'Ringens mål'} <span>mm</span>`;
  field('dimensions', 'diameter', 'Indvendig diameter · mm', 'Måles ved hullets smalleste sted.');
  field('dimensions', 'width', signet ? 'Bredde nederst · mm' : 'Bredde · mm');
  field('dimensions', 'thickness', signet ? 'Tykkelse nederst · mm' : 'Maksimal tykkelse · mm');
  if (signet) {
    field('face', 'faceWidth', 'Fladens diameter · mm', 'Den plane, runde del inden kantafrundingen.');
    field('face', 'headThickness', 'Højde over fingerhullet · mm', 'Fra fingerhullets top til den plane flade.');
    field('face', 'edgeSoftness', 'Kantens runding · %', '0 % er skarpest · 100 % er blødest. Formindstilling, ikke en radius.');
    field('hollow', 'hollowWall', 'Gods ved udhuling · mm', 'Tykkelse under fladens midte og vægafstand i skuldrene.');
    field('hollow', 'channelReach', 'Banernes længde · %', '0 % er kortest · 100 % går længst ned mod bunden.');
    field('shoulders', 'shoulderFullness', 'Skuldrenes fylde · %', '0 % er slankest · 100 % er fyldigst.');
    field('shoulders', 'innerRounding', 'Ydre åbningskant · mm', 'Afrunder kanten hele vejen rundt om fingerhullet. Begrænses lokalt af godstykkelsen.');
    field('shoulders', 'innerBlend', 'Kant mod baner og hulrum · %', 'Afrunder overgangen fra fingerhullet til begge baner og udhulingen. 0 % er skarp.');
  } else {
    field('shape', 'flatness', 'Ydersidens fladhed · %', '0 % er rundest · 100 % er fladest.');
    field('shape', 'comfort', 'Indersidens runding · %', '0 % er svagest · 100 % er kraftigst.');
  }
  field('allowance', 'allowance', 'Støbetillæg · %');
}
const project = createProjectFile({ format: 'ringsmith.project', version: 1, validate: data => ({ valid: validate(data), errors: ['Projektet indeholder ugyldige ringmål eller en ukendt ringtype.'] }) });
button('file-actions', 'Åbn design', async () => {
  try {
    const opened = await project.open();
    if (!opened || (dirty && !confirm('Erstat det aktuelle design med filens indhold?'))) return;
    const converted = opened.data.type === 'signet' && opened.data.geometryVersion !== 3;
    state = opened.data.type === 'signet' ? normalizeSignet(opened.data) : { ...opened.data, type: 'band' };
    designs[state.type] = state; dirty = converted; sync();
    notify(converted ? 'Ældre signetdesign åbnet med cylindrisk fingerhul og lokal kantafrunding. Kontrollér afrundingen og gem som en ny designfil.' : 'Designet er åbnet.');
  } catch (e) { notify(e.message); }
});
const saveButton = button('file-actions', 'Gem design', () => {
  try { project.save(`${state.type === 'signet' ? 'signetring' : 'ring'}.ringsmith.json`, state); dirty = false; notify('Design sendt til downloads.'); } catch (e) { notify(e.message); }
});
button('view-actions', 'Nulstil visning', () => viewer?.reset());
const insideButton = button('view-actions', 'Se inderside', () => viewer?.inside()); insideButton.id = 'inside-view';
const frontButton = button('view-actions', 'Se forfra', () => viewer?.front()); frontButton.id = 'front-view';
const topButton = button('view-actions', 'Se flade', () => viewer?.top()); topButton.id = 'top-view';
for (const type of ['3mf', 'obj']) exportButtons.push(button('export-actions', `Eksportér .${type}`, async () => {
  const snapshot=structuredClone(state);exportBusy=true;exportStage='queued';showCalculation();setValidity(formValid);notify(`Forbereder .${type}-fil…`);
  try {
    const data = await geometry.export(snapshot,type,phase=>{exportStage=phase;showCalculation();});
    const name = snapshot.type === 'signet' ? 'signetring' : 'ring';
    downloadFile(`${name}-${snapshot.diameter}mm-plus-${snapshot.allowance}pct.${type}`, data, type === '3mf' ? 'model/3mf' : 'text/plain');
    notify(`.${type}-fil sendt til downloads med ${fmt(snapshot.allowance, 1)} % tillæg.`);
  } catch (e) { notify('Eksport mislykkedes: ' + e.message); }
  finally{exportBusy=false;exportStage=null;showCalculation();setValidity(formValid);}
}, type === '3mf'));
try { viewer = createViewer($('viewer')); } catch (e) { $('viewer').innerHTML = '<p class="viewer-error">3D-visningen kræver WebGL. Tværsnittet og eksporten fungerer stadig.</p>'; }
function sync() { typeSelect.value = state.type; renderFields(); motifValid=true; motifPanel.render(); setValidity(true); update(); }
function update() {
  const signet = state.type === 'signet';
  if(signet&&!validateMotif(state.motif,state)){invalidatePreview();throw new Error('Motivet går ud over fladen, eller graveringen er for dyb. Tilpas motivets mål.');}
  const scale = 1 + state.allowance / 100;
  const dimensions = signet ? [['diameter','Indvendig diameter'],['faceWidth','Fladens diameter'],['headThickness','Over fingerhullet'],['hollowWall','Gods ved udhuling'],['width','Bredde nederst'],['thickness','Tykkelse nederst']] : [['width','Bredde'],['thickness','Tykkelse'],['diameter','Indvendig diameter']];
  if(signet&&state.motif)dimensions.push(['motifSize','Motivets størrelse'],['motifDepth',state.motif.mode==='engrave'?'Graveringsdybde':'Reliefhøjde']);
  $('export-dimensions').innerHTML = dimensions.map(([key,label]) => `<div><dt>${label}</dt><dd>${fmt((key==='motifSize'?state.motif.size:key==='motifDepth'?state.motif.depth:state[key]) * scale, 3)}</dd></div>`).join('');
  $('circumference').textContent = fmt(state.diameter * Math.PI) + ' mm';
  $('outer-label').textContent = signet ? 'Samlet højde' : 'Udvendig diameter';
  $('outer').textContent = fmt(signet ? state.diameter + state.thickness + state.headThickness + (state.motif?.mode==='relief'?state.motif.depth:0) : state.diameter + 2*state.thickness) + ' mm';
  $('ring-title').textContent = signet ? `Signetring · ${fmt(state.diameter)} mm` : `${fmt(state.width)} mm · ${fmt(state.diameter)} mm`;
  $('profile-title').textContent = signet ? 'TVÆRSNIT · NEDERST' : 'TVÆRSNIT';
  const section = signet ? signetSection(state) : state;
  const s = Math.min(250 / section.width, 72 / section.thickness), points = signet ? signetSectionPoints(state) : profile(section);
  const d = points.map(([x,y], i) => `${i ? 'L' : 'M'}${160+x*s},${70+(section.thickness/2-y)*s}`).join(' ') + 'Z';
  $('profile').innerHTML = `<path d="${d}" fill="#dbb566" stroke="#80602d" stroke-width="1.5"/><path d="M35 125 H285" stroke="#b3a78e"/><text x="160" y="138" text-anchor="middle" fill="currentColor" font-size="11">${fmt(section.width)} mm</text>`;
  motifPanel.draw();
  const key=JSON.stringify({...state,allowance:0});
  if(key===requestedKey)return;
  invalidatePreview();requestedKey=key;
  const revision=previewRevision,snapshot=state;
  $('volume').textContent='Beregner…';$('viewer').setAttribute('aria-busy','true');setValidity(formValid);
  weightPanel.setVolume(null,'Beregner ringens volumen…');
  $('viewer-help').textContent='Opdaterer modellen… Du kan fortsætte med at ændre målene.';
  geometry.preview(snapshot,phase=>{
    if(revision!==previewRevision)return;
    previewStage=phase;showCalculation();
  }).then(result=>{
    if(!result||revision!==previewRevision)return;
    const detail=signet&&snapshot.motif?{mode:snapshot.motif.mode,z:snapshot.diameter+snapshot.thickness+snapshot.headThickness+(snapshot.motif.mode==='relief'?snapshot.motif.depth:-snapshot.motif.depth)}:null;
    viewer?.update(result.mesh,lastType!==snapshot.type,signet,detail);lastType=snapshot.type;
    previewStage=null;showCalculation();
    $('volume').textContent=fmt(result.volume,1)+' mm³';$('viewer').setAttribute('aria-busy','false');
    weightPanel.setVolume(result.volume);
    $('viewer-help').textContent='Træk for at dreje · Rul for at zoome';
    geometryValid=true;setValidity(formValid);notify('3D-modellen er opdateret.');
  }).catch(error=>{
    if(revision!==previewRevision)return;
    previewStage=null;showCalculation();
    requestedKey=null;$('volume').textContent='—';$('viewer').setAttribute('aria-busy','false');setValidity(false);notify(error.message);
    weightPanel.setVolume(null);
    $('viewer-help').textContent='Kontrollér målene for at opdatere modellen.';
  });
}
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
motifPanel=createMotifPanel({theme,host:$('motif-controls'),getState:()=>state,onStatus:notify,
  onValidity:valid=>{motifValid=valid;setValidity(Object.values(inputs).every(validNumber));},
  onCommit:motif=>{
    const before=state;state=normalizeSignet({...state,motif});
    try {
      update();designs.signet=state;dirty=true;motifValid=true;setValidity(Object.values(inputs).every(validNumber));return true;
    } catch(error){state=before;motifValid=false;setValidity(false);notify(error.message);return false;}
  },
});
const workerURL=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));
const geometry=createGeometryClient(new Worker(workerURL),solidWasm);
geometry.ready.then(()=>URL.revokeObjectURL(workerURL),()=>URL.revokeObjectURL(workerURL));
sync();

typeSelect.disabled = true;
notify('Forbereder ringværktøjet…');
Promise.all([initializeSolid(solidWasm),geometry.ready]).then(() => { typeSelect.disabled = false; }).catch(error => { notify('Ringværktøjet kunne ikke startes: '+error.message); });
