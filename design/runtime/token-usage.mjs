import {TOKEN_REFERENCE_PATTERN} from './contract.mjs';
import {GRAPHIC_TOKEN_DEFAULTS} from './graphic-tokens.mjs';

const references=value=>typeof value==='string'
  ? [...new Set([...value.matchAll(new RegExp(TOKEN_REFERENCE_PATTERN.source,'g'))].map(match=>match[1]))]
  : [];

/** Runtime recipe usage for an effective theme model; brand prose is not usage.
 * `via` lists aliases from the recipe's token towards the reported dependency.
 * One shortest alias path is retained per recipe and token, including cyclic drafts.
 */
export function tokenUsageReport(model,{compatibilityTokens=[]}={}){
  const compatibility=new Set(compatibilityTokens);
  const reports=new Map(Object.entries(model.tokens??{}).map(([id,token])=>[id,{
    id,status:'reference',compatibility:compatibility.has(id),direct:[],indirect:[],aliases:[],dependencies:references(token?.$value),
  }]));
  for(const [id,report]of reports)for(const dependency of report.dependencies)reports.get(dependency)?.aliases.push(id);

  function styles(values,location){
    for(const [property,value]of Object.entries(values??{}))for(const id of references(value)){
      reports.get(id)?.direct.push({...location,property});
    }
  }
  for(const [component,definition]of Object.entries(model.components??{})){
    for(const [part,definitionPart]of Object.entries(definition.parts??{}))styles(definitionPart.styles,{component,part,variant:null,state:null});
    for(const kind of ['variants','states'])for(const [id,treatment]of Object.entries(definition[kind]??{})){
      const location={component,part:'root',variant:kind==='variants'?id:null,state:kind==='states'?id:null};
      styles(treatment.styles,location);
      for(const [part,treatmentPart]of Object.entries(treatment.parts??{}))styles(treatmentPart.styles,{...location,part});
    }
  }
  for(const id of Object.keys(GRAPHIC_TOKEN_DEFAULTS)){
    reports.get(id)?.direct.push({component:'@graphics',part:'illustration',variant:null,state:null,property:id,domain:'graphics'});
  }

  for(const [origin,report]of reports){
    if(!report.direct.length)continue;
    const visited=new Set([origin]),queue=[{id:origin,path:[]}];
    for(let index=0;index<queue.length;index++){
      const {id,path}=queue[index];
      for(const dependency of reports.get(id)?.dependencies??[]){
        if(visited.has(dependency)||!reports.has(dependency))continue;
        visited.add(dependency);
        const via=[...path,id],target=reports.get(dependency);
        target.indirect.push(...report.direct.map(usage=>({...usage,via:[...via]})));
        queue.push({id:dependency,path:via});
      }
    }
  }
  for(const report of reports.values())report.status=report.direct.length||report.indirect.length?'active':report.compatibility?'compatibility':'reference';
  return Object.fromEntries(reports);
}
