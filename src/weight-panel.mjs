import {createComponent} from '../design/runtime/components.mjs';
import {materials,densityLimits,validDensity,weightInGrams} from './weight.mjs';

export function createWeightPanel(theme) {
  const node=createComponent(theme,'accordion',{idPrefix:'weight-tool',items:[{label:'Vægtberegner',content:[]}]});
  node.classList.add('weight-tool');
  const body=node.querySelector('.ds-accordion__body');
  const el=(tag,text,className)=>{const node=document.createElement(tag);node.textContent=text??'';if(className)node.className=className;return node;};
  const note=el('p','Anslået vægt af den færdige ring, inklusive motiv og udhuling. Uden støbetillæg, støbekanaler og efterbearbejdning.','muted');
  const volumeLabel=el('p','','weight-volume');
  const materialField=createComponent(theme,'field',{idPrefix:'weight-material',label:'Materiale',hint:'',slots:{control:{tag:'select',children:[
    ...materials.map(m=>({tag:'option',attrs:{value:m.id},text:m.label})),{tag:'option',attrs:{value:'custom'},text:'Egen legering'},
  ]}}});
  const select=materialField.querySelector('select');
  const densityField=createComponent(theme,'number-input',{idPrefix:'weight-density',label:'Vægtfylde · g/cm³',
    hint:'Brug standardværdien eller tallet fra dit støberi.',min:densityLimits.min,max:densityLimits.max,step:'any',value:materials[0].density});
  const input=densityField.querySelector('input'),error=densityField.querySelector('.ds-number-input__error');
  error.id='weight-density-error';
  const reset=createComponent(theme,'button',{text:'Brug standardværdi',variant:'tertiary',size:'small'});
  const source=el('p','','weight-source muted');
  const result=el('div','','weight-result');result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.setAttribute('aria-atomic','true');
  const resultLabel=el('p','Anslået vægt'),resultValue=el('p','—','weight-grams'),resultNote=el('p','','muted');
  result.append(resultLabel,resultValue,resultNote);
  const comparisonTitle=el('h4','Sammenlign materialer');
  const comparison=el('dl','','weight-comparison');comparison.setAttribute('aria-label','Anslået ringvægt i forskellige materialer');
  const legend=el('p','Vægtfylderne er eksempler på legeringer. Metallets blanding kan ændre vægten; en tilpasset værdi bruges også i sammenligningen.','muted');
  body.append(note,volumeLabel,materialField,result,densityField,reset,source,comparisonTitle,comparison,legend);
  let volume=null,waiting='Afventer ringens volumen.';
  const drafts=new Map();
  const fmt=(n,digits=2)=>n.toLocaleString('da-DK',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const grams=density=>{const value=weightInGrams(volume,density);return value===null?'—':fmt(value)+' g';};
  function render() {
    const material=materials.find(m=>m.id===select.value),density=input.valueAsNumber;
    const valid=validDensity(density)&&!input.validity.badInput;
    input.setAttribute('aria-invalid',String(!valid));
    input.setAttribute('aria-describedby',`weight-density-hint${valid?'':' weight-density-error'}`);
    densityField.dataset.variant=valid?'default':'invalid';
    error.textContent=valid?'':`Angiv en vægtfylde mellem ${fmt(densityLimits.min)} og ${fmt(densityLimits.max)} g/cm³.`;
    error.hidden=valid;
    reset.hidden=!material;reset.disabled=material?input.value===String(material.density):true;
    volumeLabel.textContent=volume===null?waiting:`Ringens volumen · ${fmt(volume,1)} mm³`;
    resultValue.textContent=grams(valid?density:NaN);
    resultNote.textContent=!valid?'Kontrollér vægtfylden.':volume===null?waiting:material?.label??'Egen legering';
    source.replaceChildren();
    if(material){
      source.append('Standardværdi: ');
      const link=createComponent(theme,'link',{text:material.source.label,href:material.source.url});link.target='_blank';link.rel='noopener noreferrer';source.append(link);
    }
    comparison.replaceChildren(...materials.map(m=>{
      const row=el('div'),label=el('dt',m.label),custom=drafts.has(m.id);
      const value=custom?Number(drafts.get(m.id)||NaN):m.density;
      if(custom&&value!==m.density)label.append(el('small','Tilpasset vægtfylde'));
      row.append(label,el('dd',grams(value)));return row;
    }));
  }
  function loadMaterial() {
    const material=materials.find(m=>m.id===select.value);
    input.value=drafts.get(select.value)??(material?String(material.density):'');render();
  }
  select.addEventListener('change',loadMaterial);
  input.addEventListener('input',()=>{drafts.set(select.value,input.value);render();});
  reset.addEventListener('click',()=>{drafts.delete(select.value);loadMaterial();});
  select.value=materials[0].id;loadMaterial();
  return {node,setVolume(value,message='Afventer gyldige ringmål.'){
    volume=Number.isFinite(value)&&value>0?value:null;waiting=message;render();
  }};
}
