/** Calculated component geometry at a 16px rem base. Not browser layout or font metrics. */
const EPSILON=.05;
const unknown=message=>{throw new Error(message);};
const finite=value=>Number.isFinite(value)?value:unknown('Ikke-endelig beregning.');
const quantity=(value,kind)=>({value:finite(value),kind});

function references(value,tokens,seen=new Set()){
 if(typeof value!=='string'&&typeof value!=='number')return unknown('Manglende længde eller tal.');
 const text=String(value);
 if(text.length>2000)return unknown('Udtrykket er for langt.');
 return text.replace(/\{([^}]+)\}/g,(_,id)=>{
  if(seen.has(id)||seen.size>=20||!Object.hasOwn(tokens,id))return unknown('Uafklaret token: '+id);
  return references(tokens[id],tokens,new Set([...seen,id]));
 });
}

// Only the arithmetic used by the library is supported. Unknown CSS stays unmeasurable.
function expression(value,tokens,{font=16,percent}={}){
 const input=references(value,tokens);let cursor=0,steps=0;
 const space=()=>{while(/\s/.test(input[cursor]??'')&&cursor<input.length)cursor++;};
 const take=character=>{space();if(input[cursor]===character){cursor++;return true;}return false;};
 const combine=(a,b,operator)=>{
  if(operator==='+'||operator==='-'){
   if(a.kind!==b.kind)return unknown('Uforenelige enheder.');
   return quantity(operator==='+'?a.value+b.value:a.value-b.value,a.kind);
  }
  if(operator==='*'){
   if(a.kind==='length'&&b.kind==='length')return unknown('To længder kan ikke multipliceres.');
   return quantity(a.value*b.value,a.kind==='length'||b.kind==='length'?'length':'number');
  }
  if(b.kind!=='number'||b.value===0)return unknown('Division kræver et tal forskelligt fra nul.');
  return quantity(a.value/b.value,a.kind);
 };
 function primary(depth){
  if(++steps>512||depth>20)return unknown('Udtrykket er for komplekst.');
  if(take('+'))return primary(depth+1);
  if(take('-')){const result=primary(depth+1);return quantity(-result.value,result.kind);}
  if(take('(')){const result=sum(depth+1);if(!take(')'))return unknown('Uafsluttet parentes.');return result;}
  space();
  const match=/^(\d*\.?\d+)(px|rem|em|%)?/.exec(input.slice(cursor));
  if(match){
   cursor+=match[0].length;const n=Number(match[1]),unit=match[2];
   if(!unit)return quantity(n,'number');
   if(unit==='%'&&!Number.isFinite(percent))return unknown('Procenten mangler et kendt grundmål.');
   return quantity(n*(unit==='rem'?16:unit==='em'?font:unit==='%'?percent/100:1),'length');
  }
  const name=/^(calc|max|min)\b/.exec(input.slice(cursor))?.[1];
  if(!name)return unknown('CSS-udtrykket kan ikke beregnes.');
  cursor+=name.length;if(!take('('))return unknown('Funktionsparentes mangler.');
  const values=[sum(depth+1)];
  while(take(',')){if(name==='calc'||values.length>=20)return unknown('Ugyldige funktionsargumenter.');values.push(sum(depth+1));}
  if(!take(')')||values.some(item=>item.kind!==values[0].kind))return unknown('Ugyldig funktion eller enheder.');
  return name==='calc'?values[0]:quantity(Math[name](...values.map(item=>item.value)),values[0].kind);
 }
 function product(depth){let result=primary(depth);for(;;){if(take('*'))result=combine(result,primary(depth),'*');else if(take('/'))result=combine(result,primary(depth),'/');else return result;}}
 function sum(depth){let result=product(depth);for(;;){if(take('+'))result=combine(result,product(depth),'+');else if(take('-'))result=combine(result,product(depth),'-');else return result;}}
 const result=sum(0);space();if(cursor!==input.length)return unknown('CSS-udtrykket er ikke fuldt understøttet.');return result;
}

function terms(value){
 const result=[];let start=0,depth=0;
 for(let i=0;i<value.length;i++){
  if(value[i]==='(')depth++;else if(value[i]===')')depth--;
  else if(/\s/.test(value[i])&&depth===0){if(i>start)result.push(value.slice(start,i));start=i+1;}
 }
 if(start<value.length)result.push(value.slice(start));return result;
}
function length(value,tokens,context){const result=expression(value,tokens,context);if(result.kind==='number'&&result.value!==0)return unknown('En længdeenhed mangler.');return result.value;}
function vertical(value,tokens,context,logical=false){
 const values=terms(references(value,tokens));
 if(!values.length||values.length>(logical?2:4))return unknown('Ukendt afstandssyntaks.');
 return [length(values[0],tokens,context),length((logical?values[1]:values[2])??values[0],tokens,context)];
}
function border(styles,tokens,context,horizontal=false){
 const width=value=>value==='none'||value==='hidden'?0:length(terms(references(value,tokens))[0],tokens,context);
 const sides=horizontal?['Left','Right']:['Top','Bottom'];let edges=[width(styles.border??'0'),width(styles.border??'0')];
 if(styles.borderWidth!==undefined){
  const values=terms(references(styles.borderWidth,tokens));if(!values.length||values.length>4)return unknown('Ukendt kantbredde.');
  edges=horizontal?[values[3]??values[1]??values[0],values[1]??values[0]].map(v=>length(v,tokens,context)):vertical(styles.borderWidth,tokens,context);
 }
 for(let i=0;i<2;i++){
  const key='border'+sides[i];
  if(styles[key]!==undefined)edges[i]=width(styles[key]);
  if(styles[key+'Width']!==undefined)edges[i]=length(styles[key+'Width'],tokens,context);
  if(['none','hidden'].includes(styles[key+'Style']??styles.borderStyle))edges[i]=0;
 }
 return edges;
}
function padding(styles,tokens,context){
 let [top,bottom]=vertical(styles.padding??'0',tokens,context);
 if(styles.paddingBlock!==undefined)[top,bottom]=vertical(styles.paddingBlock,tokens,context,true);
 top=length(styles.paddingTop??styles.paddingBlockStart??top+'px',tokens,context);
 bottom=length(styles.paddingBottom??styles.paddingBlockEnd??bottom+'px',tokens,context);
 if(top<0||bottom<0)return unknown('Negativ indvendig afstand.');return [top,bottom];
}
const part=(component,name,variant)=>({...component.parts?.[name]?.styles,...component.variants?.[variant]?.parts?.[name]?.styles});
function box(styles,tokens,{font:parentFont=16,line:parentLine=1.5,scale=1,content}={}){
 const font=styles.fontSize!==undefined&&styles.fontSize!=='inherit'?length(styles.fontSize,tokens,{font:parentFont}):parentFont;
 const line=styles.lineHeight!==undefined&&styles.lineHeight!=='inherit'?expression(styles.lineHeight,tokens,{font:font*scale}):quantity(parentLine,'number');
 const text=line.kind==='number'?font*scale*line.value:line.value;
 if(font<=0||text<=0)return unknown('Skriftstørrelse og linjehøjde skal være positive.');
 if(styles.boxSizing!==undefined&&!['border-box','content-box'].includes(styles.boxSizing))return unknown('Ukendt boksmodel.');
 const context={font:font*scale},edges=[...padding(styles,tokens,context),...border(styles,tokens,context)].reduce((a,b)=>a+b,0);
 const natural=(content??text)+edges,min=length(styles.minHeight??'0',tokens,context)+(styles.boxSizing==='border-box'?0:edges);
 const height=styles.height===undefined||styles.height==='auto'?Math.max(min,natural):Math.max(min,length(styles.height,tokens,context)+(styles.boxSizing==='border-box'?0:edges));
 return {height,natural,fits:height+EPSILON>=natural,font,line:line.kind==='number'?line.value:line.value/(font*scale)};
}

function desktopBox(component,rootPart,variant,styles,tokens,scale=1){
 const base=box(styles,tokens,{scale});
 const find=node=>node?.part===rootPart?node:(node?.children??[]).map(find).find(Boolean);
 const node=find(component.preview);
 if(['input','select'].includes(node?.tag))return base; // Native controls own their text and popup rendering.
 const children=(node?.children??[]).filter(child=>child.part&&component.parts?.[child.part]&&!child.attrs?.hidden);
 if(!children.length)return base;
 const measured=children.flatMap(child=>{
  const styles=part(component,child.part,variant);if(styles.display==='none')return [];
  const size=box(styles,tokens,{font:base.font,line:base.line,scale}),context={font:size.font*scale};
  let [before,after]=vertical(styles.margin??'0',tokens,context);
  if(styles.marginBlock!==undefined)[before,after]=vertical(styles.marginBlock,tokens,context,true);
  before=length(styles.marginTop??styles.marginBlockStart??before+'px',tokens,context);
  after=length(styles.marginBottom??styles.marginBlockEnd??after+'px',tokens,context);
  return [{height:size.height+before+after,fits:size.fits}];
 });
 if(!['flex','inline-flex'].includes(styles.display))return unknown('Tekstbørnenes layout kan ikke beregnes.');
 const column=['column','column-reverse'].includes(styles.flexDirection),gap=column?length(styles.gap??'0',tokens,{font:base.font*scale}):0;
 const content=column?measured.reduce((sum,child)=>sum+child.height,0)+Math.max(0,measured.length-1)*gap:Math.max(0,...measured.map(child=>child.height));
 const result=box(styles,tokens,{scale,content});result.fits&&=measured.every(child=>child.fits);return result;
}

/** Static design checks. A pass confirms supported numeric recipes, never rendered pixels. */
export function componentGeometryReport(model,resolved){
 const report=[],components=model?.components??{},tokens=resolved??{};
 const check=(metadata,measure)=>{
  try{const result=measure();report.push({...metadata,...result,status:result.passed?'pass':'warning',method:'calculated',referenceRootPx:16});}
  catch(error){report.push({...metadata,measured:null,status:'unmeasurable',details:error.message,method:'calculated',referenceRootPx:16});}
 };
 const control=(id,variant='desktop')=>({...components[id]?.parts.root.styles,...components[id]?.variants?.[variant]?.styles});
 if(components.switch){
  const component=components.switch;
  const states=[false,true].map(checked=>()=>{
   const track={...part(component,'track','default'),...(checked?component.states?.checked?.parts?.track?.styles:{})};
   const thumb={...part(component,'thumb','default'),...(checked?component.states?.checked?.parts?.thumb?.styles:{})};
   if(track.boxSizing!=='border-box'||thumb.transform&&thumb.transform!=='none')return unknown('Trackens boksmodel eller priktransform understøttes ikke af beregningen.');
   const [bt,bb]=border(track,tokens),[bl,br]=border(track,tokens,undefined,true),height=length(track.height,tokens),width=length(track.width,tokens),size=length(thumb.height,tokens),thumbWidth=length(thumb.width,tokens);
   const top=bt+length(thumb.top,tokens,{percent:height-bt-bb}),left=bl+length(thumb.left,tokens,{percent:width-bl-br});
   return {top,bottom:height-top-size,left,right:width-left-thumbWidth,bt,bb,bl,br,width,size};
  });
  check({id:'switch.centered',label:'Kontaktens lodrette centrering',component:'switch',variant:'default/checked',expected:0,unit:'px'},()=>{
   const values=states.map(read=>read()),difference=Math.max(...values.map(v=>Math.abs(v.top-v.bottom)));
   return {measured:difference,passed:difference<=EPSILON&&values.every(v=>v.top>=v.bt&&v.bottom>=v.bb),details:'Beregnet forskel mellem øvre og nedre afstand i fra- og tilstand.'};
  });
  check({id:'switch.end-stops',label:'Kontaktens vandrette endepositioner',component:'switch',variant:'default/checked',minimum:0,unit:'px'},()=>{
   const [off,on]=states.map(read=>read()),clearance=Math.min(off.left-off.bl,off.right-off.br,on.left-on.bl,on.right-on.br);
   return {measured:clearance,passed:clearance>=-EPSILON&&on.left>=off.left&&Math.abs(off.left-on.right)<=EPSILON,details:'Prikken skal ligge inden for tracken med symmetriske endestop.'};
  });
 }
 const desktop=[];
 for(const id of ['button','input','select','segmented-option'])if(components[id]?.variants?.desktop)desktop.push([id,id,()=>control(id)]);
 if(components.toolbar?.variants?.desktop)desktop.push(['toolbar-action','toolbar',()=>part(components.toolbar,'action','desktop')]);
 if(components.menubar)desktop.push(['menubar-item','menubar',()=>part(components.menubar,'item')]);
 if(components['menu-item'])desktop.push(['menu-item','menu-item',()=>control('menu-item','default')]);
 for(const id of ['field','choice-field'])if(components[id])for(const invalid of [false,true])desktop.push([id+(invalid?'-invalid':''),id,()=>{
  const native=id==='field'?'input':'select';
  return {...components[native]?.parts.root.styles,...part(components[id],'control'),...components[native]?.variants?.desktop?.styles,...(invalid?components[id].variants?.invalid?.parts?.control?.styles:{})};
 }]);
 for(const [id,component,read]of desktop)check({id:'desktop.'+id,label:'Desktop: '+(components[component]?.name??component)+(id.endsWith('-invalid')?' med fejl':''),component,variant:'desktop',expected:32,unit:'px'},()=>{
  const styles=read(),rootPart=id==='toolbar-action'?'action':id==='menubar-item'?'item':['field','choice-field'].includes(component)?'control':'root';
  const variant=components[component].variants?.desktop?'desktop':'default',normal=desktopBox(components[component],rootPart,variant,styles,tokens),large=desktopBox(components[component],rootPart,variant,styles,tokens,2);
  return {measured:normal.height,passed:Math.abs(normal.height-32)<=EPSILON&&normal.fits&&large.fits,details:'Én tekstlinje og deklarerede tekstbørn inklusive padding og kanter. Beregningen kontrollerer også plads til tekst ved 2× skriftstørrelse.'};
 });
 if(components.tree)for(const variant of ['default','desktop'])check({id:'tree.'+variant,label:'Trærække med metadata, badge og handling',component:'tree',variant,expected:32,unit:'px'},()=>{
  const component=components.tree,root=box({...component.parts.root.styles,...component.variants?.[variant]?.styles},tokens),context={font:root.font,line:root.line};
  const children=['toggle','label','meta','badge','action'].map(name=>box(part(component,name,variant),tokens,context));
  const row=box(part(component,'row',variant),tokens,{...context,content:Math.max(...children.map(child=>child.height))});
  return {measured:row.height,passed:Math.abs(row.height-32)<=EPSILON&&row.fits&&children.every(child=>child.fits),details:'Samlet rækkehøjde med indre klikflader, badge, linjehøjde og ydre kanter. Lange navne og ombrydning kræver browserkontrol.'};
 });
 for(const id of ['button','input','select','segmented-option','switch','checkbox','radio','action-button','tag'])if(components[id])check({id:'target.'+id,label:'Standardhøjde: '+(components[id].name??id),component:id,variant:'base',minimum:44,unit:'px'},()=>{
  const styles=components[id].parts.root.styles,height=length(styles.minHeight,tokens);
  return {measured:height,passed:height>=44-EPSILON,details:'Mindste deklarerede kontrolhøjde; dette bekræfter ikke bredden eller det konkrete produktforløb.'};
 });
 return report;
}
