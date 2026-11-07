import {createComponent,mountRangeField} from '../design/runtime/components.mjs';

export function createParameterField(theme,{step,onInput,...options}) {
  const node=createComponent(theme,'range-field',{...options,variant:'with-input',step:'any'});
  const number=node.querySelector('.ds-range-field__number'),range=node.querySelector('.ds-range-field__control');
  number.required=true;
  let controller;
  function mount() {
    // The shared controller accepts precise typed/saved values. Native controls
    // use the product's increments for dragging and arrow keys, independently
    // of that precision (e.g. 16.253 mm remains valid with 0.1 mm arrow steps).
    range.step='any';
    controller=mountRangeField(node,{onInput});
    controller.update({draft:number.value,error:''});
    range.step=number.step=String(step);
  }
  mount();
  return {node,number,range,
    setBounds({min=Number(number.min),max=Number(number.max)}) {
      if(!Number.isFinite(min)||!Number.isFinite(max)||min>max)return;
      if(Number(number.min)===min&&Number(number.max)===max)return;
      controller.destroy();
      number.min=range.min=String(min);number.max=range.max=String(max);
      mount();
    },
    destroy(){controller.destroy();},
  };
}
