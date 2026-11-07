/** Role-specific additions to Lysrum. The ten approved studies stay in lightroom.mjs. */
import {GRAPHIC_CATALOG_MOTIFS} from '../catalog.mjs';

const c=key=>`var(--g-${key})`;
const box=(x,y,w,h,role='plane',r=5,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c(role)}" ${extra}/>`;
const dot=(x,y,r=5,role='ink',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c(role)}" ${extra}/>`;
const path=(d,role='subject',extra='')=>`<path d="${d}" fill="${c(role)}" ${extra}/>`;
const stroke=(d,role='edge',width='var(--g-line-width)',extra='')=>`<path d="${d}" fill="none" stroke="${c(role)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const outline=(x,y,w,h,r=5,role='edge',extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${c(role)}" stroke-width="var(--g-line-width)" ${extra}/>`;
const ring=(x,y,r,role='edge',width='var(--g-line-width)',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c(role)}" stroke-width="${width}" ${extra}/>`;
const writing=(x,y,label,size=22,role='ink',extra='')=>`<text x="${x}" y="${y}" fill="${c(role)}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${label}</text>`;
const shade=body=>`<g fill="${c('depth')}" opacity="var(--g-depth-opacity)">${body}</g>`;
const check=(x,y,role='light',size=1)=>stroke(`M${x} ${y}l${7*size} ${8*size} ${16*size}-${19*size}`,role,3*size);
const cross=(x,y,size=7,role='edge')=>stroke(`M${x-size} ${y-size}l${size*2} ${size*2}m-${size*2} 0 ${size*2}-${size*2}`,role,1.8);
const chevron=(x,y,down=true)=>stroke(down?`M${x-6} ${y-3}l6 6 6-6`:`M${x-3} ${y-6}l6 6-6 6`,'ink',2);
const plus=(x,y,size=9,role='ink')=>stroke(`M${x-size} ${y}h${size*2}M${x} ${y-size}v${size*2}`,role,2.5);
const person=(x,y,role='light',scale=1)=>dot(x,y-17*scale,12*scale,role)+path(`M${x-24*scale} ${y+29*scale}a${24*scale} ${24*scale} 0 0 1 ${48*scale} 0v${4*scale}h-${48*scale}Z`,role);
const lines=(x,y,widths,gap=22,role='edge',weight=2)=>widths.map((w,i)=>stroke(`M${x} ${y+i*gap}h${w}`,role,weight)).join('');

function material(prefix){
  return `<defs><linearGradient id="${prefix}-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c('light')}"/><stop offset="1" stop-color="${c('context')}"/></linearGradient><radialGradient id="${prefix}-glow" cx=".45" cy=".38" r=".7"><stop stop-color="${c('light')}"/><stop offset=".68" stop-color="${c('subject')}"/><stop offset="1" stop-color="${c('counter')}"/></radialGradient></defs>`;
}
function ledge(prefix,x,y,w,h,r=7){
  return shade(`<rect x="${x+4}" y="${y+7}" width="${w}" height="${h}" rx="${r}"/>`)+`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${prefix}-wall)"/>`+box(x+10,y+10,w-20,h-20,'plane',Math.max(2,r-4))+outline(x,y,w,h,r)+stroke(`M${x+10} ${y+10}H${x+w-10}`,'light',1.8);
}
function well(x,y,w,h,r=5){
  return box(x,y,w,h,'context',r)+box(x+7,y+7,w-14,h-14,'ground',Math.max(1,r-3))+outline(x,y,w,h,r)+shade(`<path d="M${x+7} ${y+7}H${x+w-7}V${y+h-7}h-5V${y+12}H${x+7}Z"/>`);
}
const part=(key,name,purpose,body,motion='reveal',origin='300 210')=>({key,name,purpose,body,motion,origin});
const descriptions=Object.fromEntries(GRAPHIC_CATALOG_MOTIFS.map(item=>[item.id,item]));

function scene(motif,prefix,parts,extraDefs=''){
  const info=descriptions[motif];
  return {viewBox:'0 0 600 420',label:`${info.name}: ${info.meaning}`,parts:[{key:'ground',name:'Billedfelt',purpose:'Et roligt, selvstændigt underlag for motivet.'},...parts.map(({key,name,purpose})=>({key,name,purpose}))],
    body:material(prefix)+extraDefs+`<g data-lightroom-catalog="${motif}"><g data-part="ground">${box(0,0,600,420,'ground',0)}</g>`+parts.map(p=>`<g data-part="${p.key}" data-lightroom-motion="${p.motion}" data-lightroom-origin="${p.origin}">${p.body}</g>`).join('')+'</g>'};
}

const scenes={
  'list-item':p=>[
    part('collection','Samlingens rum','En samlet niche holder tre poster på samme lodrette akse.',ledge(p,121,58,358,304,10),'rise'),
    part('neighbors','Øvrige poster','Naboposter har hver sin titel og en tilbagetrukket beskrivelse.',stroke('M153 102h195M153 129h240M153 289h183M153 316h220','edge',2.5)+stroke('M140 152h320M140 268h320','edge',1),'draw'),
    part('current','Aktuel post','En farvet indlægning og lys kant fremhæver præcis én post.',well(137,169,326,79,5)+box(144,176,312,65,'subject',3)+stroke('M145 177v62','light',3),'light','300 210'),
    part('content','Titel og beskrivelse','To linjer med forskellig vægt holder navn og forklaring sammen.',stroke('M163 196h223','light',3.5)+stroke('M163 222h180','light',1.7),'draw')
  ],
  combobox:p=>[
    part('entry','Søgefelt','Skrivning afgrænser de synlige muligheder.',ledge(p,118,70,364,70)+stroke('M144 102h132','ink',3)+stroke('M282 90v25','subject',2)+chevron(451,104),'rise'),
    part('choices','Filtrerede muligheder','En udtrukket niche viser en kort liste, ikke en ny side.',ledge(p,126,156,348,184)+lines(161,194,[210,183,220],54),'rise'),
    part('match','Valgt resultat','En fremhævet række og flueben viser ét accepteret resultat.',box(139,220,322,41,'subject',4)+check(158,240)+stroke('M205 240h202','light',2.5),'light','300 240')
  ],
  multiselect:p=>[
    part('selection-room','Valgrum','Flere valgte værdier har plads i samme felt.',ledge(p,103,76,394,100),'rise'),
    part('chosen-values','Valgte værdier','To selvstændige mærkater viser flere samtidige valg.',box(123,101,133,47,'subject',23)+box(267,101,144,47,'counter',23)+stroke('M139 125h65M284 125h76','light',2.5)+cross(235,125,5,'light')+cross(390,125,5,'light'),'light'),
    part('more-options','Muligheder','Feltets åbning giver adgang til flere uafhængige tilvalg.',ledge(p,123,195,354,141)+well(143,216,25,25)+well(143,269,25,25)+lines(188,230,[226,192],53)+box(146,272,19,19,'subject',2)+check(149,281,'light',.5),'rise')
  ],
  'date-picker':p=>[
    part('calendar','Kalenderrum','En kalender afgrænser datoer som en ordnet måned.',ledge(p,144,60,312,302)+box(156,72,288,55,'subject',3)+writing(177,107,'NOV',24,'light')+chevron(415,100),'rise'),
    part('binding','Måned og uger','To ophæng og syv kolonner gør kalenderens tidsenhed genkendelig.',stroke('M202 47v35M398 47v35','ink',6)+Array.from({length:7},(_,col)=>Array.from({length:4},(_,row)=>dot(181+col*39,164+row*45,3.2,'edge')).join('')).join(''),'draw'),
    part('selected-date','Valgt dag','Én dag er tydelig uden at ændre månedens struktur.',dot(298,209,19,'subject')+writing(298,216,'12',17,'light','text-anchor="middle"'),'light','298 209')
  ],
  'time-picker':p=>[
    part('clock-room','Urets rum','En cirkulær, indfældet skala viser tid frem for målt fremdrift.',dot(260,206,133,'context')+dot(260,206,120,'plane')+ring(260,206,133)+ring(260,206,107,'edge',1,'opacity=".45"'),'reveal'),
    part('hours','Timeinddeling','Tolv faste mærker gør visernes stilling aflæselig.',Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return dot(260+98*Math.sin(a),206-98*Math.cos(a),i%3===0?4:2.2,'edge');}).join(''),'reveal'),
    part('hands','Visere','To forskellige viserlængder viser halv ti omkring samme centrum.',stroke('M260 206v77M260 206l-57-15','subject',7)+dot(260,206,9,'ink'),'turn','260 206'),
    part('time-value','Tidsværdi','Den konkrete værdi står tæt på urskiven.',ledge(p,351,267,163,65)+writing(432,307,'09:30',28,'ink','text-anchor="middle"'),'rise')
  ],
  spinner:p=>[
    part('activity-room','Aktivitetsrum','Et åbent kredsløb viser arbejde uden en kendt slutværdi.',dot(300,210,131,'context')+dot(300,210,116,'plane')+ring(300,210,131)+ring(300,210,100,'edge',1,'opacity=".4"'),'reveal'),
    part('active-orbit','Aktivt kredsløb','Den afbrudte ring har ingen procentangivelse eller slutmarkør.',ring(300,210,96,'subject',12,'stroke-dasharray="438 166" transform="rotate(-90 300 210)"')+dot(300,114,7,'light'),'turn','300 210'),
    part('quiet-center','Roligt centrum','Midten bliver stående, mens aktivitet kan foregå omkring den.',dot(300,210,25,'counter')+dot(300,210,6,'ink'),'light')
  ],
  skeleton:p=>[
    part('reserved-room','Reserveret rum','Den fremtidige indholdsflade bevarer sin plads.',ledge(p,99,86,402,248),'reveal'),
    part('portrait-reservation','Billedplads','En mat, tom form reserverer et billede uden at foregive indhold.',dot(177,165,35,'context')+ring(177,165,35,'edge',1,'opacity=".4"'),'light','177 165'),
    part('text-reservations','Tekstplads','Stumpe, ensartede felter markerer kommende indhold.',box(235,142,220,15,'context',7)+box(235,172,164,15,'context',7)+box(142,230,313,15,'context',7)+box(142,260,256,15,'context',7),'rise')
  ],
  toast:p=>[
    part('context','Arbejdsflade','En tilbageholdt baggrund gør meddelelsens midlertidige placering tydelig.',outline(95,72,410,238,6)+lines(125,111,[187,256,224],27,'context',5),'reveal'),
    part('message','Kort meddelelse','En kompakt, løftet besked ligger oven på det eksisterende arbejde.',ledge(p,171,247,354,91,11)+dot(205,292,13,'subject')+writing(205,299,'i',19,'light','text-anchor="middle"')+lines(235,281,[183,141],23),'rise'),
    part('dismiss','Lukning','Et særskilt kryds viser, at meddelelsen kan lukkes.',cross(496,276,6),'draw')
  ],
  'empty-state':p=>[
    part('empty-niche','Tom niche','En synligt tom åbning beskriver manglende indhold, ikke indlæsning.',well(168,79,264,206,8)+path('M168 285h264l30 27H138Z','plane')+stroke('M138 312h324','edge',1.2),'reveal'),
    part('invitation','Næste skridt','Et lille, varmt plus inviterer til at tilføje det første indhold.',dot(300,182,36,'counter')+plus(300,182,12,'ink'),'light','300 182'),
    part('explanation','Forklaring','To korte spor giver plads til forklaring og vejledning.',lines(194,348,[212,158],19),'rise')
  ],
  'file-upload':p=>[
    part('local-tray','Lokal filbakke','En åben bakke modtager en fil uden at antyde en sky eller server.',path('M111 235h100l27 37h124l27-37h100v102H111Z','context')+outline(111,235,378,102,7)+stroke('M122 326h356','light',2),'reveal'),
    part('document','Valgt fil','Et enkelt ark med fold viser den konkrete lokale fil.',path('M223 77h113l41 43v138H223Z','plane')+stroke('M223 77h113l41 43v138H223Z')+path('M336 77v43h41Z','context')+lines(243,154,[102,79],23),'rise'),
    part('accept-file','Filvalg','En nedadgående pil fører filen til bakken, ikke ud af produktet.',stroke('M300 185v76m-16-16 16 16 16-16','subject',4),'draw'),
    part('filename','Filnavn','Et bevaret filnavn er knyttet til det accepterede ark.',stroke('M242 363h116','edge',3),'reveal')
  ],
  'data-table':p=>[
    part('table','Datatabel','Vandrette rækker og lodrette kolonner organiserer læsbart indhold.',ledge(p,83,77,434,266)+box(95,89,410,45,'context',2)+stroke('M95 134h410M95 183h410M95 232h410M95 281h410M219 89v242M371 89v242'),'reveal'),
    part('row','Aktuel række','En hel række fremhæves som læse- eller handlingskontekst.',box(97,185,406,45,'subject',1)+lines(119,209,[75],20,'light',3)+stroke('M242 209h101M394 209h85','light',3),'light','300 209'),
    part('values','Læseværdier','Korte tekstspor bevarer tabellens læserækkefølge.',[157,257,307].map(y=>stroke(`M119 ${y}h70M242 ${y}h96M394 ${y}h70`,'edge',2)).join('')+stroke('M119 111h64M242 111h78','ink',3)+chevron(476,111),'reveal')
  ],
  'data-grid':p=>[
    part('grid','Cellefelt','Et præcist gitter viser uafhængige celler, ikke kun hele rækker.',ledge(p,84,76,432,270)+[142,202,262].map(y=>stroke(`M96 ${y}h408`)).join('')+[198,300,402].map(x=>stroke(`M${x} 88v246`)).join(''),'reveal'),
    part('selection','Markering','Et afgrænset celleareal kan markeres uafhængigt af den aktive celle.',box(200,144,200,116,'context',1)+outline(199,143,202,118,1,'subject'),'light'),
    part('active-cell','Aktiv celle','En tydelig enkeltcelle og indtastningsmarkør viser redigering.',box(302,204,98,56,'plane',1)+outline(301,203,100,58,1,'ink')+stroke('M319 230h44M370 215v29','ink',2.2)+box(396,256,8,8,'subject',0),'draw'),
    part('values','Indhold','Korte værdier ligger inden for deres egne celler.',[116,175,234,294].map(y=>stroke(`M113 ${y}h56M216 ${y}h51M421 ${y}h55`,'edge',2)).join(''),'reveal')
  ],
  avatar:p=>[
    part('portrait-room','Portrætrum','En enkelt person har sin egen afgrænsede, runde plads.',shade('<circle cx="305" cy="218" r="124"/>')+`<circle cx="300" cy="210" r="124" fill="url(#${p}-wall)"/>`+ring(300,210,124),'reveal'),
    part('portrait','Person','Hoved og skuldre viser en person; den rolige indramning er ikke en knap.',dot(300,210,105,'subject')+person(300,207,'light',2.0),'light','300 210')
  ],
  textarea:p=>[
    part('writing-room','Flerlinjefelt','Et bredt, åbent skriverum kan rumme mere end en enkelt linje.',well(105,88,390,250,8),'reveal'),
    part('paragraph','Flere linjer','Flere tekstlinjer og en tekstmarkør viser fri skrivning.',lines(134,131,[302,268,291,185],39,'ink',2.4)+stroke('M328 233v29','subject',2.4),'draw'),
    part('resize','Tilpasning','Det nedre hjørne antyder et native tekstområdes størrelse.',stroke('M465 307l15-15M470 316l10-10','edge',1.4),'draw')
  ],
  'number-input':p=>[
    part('number-well','Talrum','Et koncentreret felt reserverer plads til en numerisk værdi.',ledge(p,133,122,334,177,10)+well(147,136,225,149,4),'reveal'),
    part('number','Talværdi','En konkret talform adskiller rollen fra almindelig tekst.',writing(257,239,'24',76,'ink','text-anchor="middle"'),'light','257 210'),
    part('stepper','Trin','To særskilte retninger viser kontrolleret ændring med trin.',box(383,137,69,67,'context',5)+box(383,217,69,67,'context',5)+plus(417,171,10)+stroke('M407 250h20','ink',2.5),'rise')
  ],
  'field-group':p=>[
    part('fieldset','Fælles afgrænsning','En åben kant ved overskriften navngiver to beslægtede felter som én gruppe.',stroke('M135 101H99V333H501V101H338')+stroke('M153 101h154','ink',5),'draw'),
    part('first-field','Første felt','Det første felt har sin egen label og kontrol.',lines(132,153,[119],20,'edge',2.4)+well(130,171,340,49),'rise'),
    part('second-field','Andet felt','Det andet felt er selvstændigt, men hører under samme legend.',lines(132,252,[151],20,'edge',2.4)+well(130,270,340,41),'rise')
  ],
  tabs:p=>[
    part('tab-room','Indholdspanel','Ét sammenhængende indholdsrum er knyttet til den aktive fane.',ledge(p,94,136,412,211,6)+lines(129,208,[252,302,223],33),'reveal'),
    part('inactive-tabs','Øvrige faner','To adskilte faner kan give adgang til andet indhold.',box(107,89,115,43,'context',6)+box(379,89,114,43,'context',6)+stroke('M129 110h70M402 110h68','edge',2.4),'reveal'),
    part('active-tab','Aktiv fane','En fremtrukket fane forbindes visuelt med panelet.',box(233,78,134,72,'plane',7)+outline(233,78,134,61,7)+stroke('M253 108h94','ink',3)+stroke('M235 149h130','light',3),'rise')
  ],
  breadcrumb:p=>[
    part('path','Hierarkisk sti','En ordnet vej forbinder tre niveauer frem mod det aktuelle sted.',stroke('M139 216h322','context',12)+stroke('M139 216h322','edge',1.2),'draw'),
    part('root','Øverste niveau','Et lille hus markerer stiens udgangspunkt.',path('M105 200l35-29 35 29v56h-70Z','plane')+stroke('M105 200l35-29 35 29v56h-70Z')+stroke('M131 256v-27h18v27','edge'),'rise'),
    part('ancestor','Forældreniveau','Et mellemled kan besøges uden at være det aktuelle mål.',ledge(p,218,183,99,66,9)+stroke('M238 216h58','ink',2.5)+chevron(340,216,false),'reveal'),
    part('current','Aktuelt sted','En solid slutmarkør afgrænser den aktuelle destination.',dot(431,216,43,'subject')+dot(431,216,10,'light'),'light','431 216')
  ],
  pagination:p=>[
    part('page-row','Sidefølge','Tre ligeværdige sidemål viser et afgrænset resultatforløb.',ledge(p,146,151,308,118,12)+box(159,165,81,90,'plane',5)+box(360,165,81,90,'plane',5)+writing(200,223,'1',31,'edge','text-anchor="middle"')+writing(400,223,'3',31,'edge','text-anchor="middle"'),'reveal'),
    part('current-page','Aktuel side','Én side er tydelig med både nummer og fast plads.',box(257,160,86,99,'subject',7)+writing(300,224,'2',34,'light','text-anchor="middle"'),'light'),
    part('page-navigation','Forrige og næste','To modsatte retninger viser navigation mellem sider.',stroke('M111 194l-16 16 16 16M489 194l16 16-16 16','ink',2.5),'draw')
  ],
  popover:p=>[
    part('anchor','Udløser','Et mindre element forankrer den supplerende flade.',ledge(p,230,295,140,51,11)+stroke('M258 321h83','ink',2.4),'reveal'),
    part('supplement','Supplerende indhold','En opadrettet, ikke-modal flade hænger tydeligt sammen med udløseren.',ledge(p,130,77,340,184,8)+path('M281 260h38l-19 25Z','plane')+stroke('M281 261l19 24 19-24')+lines(160,114,[226,174],25),'rise'),
    part('actions','Handlinger i fladen','To små handlingsrum adskiller en popover fra et rent værktøjstip.',box(158,193,122,39,'subject',6)+box(291,193,150,39,'context',6)+stroke('M180 213h77','light',2)+stroke('M311 213h109','ink',2),'light','300 213')
  ],
  drawer:p=>[
    part('workspace','Bagvedliggende arbejde','En arbejdsflade forbliver synlig ved siden af sidepanelet.',outline(78,72,444,276,6)+lines(111,116,[180,213,145],31)+box(105,237,207,79,'context',5),'reveal'),
    part('side-panel','Sidepanel','En høj flade kommer fra siden frem for at svæve i midten.',shade('<rect x="345" y="72" width="177" height="276"/>')+ledge(p,332,65,190,290,7)+lines(356,138,[131,106,124],36),'slide'),
    part('panel-heading','Paneltitel og lukning','Panelindholdet har en egen overskrift og lukning.',stroke('M355 98h104','ink',4)+cross(495,96,6)+box(355,285,143,41,'subject',5)+stroke('M380 306h93','light',2),'reveal')
  ],
  link:p=>[
    part('first-link','Udgangspunkt','Et åbent forbindelsesled har sin egen form.',`<rect x="154" y="124" width="169" height="83" rx="41" fill="none" stroke="${c('context')}" stroke-width="18" transform="rotate(28 238 165)"/>`+`<rect x="154" y="124" width="169" height="83" rx="41" fill="none" stroke="${c('edge')}" stroke-width="1.5" transform="rotate(28 238 165)"/>`,'rise'),
    part('destination','Forbindelse','Et andet led overlapper det første og fortsætter til et selvstændigt sted.',`<rect x="272" y="182" width="169" height="83" rx="41" fill="none" stroke="${c('subject')}" stroke-width="18" transform="rotate(28 356 223)"/>`,'light'),
    part('link-text','Linktekst','Understregning og retning viser navigation frem for en indsendelseshandling.',writing(230,324,'Videre',28)+stroke('M229 335h110M362 310h44m-10-10 10 10-10 10','ink',2),'draw')
  ],
  signature:p=>[
    part('credit-room','Afsenderrum','Et lavt, roligt felt giver en afsender plads uden at overtage produktets handlinger.',ledge(p,112,152,376,117,8),'reveal'),
    part('identity-placeholder','Originalens plads','Et neutralt mærkefelt reserverer plads til en godkendt originalressource.',outline(133,171,76,76,4)+dot(171,209,21,'context')+ring(171,209,14,'edge',1.2),'reveal'),
    part('sender','Navngiven afsender','Navn og en kort supplerende linje danner en samlet signatur.',writing(235,208,'Navn',35,'ink','font-style="italic"')+stroke('M235 235h191','edge',2)+stroke('M235 215h95','light',1),'rise')
  ],
  navigation:p=>[
    part('nav-rail','Navigationsområde','Et afgrænset område organiserer links til forskellige steder.',ledge(p,91,96,185,235,8)+lines(119,143,[118,93,123,106],48),'reveal'),
    part('current-link','Aktuelt mål','Et link er vedvarende markeret uden at ligne en åben kommandomenu.',box(104,170,159,43,'subject',5)+stroke('M121 192h111','light',2.4),'light','183 192'),
    part('destination','Sideindhold','En synlig forbindelse viser, at navigationen skifter sted.',stroke('M278 192h52m-10-10 10 10-10 10','ink',2)+outline(348,116,150,182,5)+lines(368,150,[104,89,111],29),'draw')
  ],
  text:p=>[
    part('reading-field','Læseflade','En åben papirflade giver løbende tekst ro og plads.',box(103,72,394,276,'plane',2)+stroke('M103 72h394','light',2),'reveal'),
    part('paragraph','Løbende tekst','Flere linjelængder og en tydelig afsnitspause danner læserytme.',lines(132,127,[328,301,315,232],30,'ink',2.3)+lines(132,276,[309,267],29,'edge',2),'draw'),
    part('reading-start','Læseretning','Et diskret tyngdepunkt markerer begyndelsen uden at gøre teksten til en kontrol.',box(132,94,56,9,'subject',2),'light','160 99')
  ],
  button:p=>[
    part('button-body','Handlingsflade','En solid, løftet form viser en selvstændig handling.',ledge(p,131,144,338,133,25)+box(144,157,312,107,'subject',18),'rise'),
    part('button-label','Handlingsnavn','Et centreret tekstspor giver handlingen et klart tyngdepunkt.',stroke('M191 211h174','light',6),'reveal'),
    part('action-direction','Handling','En kort pil understøtter handlingen uden at gøre formen til en menu.',stroke('M389 211h30m-10-10 10 10-10 10','light',3),'draw')
  ],
  input:p=>[
    part('input-well','Skrivefelt','Et enkelt aflangt rum er reserveret til kort, fri tekst.',well(111,158,378,104,9),'reveal'),
    part('typed-value','Indtastning','Ét tekstspor og en lodret markør viser, hvor der kan skrives.',stroke('M140 210h181','ink',3)+stroke('M333 190v40','subject',2.5),'draw'),
    part('light-edge','Lyskant','En lav forkant holder feltets materiale diskret og tydeligt.',stroke('M122 252h356','light',2),'reveal')
  ],
  field:p=>[
    part('label','Feltets navn','En kort label er tæt forbundet med sin kontrol.',stroke('M126 114h174','ink',4)+stroke('M126 128v20','edge',1),'draw'),
    part('control','Tekstkontrol','Et selvstændigt tekstfelt er gruppens hoveddel.',well(116,157,368,104,8)+stroke('M142 208h157M311 190v34','ink',2.5),'rise'),
    part('hint','Hjælp og forbindelse','En supplerende linje under feltet tilhører samme felt.',stroke('M132 262v29h28','edge',1.4)+dot(132,262,3,'subject')+stroke('M176 291h267','edge',2),'draw')
  ],
  select:p=>[
    part('choice-well','Ét valgrum','En enkelt kendt værdi ligger i et afgrænset felt.',ledge(p,123,144,354,131,10)+stroke('M147 205h227','ink',3),'rise'),
    part('disclosure','Native åbning','En tydelig nedadrettet markør viser adgang til en kendt liste.',box(405,158,57,103,'context',5)+chevron(434,209),'draw'),
    part('other-values','Kendte muligheder','To tilbageholdte spor antyder øvrige værdier uden søgning eller flere samtidige valg.',stroke('M162 301h183M162 325h142','edge',1.6,'opacity=".65"'),'reveal')
  ],
  card:p=>[
    part('card-surface','Indholdskort','Et samlet objekt har plads til overskrift, indhold og afsluttende handling.',ledge(p,131,61,338,302,10),'reveal'),
    part('header','Overskrift','En egen topzone navngiver kortets indhold.',dot(170,104,14,'subject')+stroke('M201 99h216M201 115h150','ink',2.5),'rise'),
    part('body','Indhold','Et mildt billedfelt og tekstspor hører til samme kort.',box(153,147,294,104,'context',4)+`<circle cx="300" cy="199" r="36" fill="url(#${p}-glow)"/>`+lines(156,275,[277,226],21),'light','300 199'),
    part('footer','Afslutning','En afsluttende handlingsplads forbliver inden for kortet.',box(332,315,113,28,'subject',5)+stroke('M352 329h72','light',2),'rise')
  ],
  badge:p=>[
    part('context','Tilhørende indhold','Et statusmærke knyttes til indhold frem for at stå som en knap.',stroke('M116 182h212M116 213h152M116 244h189','edge',3),'reveal'),
    part('badge','Kompakt status','En lille, afgrænset mærkning har en forståelig tekst.',ledge(p,349,168,151,85,25)+box(360,179,129,63,'subject',18)+writing(424,218,'KLAR',20,'light','text-anchor="middle"'),'light','424 210')
  ],
  divider:p=>[
    part('before','Første indholdsgruppe','Tre rolige spor hører sammen over opdelingen.',lines(135,110,[291,238,262],25),'reveal'),
    part('divider','Semantisk opdeling','Én fin, sammenhængende linje adskiller områder uden at indramme dem.',stroke('M104 211h392','edge',2)+stroke('M104 214h392','light',1.5),'draw'),
    part('after','Anden indholdsgruppe','En selvstændig gruppe begynder på den anden side af linjen.',lines(135,266,[257,310,216],25),'rise')
  ],
  alert:p=>[
    part('message-room','Beskedfelt','En rolig, afgrænset flade samler titel og forklaring.',ledge(p,93,127,414,167,9)+box(105,140,9,141,'subject',4),'reveal'),
    part('message-sign','Orientering','Et symbol bærer mening sammen med tekst; farven står ikke alene.',dot(159,182,25,'subject')+writing(159,191,'!',28,'light','text-anchor="middle"'),'light','159 182'),
    part('message-copy','Titel og forklaring','En tungere titel efterfølges af forklarende tekst.',stroke('M204 169h248','ink',4)+lines(204,207,[238,192],25),'rise')
  ],
  dialog:p=>[
    part('background','Bagvedliggende arbejde','En tilbageholdt arbejdsflade giver den modale dialog kontekst.',outline(74,65,452,291,7)+lines(101,96,[213,166],27,'context',4)+box(96,162,121,164,'context',4),'reveal'),
    part('dialog-room','Afgrænset dialog','Et centreret rum lægger sig over det eksisterende arbejde.',ledge(p,151,103,298,215,8)+stroke('M177 138h188','ink',4)+cross(422,132,6)+lines(177,183,[234,195],25),'rise'),
    part('dialog-actions','Svarmuligheder','To adskilte handlingspladser hører til dialogens afslutning.',box(240,263,83,32,'context',5)+box(333,263,91,32,'subject',5)+stroke('M256 279h51','ink',2)+stroke('M349 279h57','light',2),'light','332 279')
  ],
  heading:p=>[
    part('headline','Overskrift','En større, tungere tekstform sætter indholdets tydelige begyndelse.',writing(123,206,'Aa',111,'ink','font-weight="700"')+stroke('M301 159h174M301 191h130','subject',8),'rise'),
    part('subordinate-copy','Underordnet indhold','De mindre, lettere linjer understøtter et reelt typografisk hierarki.',lines(126,266,[346,310,280],26),'draw'),
    part('baseline','Fælles grundlinje','En diskret bund holder overskriftens dele samlet.',stroke('M122 225h353','light',2),'reveal')
  ],
  label:p=>[
    part('content','Navngivet område','Et afgrænset område får sit navn udefra.',well(163,187,313,134,7)+lines(186,229,[251,203,224],25),'reveal'),
    part('name','Kort etiket','En kort tekstflade navngiver området uden en valg- eller statusmarkør.',ledge(p,119,91,218,64,6)+stroke('M142 123h167','ink',3),'rise'),
    part('attachment','Tilhørsforhold','En præcis forbindelse knytter etiketten til det navngivne indhold.',stroke('M227 155v24h-43v8','edge',1.5)+dot(184,187,3,'subject'),'draw')
  ],
  tag:p=>[
    part('tag-body','Mærkatens form','Et let udskåret mærkat viser kategorisering som et selvstændigt lille objekt.',shade('<path d="M139 155h281l58 58-58 58H139Z"/>')+path('M135 148h281l58 58-58 58H135Z','plane')+stroke('M135 148h281l58 58-58 58H135Z'),'rise'),
    part('category','Kategori','En kort tekst og et lille præg giver mærkatet identitet.',dot(172,206,10,'counter')+stroke('M207 206h133','ink',4),'light'),
    part('remove','Separat fjernelse','En tydelig særskilt markør kan repræsentere fjernelse fra en kategori.',cross(390,206,8),'draw')
  ],
  radio:p=>[
    part('options','Ligeværdige muligheder','Ens runde felter viser muligheder i samme gruppe.',[147,279].map(y=>dot(178,y,43,'context')+dot(178,y,33,'plane')+ring(178,y,43)+stroke(`M250 ${y}h184`,'edge',3)).join(''),'reveal'),
    part('one-choice','Ét valg','Kun én solid kerne er valgt; formen skelner radio fra checkbox.',dot(178,147,20,'subject')+dot(178,147,6,'light'),'light','178 147')
  ],
  switch:p=>[
    part('track','Tilstandsrum','En langstrakt, indfældet bane giver kontakten to tydelige ender.',well(131,139,338,143,70)+box(143,151,314,119,'subject',59),'reveal'),
    part('off-position','Fra-position','En diskret tom position gør kontakten forskellig fra en enkelt rund knap.',ring(205,211,28,'light',1.5,'opacity=".6"'),'reveal'),
    part('on-thumb','Til-position','En lys, samlet kontakt ligger entydigt i den aktive ende.',shade('<circle cx="398" cy="216" r="54"/>')+`<circle cx="392" cy="210" r="54" fill="url(#${p}-wall)"/>`+ring(392,210,54)+stroke('M392 194v32','ink',3),'slide','392 210')
  ],
  'choice-field':p=>[
    part('label','Valgets navn','En særskilt label navngiver den native valgliste.',stroke('M135 111h197','ink',4),'draw'),
    part('select-control','Valgliste','En valgt værdi og nedadrettet markør er samlet i én kontrol.',ledge(p,123,151,354,119,8)+stroke('M148 211h210','ink',3)+chevron(442,211),'rise'),
    part('hint','Forbundet hjælp','En hjælpelinje vedrører valget uden at blive en ekstra valgmulighed.',dot(136,310,8,'counter')+writing(136,315,'i',12,'ink','text-anchor="middle"')+stroke('M158 310h293','edge',2),'reveal')
  ],
  toolbar:p=>[
    part('tool-tray','Fælles værktøjsbakke','Beslægtede handlinger deler én stabil grundflade.',ledge(p,91,139,418,143,16),'reveal'),
    part('primary-tool','Valgt værktøj','En fast markering viser det aktuelle værktøj.',box(110,157,91,107,'subject',8)+plus(155,199,14,'light')+stroke('M134 239h41','light',2),'light','155 210'),
    part('other-tools','Andre handlinger','Forskellige symboler og en opdeling angiver særskilte kommandoer.',outline(229,180,39,39,4)+stroke('M223 239h51M310 161v99','edge',1.6)+ring(354,199,18,'ink',2.5)+stroke('M375 239h-42M432 182v35m-17-17h34M412 239h41','ink',2.2),'draw')
  ],
  'action-button':p=>[
    part('tool-button','Navngivet handling','Et lodret værktøj samler symbol, label og supplerende genvej.',ledge(p,210,74,180,276,16)+box(223,87,154,176,'subject',10),'rise'),
    part('action-icon','Handlingssymbol','Et stort, enkelt symbol giver handlingen et umiddelbart holdepunkt.',plus(300,166,27,'light'),'draw'),
    part('action-label','Navn og genvej','Et handlingsnavn bevares særskilt fra en mindre genvej.',stroke('M246 238h108','light',4)+outline(252,291,95,31,5)+writing(300,313,'F2',14,'edge','text-anchor="middle"'),'reveal')
  ],
  'segmented-option':p=>[
    part('peer-options','Beslægtede alternativer','Tilbageholdte naboer viser, at rollen er én mulighed i et sæt.',outline(86,153,130,114,10)+outline(384,153,130,114,10)+stroke('M111 211h80M409 211h80','edge',3),'reveal'),
    part('one-segment','Den valgte mulighed','Ét centralt segment har selvstændigt navn og vedvarende valg.',ledge(p,225,139,150,142,10)+box(237,151,126,118,'subject',6)+stroke('M263 211h74','light',4),'light')
  ],
  'segmented-control':p=>[
    part('segment-tray','Samlet valgsæt','Tre ligeværdige indholdsvalg deler en kompakt afgrænsning.',ledge(p,102,142,396,136,14)+stroke('M235 158v104M365 158v104','edge',1.3),'reveal'),
    part('chosen-segment','Aktuelt indhold','Den valgte mulighed får en rolig, sammenhængende flade.',box(114,155,112,110,'subject',7)+stroke('M136 211h69','light',3.4),'light','170 210'),
    part('other-segments','Øvrige muligheder','To tilsvarende labels bevarer alternativerne som del af samme sæt.',stroke('M263 211h74M393 211h74','ink',3.4),'draw')
  ],
  'range-field':p=>[
    part('range-name','Navn og værdi','Skyderen har en navngivet mængde og en synlig aktuel værdi.',stroke('M123 109h172','ink',4)+writing(464,119,'60',30,'ink','text-anchor="end"'),'reveal'),
    part('range-track','Kontinuert interval','En ubrudt, indfældet bane adskiller skyderen fra diskrete radiovalg.',well(115,194,370,35,17)+stroke('M134 211h195','subject',8),'draw'),
    part('range-thumb','Aktuel værdi','En grebslignende lys skive angiver placeringen i intervallet.',shade('<circle cx="338" cy="217" r="35"/>')+`<circle cx="334" cy="211" r="35" fill="url(#${p}-wall)"/>`+ring(334,211,35)+stroke('M328 200v22M339 200v22','edge',1.4),'light','334 211'),
    part('limits','Grænser og hjælp','Intervallet har to grænser og en kort ledsagende forklaring.',stroke('M126 255v8M474 255v8M125 302h289','edge',1.5),'reveal')
  ],
  'instruction-note':p=>[
    part('related-content','Relevant indhold','Hjælpen ligger tæt ved den konkrete opgave.',well(96,93,288,62,7)+stroke('M118 124h207','ink',2.5),'reveal'),
    part('note-paper','Kort vejledning','En lille foldet note giver forklaring uden at blive en fejlbesked.',path('M172 202h270l29 29v99H172Z','plane')+stroke('M172 202h270l29 29v99H172Z')+path('M442 202v29h29Z','context')+lines(223,247,[215,183,149],24),'rise'),
    part('help-relation','Nær forbindelse','En enkel forbindelse og et infosymbol gør notens opgave tydelig.',stroke('M240 155v26h-40v21','edge',1.4)+dot(200,246,10,'counter')+writing(200,251,'i',13,'ink','text-anchor="middle"'),'draw')
  ],
  'metric-row':p=>[
    part('metric-label','Navngivet størrelse','En kort label forklarer, hvad tallet måler.',stroke('M115 190h149M115 216h101','edge',3),'reveal'),
    part('metric-value','Værdi og enhed','Et samlet tal og en mindre enhed viser resultatet med korrekt hierarki.',writing(366,230,'24',79,'ink','text-anchor="middle"')+writing(431,231,'stk.',19,'edge'),'light','366 211'),
    part('metric-baseline','Sammenhæng','En fælles bundlinje knytter label og resultat sammen.',stroke('M113 267h375','edge',1.5)+stroke('M113 270h375','light',1.5),'draw')
  ],
  inspector:p=>[
    part('selected-object','Valgt post','En markeret genstand er årsagen til detaljepanelets indhold.',box(88,157,153,125,'context',7)+outline(81,150,167,139,7,'subject')+dot(164,210,34,'counter'),'light','164 210'),
    part('context-link','Kontekstforbindelse','En synlig forbindelse viser, hvilken post der undersøges.',stroke('M249 210h65','edge',1.7)+dot(314,210,4,'subject'),'draw'),
    part('details','Detaljepanel','Et højt panel samler navn, forklaring og beslægtede felter.',ledge(p,318,60,191,302,8)+stroke('M339 93h119','ink',4)+lines(339,123,[143,109],20)+well(338,181,150,47,4)+well(338,281,150,47,4)+stroke('M340 165h86M340 264h107','edge',2),'rise')
  ],
  tooltip:p=>[
    part('trigger','Forklaringspunkt','Et lille navngivet hjælpepunkt kan modtage hover eller fokus.',dot(300,285,28,'context')+ring(300,285,28)+writing(300,294,'?',28,'ink','text-anchor="middle"'),'reveal'),
    part('tip','Kort forklaring','En lille tekstflade er forankret i punktet og rummer ingen handlinger.',ledge(p,159,105,282,94,8)+path('M284 198h32l-16 24Z','plane')+stroke('M284 199l16 23 16-23')+lines(183,141,[234,187],24),'rise')
  ],
  'brand-mark':p=>[
    part('clear-space','Frizone','En bred, ubrudt frizone beskytter originalens proportioner.',outline(130,67,340,286,3,'edge','stroke-dasharray="5 7"')+stroke('M130 51v-9h340v9M114 67h-9v286h9','edge',1),'draw'),
    part('asset-frame','Originalressource','En neutral ressourceplads repræsenterer en godkendt original, ikke et nyt produktlogo.',ledge(p,202,111,196,196,6),'reveal'),
    part('placeholder','Neutral pladsholder','En enkel geometrisk pladsholder illustrerer kun ressourcens placering.',dot(300,202,49,'context')+ring(300,202,35,'edge',1.4)+stroke('M254 276h92','ink',2.5),'light','300 202')
  ],
  'scroll-area':p=>[
    part('viewport','Afgrænset viewport','En fast indre ramme holder indhold og scrollbar inden for afrundingen.',ledge(p,156,57,288,306,11),'reveal'),
    part('scroll-content','Delvist indhold','Linjer fortsætter bag viewportens kant og viser, at der findes mere.',`<g clip-path="url(#${p}-scroll-clip)">${lines(179,101,[209,180,219,171,205,191,223,179,212],42)}</g>`,'rise'),
    part('scrollbar','Rulleposition','Et greb i en lang bane viser den synlige udsnitsplacering.',box(421,80,8,258,'context',4)+box(421,137,8,89,'subject',4),'slide','425 182'),
    part('focus-inset','Indre frizone','En tynd indre kant reserverer plads til fokus uden at klippe indhold.',outline(171,72,242,275,4,'edge','opacity=".4"'),'reveal')
  ],
  tree:p=>[
    part('hierarchy','Forgrening','Indrykning og en sammenhængende gren viser over-/underordning.',stroke('M142 114v165h81M142 173h81M263 173v139h83','edge',2)+chevron(116,113),'draw'),
    part('parent','Forælder','En samlet rod rummer de indlejrede elementer.',box(150,91,251,43,'context',6)+stroke('M172 113h204','ink',3),'reveal'),
    part('selected-node','Valgt element','En enkelt node er valgt uden at skjule dens placering i hierarkiet.',box(223,150,251,45,'subject',6)+stroke('M245 173h201','light',2.5),'light','348 173'),
    part('children','Underordnede elementer','Mindre, forskudte poster gør de næste niveauer tydelige.',box(223,257,251,43,'plane',5)+outline(223,257,251,43,5)+stroke('M245 279h184M348 312h111','edge',2.5)+dot(335,312,4,'counter'),'rise')
  ],
  stack:p=>[
    part('first-item','Første indholdsenhed','En selvstændig enhed begynder en lodret strøm.',ledge(p,151,59,298,76,7)+stroke('M179 97h240','ink',3),'rise'),
    part('second-item','Anden indholdsenhed','Et beslægtet objekt beholder sin egen indre anatomi.',box(151,168,298,73,'context',7)+dot(183,205,13,'counter')+stroke('M216 205h201','ink',2.5),'rise'),
    part('third-item','Tredje indholdsenhed','Et tredje objekt følger samme indholdsretning.',ledge(p,151,274,298,76,7)+stroke('M179 312h192','ink',3),'rise'),
    part('gaps','Ens ydre afstand','To ens mål mellem objekterne viser, hvad stakken ejer.',stroke('M119 137v29m-5-29h10m-10 29h10M119 243v29m-5-29h10m-10 29h10','edge',1.4),'draw')
  ],
  menubar:p=>[
    part('persistent-bar','Vedvarende menulinje','En fælles vandret indgang holder programmets kommandoer samlet.',ledge(p,88,85,424,73,7)+stroke('M245 120h86M366 120h106','ink',3),'reveal'),
    part('open-menu','Åben topmenu','En markeret topmenu åbner kommandoer frem for at skifte arbejdsområde.',box(103,99,116,45,'subject',5)+stroke('M121 121h79','light',3)+ledge(p,103,169,227,177,7),'rise'),
    part('commands','Kommandoer','Tre handlingsrækker og en opdeling gør menuens formål tydeligt.',plus(128,200,7)+stroke('M149 200h150M126 240h173M117 262h199M126 307h173','edge',2.3)+chevron(304,239,false),'draw')
  ],
  menu:p=>[
    part('menu-surface','Kommandomenu','En afgrænset flade indeholder handlinger og grupper uden formularfelter.',ledge(p,167,61,266,298,10),'rise'),
    part('checked-command','Valgkommando','Et flueben viser en vedvarende kommandoindstilling.',box(180,83,240,56,'subject',5)+check(196,111)+stroke('M238 111h157','light',2.5),'light','300 111'),
    part('other-commands','Øvrige kommandoer','Navne og en undermenupil giver handlingerne en tydelig opbygning.',stroke('M200 177h162M200 218h145M181 249h238M200 288h166M200 327h133','edge',2.5)+chevron(397,177,false),'draw')
  ],
  'menu-item':p=>[
    part('command-row','Én kommando','En enkelt navngiven handling er et selvstændigt punkt i en menu.',ledge(p,104,150,392,120,10),'reveal'),
    part('command-symbol','Symbol','Et lille symbol supplerer handlingens navn.',dot(149,210,20,'subject')+plus(149,210,8,'light'),'light','149 210'),
    part('command-label','Navn og genvej','En længere label og en særskilt lille genvej har forskellig vægt.',stroke('M191 210h165','ink',3.5)+outline(388,192,72,36,5)+writing(424,216,'Ctrl',14,'edge','text-anchor="middle"'),'draw')
  ]
};

export const LIGHTROOM_CATALOG_IDS=Object.freeze(Object.keys(scenes));

export function drawCatalog(motif,{prefix='lightroom-catalog'}={}){
  if(!Object.hasOwn(scenes,motif))throw new Error(`Unknown Lysrum catalog motif: ${motif}`);
  const safe=String(prefix).replace(/[^a-zA-Z0-9_-]/g,'-')||'lightroom-catalog';
  const extra=motif==='scroll-area'?`<defs><clipPath id="${safe}-scroll-clip"><rect x="174" y="79" width="233" height="261" rx="3"/></clipPath></defs>`:'';
  return scene(motif,safe,scenes[motif](safe),extra);
}
