const modes=new Set(['none','single','multiple']);
const own=(object,key)=>Object.hasOwn(object,key);
const key=(value,name)=>{if(typeof value!=='string'||!value.trim()||value.length>200)throw new Error('Data table '+name+' must be a non-empty text ID.');return value;};
const label=(value,fallback)=>{const result=String(value??fallback??'');if(!result.trim())throw new Error('Data table labels must not be empty.');return result;};
const nodes=value=>value===undefined||value===null?[]:['string','number','boolean'].includes(typeof value)?[{tag:'span',text:String(value)}]:Array.isArray(value)?value:value&&typeof value==='object'&&(value.tag||value.component)?[value]:(()=>{throw new Error('Data table cells require text or declarative component content.');})();
const ids=(value,name)=>{if(!Array.isArray(value)||value.some(id=>typeof id!=='string')||new Set(value).size!==value.length)throw new Error('Data table '+name+' must contain unique text IDs.');return new Set(value);};
const sortValue=(value,columns)=>{
 if(value===null||value===undefined)return null;
 if(!value||!columns.has(value.columnId)||!['ascending','descending'].includes(value.direction))throw new Error('Data table sort requires a known columnId and ascending/descending direction.');
 return {columnId:value.columnId,direction:value.direction};
};

/** Native table anatomy. Product-owned values are escaped by the common renderer. */
export function normalizeDataTablePreview(preview,options,identifier){
 if(options.text!==undefined)throw new Error('Data table uses label/columns/rows rather than root text.');
 const sample=options.columns===undefined&&options.rows===undefined;
 const columns=options.columns??[{id:'name',label:'Navn',sortable:true},{id:'status',label:'Status',sortable:true}],rows=options.rows??[{id:'collection',label:'Samling',cells:{name:'Samling',status:'Kladde'},detail:'Supplerende oplysninger om samlingen.',actions:[{id:'open',label:'Åbn'}]},{id:'archive',label:'Arkiv',cells:{name:'Arkiv',status:'Klar'},actions:[{id:'open',label:'Åbn'}]}];
 if(!Array.isArray(columns)||!columns.length||columns.length>100||!Array.isArray(rows)||rows.length>5000)throw new Error('Data table requires 1–100 columns and at most 5000 rows.');
 const columnIds=new Set(),rowIds=new Set();
 for(const column of columns){if(!column||typeof column!=='object')throw new Error('Data table columns must be objects.');key(column.id,'column');if(columnIds.has(column.id))throw new Error('Data table column IDs must be unique.');columnIds.add(column.id);label(column.label);}
 for(const row of rows){if(!row||typeof row!=='object')throw new Error('Data table rows must be objects.');key(row.id,'row');if(rowIds.has(row.id))throw new Error('Data table row IDs must be unique.');rowIds.add(row.id);if(row.actions!==undefined&&!Array.isArray(row.actions))throw new Error('Data table row actions must be an array.');const actionIds=new Set();for(const action of row.actions??[]){key(action?.id,'action');label(action.label);if(actionIds.has(action.id))throw new Error('Data table action IDs must be unique within a row.');actionIds.add(action.id);}}
 const states=(Array.isArray(options.state)?options.state:[options.state]).filter(Boolean),selection=options.selection??(sample?'multiple':'none');
 if(!modes.has(selection))throw new Error('Unknown data table selection mode.');
 const selected=ids(options.selectedIds??(states.includes('selected')&&rows[0]?[rows[0].id]:[]),'selectedIds'),expanded=ids(options.expandedIds??[],'expandedIds'),sort=sortValue(options.sort,columnIds);
 if(selection==='single'&&selected.size>1)throw new Error('Single-selection data tables accept at most one selected ID.');
 if(selection==='none'&&selected.size)throw new Error('Data table selectedIds require an enabled selection mode.');
 const status=options.status??['loading','error','empty'].find(state=>states.includes(state))??(rows.length?'ready':'empty');
 if(!['ready','loading','error','empty'].includes(status))throw new Error('Unknown data table status.');
 const visible=status==='empty'?[]:rows,busy=status!=='ready'||Boolean(options.disabled),title=label(options.label,'Datatabel'),tools=rows.some(row=>row.detail!==undefined||row.actions?.length),count=columns.length+(selection==='none'?0:1)+(tools?1:0);
 const cellValue=(row,column)=>row.cells&&own(row.cells,column.id)?row.cells[column.id]:own(row,column.id)?row[column.id]:'';
 const rowLabel=row=>label(row.label,['string','number'].includes(typeof cellValue(row,columns[0]))?cellValue(row,columns[0]):row.id);
 const button=(text,attrs,disabled=false,extra={})=>({component:'button',options:{text,variant:'ghost',disabled,...extra,attrs}});
 const eligible=visible.filter(row=>!busy&&!row.disabled),chosen=eligible.filter(row=>selected.has(row.id)).length;
 const choose=(row,all=false)=>({tag:'label',part:'tools',children:[{tag:'input',part:'selection',attrs:{type:selection==='single'?'radio':'checkbox',...(selection==='single'?{name:identifier+'-selection'}:{}),...(all?{'data-select-all':'','aria-label':'Vælg alle synlige rækker','aria-checked':chosen&&chosen<eligible.length?'mixed':String(eligible.length>0&&chosen===eligible.length),checked:eligible.length>0&&chosen===eligible.length,disabled:busy||!eligible.length}:{'data-select-row':row.id,'aria-label':'Vælg '+rowLabel(row),'aria-checked':String(selected.has(row.id)),checked:selected.has(row.id),disabled:busy||Boolean(row.disabled)})}}]});
 const header={tag:'tr',part:'header-row',children:[...(selection!=='none'?[{tag:'th',part:'header',attrs:{scope:'col'},...(selection==='multiple'?{children:[choose(null,true)]}:{text:'Valg'})}]:[]),...columns.map(column=>({tag:'th',part:'header',attrs:{scope:'col','data-column-id':column.id,...(sort?.columnId===column.id?{'aria-sort':sort.direction}:{})},...(column.sortable?{children:[button(column.label+(sort?.columnId===column.id?(sort.direction==='ascending'?' ↑':' ↓'):' ↕'),{'data-table-sort':column.id,'data-sort-label':String(column.label),'aria-label':'Sortér efter '+column.label},busy)]}:{text:String(column.label)})})),...(tools?[{tag:'th',part:'header',attrs:{scope:'col'},text:'Handlinger'}]:[])]};
 const body=visible.flatMap((row,index)=>{
  const detailId=identifier+'-detail-'+index,disabled=busy||Boolean(row.disabled),description=rowLabel(row),hasDetail=row.detail!==undefined;
  return [{tag:'tr',part:'row',attrs:{'data-table-row':row.id,...(selected.has(row.id)?{'data-state':'selected'}:{})},children:[...(selection!=='none'?[{tag:'td',part:'cell',children:[choose(row)]}]:[]),...columns.map((column,columnIndex)=>({tag:column.rowHeader===true||(columnIndex===0&&column.rowHeader!==false)?'th':'td',part:'cell',attrs:{...(column.rowHeader===true||(columnIndex===0&&column.rowHeader!==false)?{scope:'row'}:{}),'data-cell-column':column.id},children:nodes(cellValue(row,column))})),...(tools?[{tag:'td',part:'cell',children:[{tag:'div',part:'tools',children:[...(hasDetail?[button('Detaljer',{'data-expand-row':row.id,'aria-label':'Vis detaljer for '+description,'aria-expanded':String(expanded.has(row.id)),'aria-controls':detailId},disabled)]:[]),...(row.actions??[]).map(action=>button(action.label,{'data-table-action':action.id,'data-action-row':row.id,'aria-label':action.label+' · '+description},disabled||Boolean(action.disabled),action.iconName?{iconName:action.iconName}:{}))]}]}]:[])]},...(hasDetail?[{tag:'tr',part:'detail-row',attrs:{id:detailId,'data-table-detail':row.id,...(!expanded.has(row.id)?{hidden:true}:{})},children:[{tag:'td',part:'detail',attrs:{colspan:String(count)},children:nodes(row.detail)}]}]:[])];
 });
 const feedback=status==='loading'?{component:'spinner',options:{label:options.message??'Indlæser rækker…'}}:status==='error'?{component:'alert',options:{variant:'danger',slots:{title:'Rækkerne kunne ikke indlæses',body:options.message??'Prøv igen, når forbindelsen er klar.'}}}:status==='empty'?{component:'empty-state',options:{title:'Ingen rækker',body:options.message??'Der er endnu ingen resultater at vise.'}}:null;
 return {tag:'div',part:'root',attrs:{'data-table':'','data-selection':selection,'data-selected-ids':JSON.stringify([...selected]),'data-expanded-ids':JSON.stringify([...expanded]),'aria-busy':String(status==='loading')},children:[
  {tag:'div',part:'viewport',attrs:{role:'region','aria-label':title+' · tabel, der kan rulles vandret',tabindex:'0'},children:[{tag:'table',part:'table',children:[{tag:'caption',part:'caption',text:title},{tag:'thead',part:'head',children:[header]},{tag:'tbody',part:'body',children:body}]}]},
  {tag:'p',part:'selection-summary',attrs:{role:'status','data-selection-summary':'',...(selection==='none'?{hidden:true}:{})},text:selected.size+' valgt'},
  {tag:'div',part:'status',children:feedback?[feedback]:[]},
  ...(options.pagination?[{tag:'div',part:'pagination',children:[{component:'pagination',options:options.pagination}]}]:[]),
 ]};
}

/** Enhance stable native table markup. Selection/expansion update in place.
 * Sorting requests product-owned ordering; update({sort}) commits aria-sort.
 */
export function mountDataTable(host,options={}){
 if(!host?.querySelectorAll)throw new Error('mountDataTable requires a DOM host.');
 const document=host.ownerDocument,listeners=[];
 let root,config={},selected=new Set(),expanded=new Set(),rows=[],sort=null,destroyed=false,initialized=false,lastFocus=null;
 const closest=node=>{for(let parent=node;parent;parent=parent.parentNode)if(parent.getAttribute?.('data-table')!==null&&parent.getAttribute?.('data-table')!==undefined)return parent;return null;};
 const query=attribute=>[...root.querySelectorAll('['+attribute+']')].filter(node=>closest(node)===root);
 const disabled=node=>node.disabled||node.getAttribute('disabled')!==null||node.getAttribute('aria-disabled')==='true';
 const check=(node,value,mixed=false)=>{node.checked=value;node.indeterminate=mixed;node.setAttribute('aria-checked',mixed?'mixed':String(value));if(value)node.setAttribute('checked','');else node.removeAttribute('checked');};
 function applySelection(){
  root.setAttribute('data-selected-ids',JSON.stringify([...selected]));
  const controls=query('data-select-row'),eligible=controls.filter(node=>!disabled(node));
  for(const node of controls)check(node,selected.has(node.getAttribute('data-select-row')));
  for(const row of rows){const states=(row.getAttribute('data-state')??'').split(/\s+/).filter(state=>state&&state!=='selected');if(selected.has(row.getAttribute('data-table-row')))states.push('selected');if(states.length)row.setAttribute('data-state',states.join(' '));else row.removeAttribute('data-state');}
  const chosen=eligible.filter(node=>selected.has(node.getAttribute('data-select-row'))).length;
  for(const node of query('data-select-all')){check(node,eligible.length>0&&chosen===eligible.length,chosen>0&&chosen<eligible.length);node.disabled=!eligible.length;if(eligible.length)node.removeAttribute('disabled');else node.setAttribute('disabled','');}
  for(const node of query('data-selection-summary')){const value=selected.size+' valgt';if(node.textContent!==value)node.textContent=value;}
 }
 function applyExpanded(){
  root.setAttribute('data-expanded-ids',JSON.stringify([...expanded]));
  const details=query('data-table-detail');
  for(const button of query('data-expand-row')){
   const id=button.getAttribute('data-expand-row'),matches=details.filter(node=>node.getAttribute('id')===button.getAttribute('aria-controls')&&node.getAttribute('data-table-detail')===id);
   if(matches.length!==1)throw new Error('Data table expansion requires one matching detail row and aria-controls.');
   const detail=matches[0],open=expanded.has(id);button.setAttribute('aria-expanded',String(open));detail.hidden=!open;if(open)detail.removeAttribute('hidden');else detail.setAttribute('hidden','');
   if(!open&&detail.contains(document?.activeElement))button.focus();
  }
 }
 function update(next={}){
  if(destroyed)throw new Error('Data table controller has been destroyed.');
  root=host.getAttribute?.('data-table')!==null&&host.getAttribute?.('data-table')!==undefined?host:host.querySelector('[data-table]');
  if(!root)throw new Error('Data table markup is missing.');
  const candidate={...config,...next},selection=root.getAttribute('data-selection');if(!modes.has(selection))throw new Error('Unknown data table selection mode.');
  rows=query('data-table-row');const rowIds=rows.map(row=>row.getAttribute('data-table-row'));if(new Set(rowIds).size!==rows.length)throw new Error('Data table row IDs must be unique.');
  const nextSelected=own(next,'selectedIds')?ids(next.selectedIds,'selectedIds'):initialized?selected:root.getAttribute('data-selected-ids')!==null?ids(JSON.parse(root.getAttribute('data-selected-ids')),'selectedIds'):new Set(query('data-select-row').filter(node=>node.checked||node.getAttribute('checked')!==null).map(node=>node.getAttribute('data-select-row')));
  if(selection==='single'&&nextSelected.size>1)throw new Error('Single-selection data tables accept at most one selected ID.');
  if(selection==='none'&&nextSelected.size)throw new Error('Data table selectedIds require an enabled selection mode.');
  const nextExpanded=own(next,'expandedIds')?ids(next.expandedIds,'expandedIds'):initialized?expanded:root.getAttribute('data-expanded-ids')!==null?ids(JSON.parse(root.getAttribute('data-expanded-ids')),'expandedIds'):new Set(query('data-expand-row').filter(node=>node.getAttribute('aria-expanded')==='true').map(node=>node.getAttribute('data-expand-row')));
  const headers=query('data-column-id'),columnIds=new Set(headers.map(node=>node.getAttribute('data-column-id')));
  const initialSort=headers.find(node=>['ascending','descending'].includes(node.getAttribute('aria-sort')));
  const nextSort=sortValue(own(next,'sort')?next.sort:initialized?sort:initialSort?{columnId:initialSort.getAttribute('data-column-id'),direction:initialSort.getAttribute('aria-sort')}:null,columnIds);
  config=candidate;selected=nextSelected;expanded=nextExpanded;sort=nextSort;initialized=true;
  applySelection();applyExpanded();
  for(const header of headers){if(header.getAttribute('data-column-id')===sort?.columnId)header.setAttribute('aria-sort',sort.direction);else header.removeAttribute('aria-sort');}
  for(const button of query('data-table-sort')){const active=button.getAttribute('data-table-sort')===sort?.columnId,heading=button.querySelector('.ds-button__heading'),value=button.getAttribute('data-sort-label')+(active?(sort.direction==='ascending'?' ↑':' ↓'):' ↕');if(heading)heading.textContent=value;}
  if(lastFocus&&(!document?.activeElement||document.activeElement===document.body)&&root.contains(lastFocus))lastFocus.focus();
  return controller;
 }
 const targetAt=(target,attribute)=>{for(let node=target;node&&node!==host.parentNode;node=node.parentNode)if(node.getAttribute?.(attribute)!==null&&node.getAttribute?.(attribute)!==undefined&&closest(node)===root)return node;return null;};
 const listen=(type,fn)=>{host.addEventListener(type,fn);listeners.push([type,fn]);};
 listen('focusin',event=>{if(closest(event.target)===root)lastFocus=event.target;});
 listen('focusout',event=>{if(event.relatedTarget&&!root.contains(event.relatedTarget))lastFocus=null;});
 listen('change',event=>{
  const row=targetAt(event.target,'data-select-row'),all=targetAt(event.target,'data-select-all'),node=row??all;if(!node)return;
  if(disabled(node)){applySelection();return;}
  const next=new Set(selected),selection=root.getAttribute('data-selection');
  if(all){for(const control of query('data-select-row').filter(control=>!disabled(control))){const id=control.getAttribute('data-select-row');if(all.checked)next.add(id);else next.delete(id);}}
  else{const id=row.getAttribute('data-select-row');if(selection==='single'){next.clear();if(row.checked)next.add(id);}else if(row.checked)next.add(id);else next.delete(id);}
  selected=next;applySelection();config.onSelectionChange?.([...selected],{rowId:row?.getAttribute('data-select-row')??null,all:Boolean(all),event});
 });
 listen('click',event=>{
  const sortButton=targetAt(event.target,'data-table-sort'),expandButton=targetAt(event.target,'data-expand-row'),action=targetAt(event.target,'data-table-action'),button=sortButton??expandButton??action;if(!button)return;
  if(disabled(button)){event.preventDefault();return;}
  if(sortButton){const columnId=sortButton.getAttribute('data-table-sort');config.onSort?.({columnId,direction:sort?.columnId===columnId&&sort.direction==='ascending'?'descending':'ascending'},{event});}
  else if(expandButton){const rowId=expandButton.getAttribute('data-expand-row');if(expanded.has(rowId))expanded.delete(rowId);else expanded.add(rowId);applyExpanded();config.onExpand?.([...expanded],{rowId,expanded:expanded.has(rowId),event});}
  else config.onAction?.(action.getAttribute('data-action-row'),action.getAttribute('data-table-action'),{event});
 });
 const controller={update,get selectedIds(){return [...selected];},get expandedIds(){return [...expanded];},get sort(){return sort?{...sort}:null;},destroy(){if(destroyed)return;destroyed=true;for(const [type,fn]of listeners)host.removeEventListener(type,fn);}};
 try{return update(options);}catch(error){controller.destroy();throw error;}
}
