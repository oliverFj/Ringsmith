import {createComponent,mountFileUpload} from '../design/runtime/components.mjs';
import {readMotif,rasterContours} from './motif-import.mjs';
import {motifContours,maxEngravingDepth} from './motif.mjs';
import {validNumber} from './parameters.mjs';
import {createParameterField} from './parameter-field.mjs';

export function createMotifPanel({theme,host,getState,onCommit,onValidity,onStatus}) {
  const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
  const upload=createComponent(theme,'file-upload',{idPrefix:'motif-file',label:'Vælg motivfil',hint:'SVG, PNG, JPG eller WebP · højst 2 MB. Filer behandles lokalt.',accept:'.svg,.png,.jpg,.jpeg,.webp',maxSize:2*1024*1024});
  const preview=el('div'),caption=el('p'),settings=el('div'),status=el('p');
  settings.className='fields';status.className='motif-status';status.setAttribute('role','status');preview.className='motif-preview';caption.className='muted';
  const note=el('p','Billeder omdannes til en sort/hvid silhuet. Brug SVG til fine detaljer; omdan tekst til kurver.');note.className='muted';
  host.append(upload,note,preview,caption,settings,status);
  let generation=0,fields={},fieldControls={},mode,area,depthLabel;
  const message=text=>{status.textContent=text;onStatus(text);};
  const fileControl=mountFileUpload(upload,{onChange:async (files,meta)=>{
    if(!files.length){if(meta.source==='remove'){++generation;if(onCommit(null)){render();message('Motivet er fjernet.');}}return;}
    const request=++generation,p=getState();onValidity(false);message('Indlæser motiv…');
    try {
      const motif=await readMotif(files[0],p);
      if(request!==generation||getState().type!=='signet')return;
      if(onCommit(motif)){render();message('Motivet er indlæst.');}else {render();message('Motivet kunne ikke placeres på fladen. Brug en enklere kontur.');}
    } catch(error){if(request===generation){render();message(error.message);}}
  },onInvalid:issues=>message(issues.map(i=>i.message).join(' '))});
  function numeric(key,label,min,max,step=key==='depth'?.01:key==='rotation'?1:.1,hint='') {
    const control=createParameterField(theme,{idPrefix:'motif-'+key,label,value:getState().motif[key],min,max,step,hint,onInput:edit});
    fields[key]=control.number;fieldControls[key]=control;settings.append(control.node);
    if(key==='depth')depthLabel=control.node.querySelector('label');
  }
  function select(label,values,value,key) {
    const field=createComponent(theme,'field',{idPrefix:'motif-'+key,label,hint:'',slots:{control:{tag:'select',children:values.map(([value,text])=>({tag:'option',attrs:{value},text}))}}});
    const input=field.querySelector('select');input.value=value;input.addEventListener('change',edit);settings.append(field);return input;
  }
  function draw() {
    preview.replaceChildren();const p=getState(),m=p.motif;if(!m){caption.textContent='Intet motiv valgt.';return;}
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),circle=document.createElementNS(ns,'circle'),path=document.createElementNS(ns,'path'),r=p.faceWidth/2;
    svg.setAttribute('viewBox',`${-r-.2} ${-r-.2} ${2*r+.4} ${2*r+.4}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Motivets placering på signetfladen');
    circle.setAttribute('r',r);circle.setAttribute('fill','#f6efe0');circle.setAttribute('stroke','#8b7347');circle.setAttribute('stroke-width',p.faceWidth*.012);
    const d=motifContours(m).map(loop=>loop.map(([x,y],i)=>`${i?'L':'M'}${x},${-y}`).join(' ')+'Z').join(' ');
    path.setAttribute('d',d);path.setAttribute('fill','#382f24');path.setAttribute('fill-rule','nonzero');svg.append(circle,path);preview.append(svg);caption.textContent=m.name;
  }
  async function edit() {
    const p=getState(),old=p.motif;if(!old)return;
    fieldControls.depth.setBounds({max:mode.value==='engrave'?maxEngravingDepth(p):2});
    depthLabel.textContent=mode.value==='engrave'?'Dybde · mm':'Højde · mm';
    const valid=Object.values(fields).every(validNumber);
    for(const input of Object.values(fields))input.setAttribute('aria-invalid',String(!validNumber(input)));
    if(!valid){onValidity(false);message('Kontrollér motivets mål. Gravering skal efterlade mindst 0,2 mm gods under motivet.');return;}
    const motif={...old,...Object.fromEntries(Object.entries(fields).map(([k,input])=>[k,input.valueAsNumber])),mode:mode.value};
    const request=++generation;
    try {
      if(old.source==='raster') {
        motif.invert=area.value==='light';
        if(motif.threshold!==old.threshold||motif.invert!==old.invert){onValidity(false);message('Opdaterer konturen…');motif.contours=await rasterContours(old.sourceData,motif.threshold,motif.invert);}
      }
      if(request!==generation||getState().type!=='signet')return;
      if(onCommit(motif)){draw();message('Motivet er opdateret.');}else {onValidity(false);message('Motivet skal være inden for fladen og efterlade mindst 0,2 mm gods ved gravering.');}
    } catch(error){if(request===generation){onValidity(false);message(error.message);}}
  }
  function render() {
    ++generation;Object.values(fieldControls).forEach(control=>control.destroy());fields={};fieldControls={};settings.replaceChildren();status.textContent='';const p=getState(),m=p.motif;
    if(fileControl.files[0]&&fileControl.files[0].name!==m?.name)fileControl.clear();
    draw();if(!m){onValidity(true);return;}
    mode=select('Udførelse',[['engrave','Gravering · ind i fladen'],['relief','Relief · op fra fladen']],m.mode,'mode');
    numeric('size','Motivets størrelse · mm',.2,30,.1,'Den længste side. Motivets proportioner bevares.');
    numeric('depth',m.mode==='engrave'?'Dybde · mm':'Højde · mm',.02,m.mode==='engrave'?maxEngravingDepth(p):2);
    numeric('rotation','Rotation · grader',-180,180);
    numeric('offsetX','Placering på tværs · mm',-15,15);
    numeric('offsetY','Placering langs fingeren · mm',-15,15);
    if(m.source==='raster') {
      numeric('threshold','Sort/hvid-grænse',1,255,1);
      area=select('Motivområde',[['dark','Mørke områder'],['light','Lyse områder']],m.invert?'light':'dark','area');
    }
    const remove=createComponent(theme,'button',{text:'Fjern motiv',variant:'secondary'});
    remove.addEventListener('click',()=>{++generation;if(onCommit(null)){fileControl.clear();render();message('Motivet er fjernet.');}});settings.append(remove);onValidity(true);
  }
  return {render,draw,cancel(){++generation;},refreshLimits(){if(fields.depth&&mode)fieldControls.depth.setBounds({max:mode.value==='engrave'?maxEngravingDepth(getState()):2});},valid(){return Object.values(fields).every(validNumber);}};
}
