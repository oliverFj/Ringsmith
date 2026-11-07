// Additional role studies. Geometry belongs to this family; pigments belong to the theme.
const C={ground:'var(--g-ground)',plane:'var(--g-plane)',ink:'var(--g-ink)',subject:'var(--g-subject)',counter:'var(--g-counter)',context:'var(--g-context)',edge:'var(--g-edge)',light:'var(--g-light)',width:'var(--g-line-width)'};
const P=(d,fill='none',stroke=C.ink,width=C.width)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const R=(x,y,w,h,fill='none',stroke=C.ink,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${C.width}" ${extra}/>`;
const O=(x,y,r,fill='none',stroke=C.ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${C.width}"/>`;
const L=(x,y,x2,y2,stroke=C.ink,width=1)=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
const T=(x,y,value,size=20,fill=C.ink)=>`<text x="${x}" y="${y}" fill="${fill}" font-family="ui-monospace,monospace" font-size="${size}">${value}</text>`;
const rows=(x,y,widths,gap=23,stroke=C.ink)=>widths.map((w,i)=>L(x,y+i*gap,x+w,y+i*gap,stroke)).join('');
const plus=(x,y,size=10)=>P(`M${x-size} ${y}h${size*2}M${x} ${y-size}v${size*2}`);
const cross=(x,y,size=6)=>P(`M${x-size} ${y-size}l${size*2} ${size*2}M${x+size} ${y-size}l${-size*2} ${size*2}`);
const down=(x,y)=>P(`m${x-7} ${y-4} 7 7 7-7`);
const right=(x,y)=>P(`m${x-5} ${y-7} 7 7-7 7`);
const dim=(x,y,w)=>L(x,y,x+w,y,C.edge)+L(x,y-6,x,y+6,C.edge)+L(x+w,y-6,x+w,y+6,C.edge);
const bracket=(x,y,w)=>P(`M${x} ${y-10}v10h${w}v-10`,'none',C.edge,1);
const dot=(x,y)=>O(x,y,4,C.subject,'none');
const paper=(x,y,w,h)=>P(`M${x} ${y}h${w-38}l38 38v${h-38}H${x}Z`,C.plane)+P(`M${x+w-38} ${y}v38h38`,'none',C.edge,1);
const person=(x,y,r=24)=>O(x,y,r,'none',C.ink)+P(`M${x-r*1.5} ${y+r*2.6}a${r*1.5} ${r*1.5} 0 0 1 ${r*3} 0`);
const part=(key,name,purpose,body)=>({key,name,purpose,body});
const S=(label,anchors,parts)=>({label,anchors,parts});

const scenes={
  'list-item':S('Tre poster har hver en titel og en kort beskrivelse. Den midterste er aktuel og beholder sin plads i samlingen.',[[165,108],[165,210],[165,312]],[
    part('collection','Samlingens rytme','Tre ligeværdige poster følger samme akse og afstand.',L(135,151,465,151,C.edge)+L(135,269,465,269,C.edge)+bracket(135,358,330)),
    part('current','Aktuel post','En afgrænset flade og lodret markør udpeger én post.',R(125,165,350,90,C.context,C.edge)+L(125,165,125,255,C.subject,4)),
    part('titles','Posternes titler','Den første linje bærer hver posts navn.',L(157,96,369,96,C.ink,2.5)+L(157,195,397,195,C.ink,2.5)+L(157,300,350,300,C.ink,2.5)),
    part('descriptions','Supplerende indhold','En kortere linje under titlen beskriver posten.',L(157,123,418,123,C.edge)+L(157,225,365,225,C.ink)+L(157,327,402,327,C.edge))]),
  input:S('En enkelt tekstlinje indtastes i en præcis kontrol. En synlig indsætningsmarkør viser, hvor teksten fortsætter.',[[165,206],[365,206],[300,286]],[
    part('control','Tekstkontrol','Konturen viser ét afgrænset felt til kort tekst.',R(125,150,350,110,C.plane)),
    part('entry','Indtastning','En tekststreg afsluttes af en entydig indsætningsmarkør.',L(160,206,345,206)+P('M365 184v44', 'none',C.subject,3)),
    part('extent','Feltets mål','Et enkelt mål fastholder feltets udstrækning.',dim(125,294,350))]),
  textarea:S('Et flerlinjefelt rummer flere tekstlinjer og et diskret størrelsesgreb nederst.',[[165,145],[330,191],[438,285]],[
    part('area','Tekstareal','En højere kontrol reserverer plads til flere linjer.',R(125,85,350,240,C.plane)),
    part('lines','Flere linjer','Varierende linjelængder viser sammenhængende tekst.',rows(160,135,[230,270,205,250,150],32)+L(328,247,328,275,C.subject,3)),
    part('resize','Størrelsesgreb','To diagonaler i nederste hjørne angiver en ændrbar ramme.',P('M438 311l23-23M449 311l12-12','none',C.edge,1))]),
  'number-input':S('Et talfelt viser en numerisk værdi, mens to adskilte pile viser faste trin op og ned.',[[225,220],[435,176],[435,234]],[
    part('number-field','Talfelt','En indrammet kontrol skelner talværdien fra dens trin.',R(130,140,340,130,C.plane)+L(400,140,400,270,C.edge)),
    part('value','Numerisk værdi','En tydelig talværdi er feltets indhold.',T(190,229,'12',60)),
    part('steps','Trin','Modsatrettede pile viser forøgelse og formindskelse.',P('m427 179 8-8 8 8M427 230l8 8 8-8','none',C.subject,2)+L(400,205,470,205,C.edge)),
    part('measure','Fast måleramme','Tallet ændres inden for en stabil ramme.',dim(130,310,340))]),
  field:S('En label, et tekstfelt og tilhørende hjælp er bundet til samme lodrette akse.',[[155,100],[300,190],[155,280]],[
    part('label','Feltets navn','Labelen står tæt ved den kontrol, den navngiver.',L(145,100,285,100,C.ink,2)),
    part('control','Native kontrol','Konturen og markøren viser, hvor svaret afgives.',R(145,140,330,95,C.plane)+L(175,188,325,188)+L(340,168,340,210,C.subject,3)),
    part('help','Tilhørende hjælp','En kort supplerende tekst forbindes til feltets venstre akse.',rows(145,274,[260,190],23,C.edge)+P('M119 100h-14v197h14','none',C.edge,1))]),
  select:S('En lukket valgliste viser én valgt mulighed og en tydelig åbnepil. Der vises ingen tekstmarkør.',[[230,210],[430,210]],[
    part('select-control','Valgliste','En samlet kontrol indeholder det aktuelle valg.',R(130,155,340,105,C.plane)),
    part('selection','Aktuelt valg','Et ordmærke viser, at feltet allerede har en værdi.',L(166,207,335,207,C.ink,2)+dot(161,207)),
    part('disclosure','Listen kan åbnes','En adskilt nedadpil angiver de øvrige muligheder.',L(397,155,397,260,C.edge)+P('m419 202 11 11 11-11','none',C.subject,2)+dim(130,298,340))]),
  'choice-field':S('En navngivet native valgliste har sit eget label og sin egen hjælp under kontrollen.',[[145,100],[425,190],[145,280]],[
    part('name','Navngivning','Labelen gør valgets formål forståeligt.',rows(145,100,[150],23)),
    part('choice','Ét valg','En tekstværdi og en nedadpil deler samme kontrol.',R(145,140,330,95,C.plane)+L(175,188,325,188)+L(398,140,398,235,C.edge)+down(435,190)),
    part('guidance','Supplerende vejledning','En kort hjælp er bundet til samme navneakse.',rows(145,276,[235,170],22,C.edge)+dot(131,276))]),
  'field-group':S('To beslægtede felter samles af en navngivet feltgruppe. Navnet indgår i gruppens øverste ramme.',[[185,85],[300,170],[300,270]],[
    part('fieldset','Fælles indramning','En åben ramme giver plads til gruppens legend.',P('M132 85H105V345H495V85H329')),
    part('legend','Gruppens navn','En kort overskrift står i rammens åbning.',L(153,85,306,85,C.ink,2)),
    part('fields','Beslægtede felter','To native felter bevarer deres egen label og kontrol.',L(145,137,235,137)+R(145,158,310,55,C.plane)+L(145,244,255,244)+R(145,265,310,55,C.plane)),
    part('relation','Fælles akse','En fælles venstre akse forklarer sammenhængen.',L(128,137,128,320,C.edge)+dot(128,227))]),
  combobox:S('Et skrivbart felt filtrerer en åben liste. Indsætningsmarkør, valgmuligheder og én markering har forskellige signaler.',[[240,105],[300,215],[435,215]],[
    part('query','Søgetekst','Et felt med en markør viser, at man kan skrive og filtrere.',R(135,65,330,75,C.plane)+L(165,102,280,102)+L(296,84,296,119,C.subject,2.5)+down(433,103)),
    part('options','Filtrerede muligheder','En åben liste viser resultatet under feltet.',R(135,153,330,190,C.plane)+rows(174,188,[160,185,135],55)),
    part('active-option','Aktuel mulighed','En diskret række og et flueben markerer én mulighed.',R(145,207,310,50,C.context,'none')+L(174,233,359,233)+P('m412 232 7 7 14-16','none',C.subject,2)),
    part('connection','Felt og liste','Et kort led binder forespørgslen til resultatet.',L(300,140,300,153,C.edge)+dot(300,146))]),
  multiselect:S('Flere valgte værdier samles som to mærker i et felt. En filtreret liste kan bidrage med yderligere valg.',[[210,108],[340,108],[160,240]],[
    part('container','Flervalgsfelt','Et bredt felt giver plads til flere navngivne værdier.',R(105,65,390,100,C.plane)),
    part('selected-values','Valgte værdier','To selvstændige mærker viser, at mere end én værdi er valgt.',R(124,88,140,50,C.context)+R(278,88,145,50,C.context)+L(140,113,211,113)+cross(245,113,4)+L(295,113,368,113)+cross(405,113,4)),
    part('available-values','Tilgængelige værdier','To muligheder med forskellige valgmarkører skelner valgt og endnu ikke valgt.',R(105,180,390,155,C.plane)+R(132,208,27,27,C.subject)+P('m138 222 6 6 10-12','none',C.light,2)+R(132,272,27,27,C.plane)+L(180,222,390,222)+L(180,286,348,286)),
    part('shared-field','Samlet valg','En klamme samler de valgte mærker i samme kontrol.',bracket(124,150,299))]),
  'date-picker':S('Et kalenderfelt viser en måned som et ordnet datogitter. En enkelt dato er markeret, ikke en løbende aktivitet.',[[200,112],[300,248],[450,112]],[
    part('calendar','Kalenderramme','Topbånd og to hængsler gør kalenderen genkendelig.',R(140,85,320,260,C.plane)+L(140,151,460,151,C.edge)+P('M206 65v42M394 65v42')),
    part('month','Måned','En centreret betegnelse og to pile giver måneden en retning.',L(252,119,348,119)+P('m174 112-7 7 7 7m252-14 7 7-7 7','none',C.edge,1)),
    part('days','Dage','Lige intervaller danner et datogitter.',[0,1,2].flatMap(r=>[0,1,2,3,4].map(c=>O(190+c*55,194+r*54,3,C.edge,'none'))).join('')),
    part('selected-date','Valgt dato','Én dato markeres inden for gitteret.',R(273,222,54,52,C.context)+O(300,248,8,C.subject,'none'))]),
  'time-picker':S('En urskive med to tydeligt forskellige visere angiver tidspunktet 10:30.',[[300,205],[257,162],[300,288]],[
    part('clock','Urskive','En afgrænset cirkel reserverer plads til et tidspunkt.',O(300,205,118,C.plane)),
    part('ticks','Tidsinddeling','Fire hovedmarkeringer giver skiven retning.',P('M300 95v18M300 297v18M190 205h18M392 205h18','none',C.edge,1)),
    part('hands','Visere','Den korte timeviser står mellem ti og elleve, mens minutviseren peger på halv.',P('M300 205V288M300 205l-43-43','none',C.ink,2)+dot(300,205)),
    part('time-value','Tidspunkt','En kompakt digital værdi forbinder urskive og native tidsfelt.',T(250,366,'10:30',25)+dim(183,343,234))]),
  radio:S('Tre muligheder hører til samme gruppe. Kun den midterste radioknap har en fyldt kerne.',[[164,115],[164,210],[164,305]],[
    part('choices','Én af flere','Tre identiske cirkulære kontroller viser det gensidigt udelukkende valg.',[115,210,305].map(y=>O(164,y,24,C.plane)+L(218,y,421,y)).join('')),
    part('chosen','Valgt mulighed','Én fyldt kerne viser præcis det ene valg.',O(164,210,11,C.subject,'none')),
    part('group','Fælles gruppe','En klamme binder mulighederne sammen uden at ligne afkrydsning.',P('M466 91h18v238h-18','none',C.edge,1)+dot(484,210))]),
  switch:S('Den samme kontakt vises til og fra. Knoppens position og den udfyldte bane skelner tilstandene.',[[251,163],[181,263],[385,163]],[
    part('tracks','Kontaktens bane','To ens baner viser samme type indstilling i hver tilstand.',R(140,135,140,56,C.context,C.ink,'rx="28"')+R(140,235,140,56,C.plane,C.ink,'rx="28"')),
    part('knobs','Til og fra','Højre position er aktiv; venstre står neutral.',O(251,163,22,C.subject,'none')+O(169,263,22,C.plane)),
    part('names','Indstillingernes navne','Labels knyttes til hver kontakt frem for til knoppens bevægelse.',L(325,163,445,163)+L(325,263,445,263)+dim(140,331,140))]),
  'range-field':S('En navngivet skyder følger en afgrænset skala. Grebet, udfyldt strækning og værdi angiver samme position.',[[328,220],[125,220],[475,220]],[
    part('scale','Afgrænset skala','En stabil skinne har tydelige endepunkter og lige måletrin.',L(125,220,475,220,C.edge)+Array.from({length:8},(_,i)=>L(125+i*50,246,125+i*50,258,C.edge)).join('')),
    part('value','Valgt interval','Den udfyldte skinne og grebet angiver samme værdi.',L(125,220,328,220,C.subject,3)+O(328,220,15,C.plane)+O(328,220,5,C.subject,'none')),
    part('readout','Synlig værdi','En målelinie forbinder grebet til den viste værdi.',L(328,205,328,166,C.edge)+R(291,112,74,42,C.plane)+T(311,140,'58',20)+L(125,94,260,94,C.ink,2))]),
  button:S('En afgrænset knap tilbyder én handling. En kort markør møder knappen, mens en målelinje viser klikfladens udstrækning.',[[300,207],[401,248],[300,303]],[
    part('button','Handlingsflade','En samlet flade rummer én centreret handling.',R(150,145,300,110,C.plane)),
    part('action','Handlingens navn','En koncentreret pigmentstreg giver handlingen ét tyngdepunkt.',L(231,201,369,201,C.subject,4)),
    part('pointer','Aktivering','En lille pegemarkør viser handling frem for navigation.',P('M391 241l10 43 10-14 18-6Z',C.context)),
    part('target-size','Klikfladens mål','Et enkelt mål fastholder knappens selvstændige udstrækning.',dim(150,303,300))]),
  'action-button':S('En handlingsknap samler et symbol, et handlingsnavn og en supplerende genvej i et tydeligt hierarki.',[[300,150],[300,221],[300,270]],[
    part('tile','Handlingsknap','En højere knap holder symbol, navn og genvej samlet.',R(210,80,180,245,C.plane)),
    part('symbol','Handlingssymbol','Et enkelt plus navngives af teksten under det.',O(300,145,30,C.context)+plus(300,145,12)),
    part('action-name','Navn','Et afgrænset handlingsnavn bærer knappens betydning.',L(251,220,349,220,C.subject,3)),
    part('shortcut','Supplerende genvej','En lille tast står under navnet og har lavere vægt.',R(276,251,48,34,'none',C.edge)+T(293,275,'K',19))]),
  toolbar:S('Fire forskellige handlinger samles på én fælles skinne. Afstand og en klamme viser gruppen.',[[165,200],[255,200],[345,200],[435,200]],[
    part('rail','Fælles handlingsgruppe','En smal skinne samler knapper med ens orientering.',R(110,130,380,135,C.plane)+L(211,150,211,245,C.edge)+L(301,150,301,245,C.edge)+L(391,150,391,245,C.edge)),
    part('commands','Forskellige handlinger','Fire simple symboler angiver handlinger inden for samme gruppe.',plus(165,198,12)+P('M239 207l22-22 10 10-22 22Z')+P('M334 186h24v24h-24ZM329 181h24','none',C.ink)+P('M423 199h24m-6-6 6 6-6 6','none',C.subject,2)),
    part('group','Gruppens grænse','En klamme markerer den fælles handlingskontekst.',bracket(110,300,380)+dot(300,300))]),
  'segmented-option':S('Én navngivet mulighed fremhæves i et kompakt sæt. En lokal måleklamme udpeger netop det valgte segment.',[[300,200],[245,310]],[
    part('neighbors','Nabomuligheder','De øvrige segmenter giver den enkelte mulighed sin kontekst.',R(135,145,110,110,C.plane,C.edge)+R(355,145,110,110,C.plane,C.edge)+L(165,200,215,200,C.edge)+L(385,200,435,200,C.edge)),
    part('option','Selvstændigt segment','Én mulighed har sin egen valgte tilstand.',R(245,145,110,110,C.subject)+L(273,200,327,200,C.light,2)),
    part('local-extent','Denne mulighed','Målet omfatter kun det selvstændige segment.',dim(245,298,110)+dot(300,298))]),
  'segmented-control':S('Tre beslægtede muligheder deler en samlet kontrol. Kun midtersegmentet er valgt.',[[190,200],[300,200],[410,200]],[
    part('group','Samlet segmentgruppe','En fælles ydre ramme og to skillelinjer danner én kontrol.',R(135,140,330,125,C.plane)+L(245,140,245,265,C.edge)+L(355,140,355,265,C.edge)),
    part('selection','Valgt segment','En indre flade markerer det aktuelle indholdsvalg.',R(251,146,98,113,C.context,'none')+O(300,183,5,C.subject,'none')),
    part('names','Tre navne','Ens labels gør mulighederne ligeværdige.',L(165,218,215,218)+L(275,218,325,218)+L(385,218,435,218)),
    part('extent','Hele gruppen','En fælles klamme viser kontrollens samlede omfang.',bracket(135,306,330))]),
  link:S('En understreget tekst fører til et selvstændigt mål. Forbindelsen har en klar retning og destination.',[[230,183],[420,218]],[
    part('anchor-text','Meningsfuld linktekst','Understregningen markerer navigation uden en knapramme.',L(135,181,315,181,C.ink,3)+L(135,199,315,199,C.subject,1.5)),
    part('destination','Navigationsmål','En særskilt målramme har sit eget indhold.',R(385,125,100,145,C.plane)+rows(403,158,[62,48,58],23,C.edge)),
    part('connection','Retning','En afgrænset pil forbinder teksten med målet.',P('M315 219h104m-10-10 10 10-10 10','none',C.subject,2)+dot(315,219))]),
  navigation:S('En liste af links viser forskellige destinationer. Den aktuelle side markeres med både en lodret accent og en understregning.',[[145,125],[145,210],[145,295]],[
    part('destinations','Navigationsmål','Tre ligeværdige linkrækker udgør en vedvarende navigation.',[125,210,295].map(y=>O(151,y,4,C.edge,'none')+L(180,y,425,y)).join('')),
    part('current','Aktuel side','En lodret markering og understregning udpeger samme aktuelle mål.',L(125,188,125,234,C.subject,3)+L(180,228,425,228,C.subject,1.5)),
    part('nav-context','Fælles navigation','En diskret klamme adskiller navigation fra selvstændige kommandoer.',P('M464 102h15v216h-15','none',C.edge,1))]),
  breadcrumb:S('En ordnet sti fører fra et overordnet sted gennem et mellemled til den aktuelle side.',[[145,205],[295,205],[445,205]],[
    part('ancestors','Overordnede sider','To understregede led angiver steder, man kan gå tilbage til.',L(105,200,198,200)+L(105,218,198,218,C.edge)+L(252,200,345,200)+L(252,218,345,218,C.edge)),
    part('path','Stiens retning','To præcise chevrons viser rækkefølgen.',right(225,205)+right(372,205)),
    part('current-page','Aktuel side','Det sidste led har pigment og en afsluttende markør.',L(400,200,495,200,C.subject,3)+dot(447,233)),
    part('hierarchy','Fra overordnet til aktuelt','En faldende hjælpelinje binder stiens tre niveauer sammen.',P('M106 151h91v-17h148v-17h149','none',C.edge,1))]),
  pagination:S('Et afgrænset sæt sidetal ligger mellem forrige og næste. Den tredje side er aktuel.',[[165,205],[300,205],[435,205]],[
    part('pages','Afgrænset sidemængde','Tre ens sidefelter repræsenterer forskellige sider.',[200,270,340].map(x=>R(x,165,60,80,C.plane)).join('')+T(221,215,'1',22)+T(291,215,'2',22)),
    part('current-page','Aktuel side','Et enkelt sidefelt fremhæves uden at ændre de øvrige felter.',R(346,171,48,68,C.context,'none')+T(361,215,'3',22,C.subject)),
    part('page-links','Forrige og næste','To modsatrettede pile navngiver forløbets ender.',P('M166 205h-34m10-10-10 10 10 10M434 205h34m-10-10 10 10-10 10')),
    part('total','Fælles resultatmængde','En samlet klamme viser, at siderne tilhører samme resultat.',bracket(200,286,200))]),
  tabs:S('Tre faner er forbundet med ét synligt indholdspanel. Den valgte fane åbner direkte ind i panelets ramme.',[[190,120],[300,120],[300,250]],[
    part('panel','Indholdspanel','En fælles ramme viser området, som fanerne styrer.',P('M110 150v180h380V150H350M250 150H110',C.plane)),
    part('tabs','Fanehoveder','Tre faner har ens placering; midten er knyttet til det synlige panel.',P('M130 150V90h120v60M250 150V75h100v75M350 150V90h120v60')+L(157,122,218,122,C.edge)+L(379,122,441,122,C.edge)),
    part('active-tab','Valgt fane','Den aktive overskrift får ét farvet tyngdepunkt.',L(274,111,326,111,C.subject,3)),
    part('content','Synligt indhold','Indholdsstregerne hører til den åbne fane.',rows(150,206,[270,230,180],35))]),
  tree:S('En hierarkisk liste har én overordnet knude, to børn og et barnebarn. Forbindelserne viser niveauerne.',[[150,110],[245,180],[330,250],[245,320]],[
    part('hierarchy','Forældreskab','En indrykket stamme viser præcise overordnede relationer.',P('M150 130v190h75M150 180h75M245 200v50h65','none',C.edge,1.5)),
    part('nodes','Hierarkiske enheder','Knuder og deres navne følger niveauernes indrykning.',R(130,90,40,40,C.plane)+R(225,160,40,40,C.plane)+R(225,300,40,40,C.plane)+L(188,110,353,110)+L(283,180,455,180)+L(283,320,427,320)),
    part('selected-node','Valgt objekt','En indrykket, farvet knude fremhæver et objekt uden at ændre dets forælder.',R(310,230,40,40,C.context)+O(330,250,5,C.subject,'none')+L(370,250,478,250)),
    part('disclosure','Åbent niveau','En chevron markerer den åbne overordnede knude.',down(150,110))]),
  menubar:S('En vedvarende menulinje åbner en kommandomenu under det aktive menunavn. Det er et program, ikke et sæt arbejdsfaner.',[[175,108],[320,108],[245,220]],[
    part('bar','Vedvarende menulinje','Tre korte menunavne deler en vandret programlinje.',L(95,144,505,144,C.edge)+L(129,109,211,109)+L(265,109,345,109)+L(397,109,473,109)),
    part('open-name','Åben topmenu','En kort accent understreger det aktive menunavn.',L(122,129,218,129,C.subject,2)),
    part('commands','Åben kommandomenu','En afgrænset flade rummer kommandorækker og en adskilt sidste gruppe.',R(120,144,265,188,C.plane)+rows(155,186,[150,180,137],42)+L(137,277,367,277,C.edge)),
    part('active-command','Aktuel kommando','En lille markør angiver én kommando inden i den åbne menu.',dot(139,228)+right(352,228))]),
  menu:S('En kommandomenu grupperer handlinger i en selvstændig flade. En markeret række og en højrepil angiver en underkommando.',[[180,126],[300,206],[445,206]],[
    part('menu-surface','Kommandoområde','En selvstændig flade indeholder kommandorækker.',R(140,75,320,270,C.plane)+L(157,261,443,261,C.edge)),
    part('commands','Navngivne kommandoer','Tre rækker og en adskilt afslutning viser menustruktur.',rows(183,126,[155,180,148],80)+L(183,310,330,310)),
    part('active-command','Aktuel række','En begrænset flade og en pil viser den aktuelle underkommando.',R(151,176,298,55,C.context,'none')+L(183,206,363,206)+right(426,206)),
    part('grouping','Gruppens mål','Et enkelt mål understøtter menuens stabile bredde.',dim(140,374,320))]),
  'menu-item':S('En menukommando har et symbol, et tydeligt handlingsnavn og en mindre genvej. Den står som én samlet række.',[[164,205],[300,205],[440,205]],[
    part('command-row','Kommandoens række','En enkelt, lav flade adskiller én kommando fra hele menuen.',R(115,165,370,85,C.plane)),
    part('command','Symbol og navn','Et lille symbol ledsager et navngivet handlingsområde.',plus(157,207,10)+L(195,206,359,206,C.subject,2)),
    part('shortcut','Supplerende genvej','En adskilt tast står til højre for navnet.',R(419,187,37,37,'none',C.edge)+T(430,213,'K',19)),
    part('row-extent','Enhedens mål','Måleklammen omfatter kun denne kommando.',bracket(115,289,370))]),
  popover:S('En supplerende flade er præcist forankret i en udløser. Indhold og en lille handling adskiller den fra et rent værktøjstip.',[[300,310],[300,250],[360,205]],[
    part('trigger','Udløser','Et navngivet anker er adskilt fra det supplerende indhold.',R(245,305,110,44,C.plane)+L(269,327,331,327)),
    part('anchored-panel','Forankret flade','En lille spids forbinder panelet med udløseren.',P('M145 80H455V265H318L300 284 282 265H145Z',C.plane)),
    part('content','Supplerende indhold','Tekst og én selvstændig handling viser, at panelet kan indeholde betjening.',rows(178,122,[220,175],30)+R(300,195,115,36,C.context)+L(328,213,387,213,C.subject,2)),
    part('anchor','Fysisk forhold','En kort leder viser det direkte tilhørsforhold.',L(300,284,300,305,C.edge)+dot(300,294))]),
  tooltip:S('Et kort, rent teksttip hører til et bestemt anker. Der er ingen knapper eller felter i tipfladen.',[[300,286],[300,190]],[
    part('anchor','Forklaret kontrol','Et lille informationsanker har sit eget navn.',O(300,292,22,C.plane)+T(294,300,'i',23)),
    part('tip','Kort forklaring','En lille tekstflade har en entydig pegespids.',P('M165 110H435V223H315L300 240 285 223H165Z',C.plane)),
    part('explanation','Kun tekst','To korte linjer viser en supplerende forklaring.',rows(196,151,[204,149],30)),
    part('attachment','Forbindelse','En diskret leder knytter forklaringen til ankeret.',L(300,240,300,270,C.edge)+dot(300,255))]),
  drawer:S('Et sidepanel kommer fra arbejdsfladens højre kant og efterlader konteksten synlig til venstre.',[[170,135],[355,210],[465,105]],[
    part('workspace','Bagvedliggende arbejde','En hel arbejdsflade har synligt indhold bag sidepanelet.',R(85,80,430,270,C.plane)+rows(118,126,[165,195,143,178,120],39,C.edge)),
    part('side-panel','Panel fra siden','En selvstændig høj flade er fastgjort til højre kant.',R(330,80,185,270,C.context)+L(330,80,330,350,C.ink,2)),
    part('panel-content','Panelets indhold','Titel, lukning og indhold bevarer deres egne pladser.',L(354,119,440,119,C.ink,2)+cross(482,112,6)+rows(355,176,[127,100,116],48)),
    part('edge-attachment','Kantens retning','En vandret leder angiver panelets tilknytning til kanten.',P('M282 283h48m-10-8 10 8-10 8','none',C.subject,2))]),
  dialog:S('En centreret dialog afgrænser en selvstændig opgave foran en større arbejdsflade. Titel og handlinger ligger inde i dialogen.',[[300,118],[225,270],[378,270]],[
    part('context','Omgivende arbejdsflade','En diskret ramme og korte streger viser baggrunden.',R(70,60,460,300,'none',C.edge)+rows(93,97,[91,105,76],35,C.edge)),
    part('dialog','Afgrænset dialog','En tydelig central flade danner et selvstændigt samtalerum.',R(150,95,300,245,C.plane)+L(150,157,450,157,C.edge)),
    part('title-and-content','Dialogens indhold','Titel og forklaring holder en klar læserækkefølge.',L(179,128,340,128,C.ink,2)+cross(420,124,6)+rows(179,192,[222,173],28)),
    part('actions','Dialoghandlinger','En neutral ledsager og én afgrænset hovedhandling afslutter opgaven.',R(180,270,105,40,C.plane)+R(310,270,110,40,C.context)+L(334,290,396,290,C.subject,2))]),
  inspector:S('Et valgt objekt til venstre er forbundet med et vedvarende detaljepanel til højre. Panelet opdeler egenskaber i navngivne afsnit.',[[180,196],[328,130],[428,245]],[
    part('selection','Valgt objekt','En lille objektkontur og et aktivt punkt angiver det valgte.',R(117,140,125,125,C.plane)+O(179.5,202.5,26,C.context)+dot(180,203)),
    part('panel','Detaljepanel','En høj flade med sektioner reserverer plads til objektets egenskaber.',R(320,75,190,285,C.plane)+L(320,140,510,140,C.edge)+L(340,241,490,241,C.edge)),
    part('properties','Egenskaber','Labels og korte værdifelter danner grupper frem for en dialog.',L(345,108,458,108,C.ink,2)+L(345,174,401,174,C.edge)+R(345,191,140,28,C.plane)+L(345,271,419,271,C.edge)+R(345,289,140,28,C.plane)),
    part('selection-link','Objekt og detaljer','En knækleder forklarer, hvilket objekt panelet beskriver.',P('M242 203h39v-77h39','none',C.subject,1.5))]),
  card:S('Et indholdskort holder overskrift, indhold og afsluttende handling sammen på én flade.',[[180,115],[300,210],[374,295]],[
    part('card','Samlet indholdsflade','En enkelt ramme samler kortets dele uden gentagne panelrammer.',R(135,70,330,290,C.plane)),
    part('heading','Kortets overskrift','En tydelig overskrift indleder indholdet.',L(170,116,358,116,C.ink,2)+L(170,145,430,145,C.edge)),
    part('body','Indhold','Et mindre motiv og to linjer reserverer plads til hovedindholdet.',R(170,177,64,64,C.context)+rows(256,189,[156,128,143],23)),
    part('footer','Afslutning','En kort handling placeres efter indholdet.',L(170,275,430,275,C.edge)+R(330,298,100,34,C.plane)+L(352,315,408,315,C.subject,2))]),
  stack:S('Tre selvstændige indholdsenheder følger samme lodrette strøm. Gentagne mellemrum, ikke en ekstra container, skaber sammenhæng.',[[300,105],[300,210],[300,315]],[
    part('items','Direkte indholdsenheder','Tre forskellige indholdshøjder bevarer deres egne grænser.',R(170,65,260,60,C.plane)+R(170,155,260,95,C.plane)+R(170,280,260,60,C.plane)+L(195,95,365,95)+rows(195,186,[190,145],28)+L(195,310,348,310)),
    part('gaps','Ens afstand mellem enheder','To identiske mål angiver stakkens gentagne mellemrum.',P('M466 125v30m-6-30h12m-12 30h12M466 250v30m-6-30h12m-12 30h12','none',C.edge,1)),
    part('flow','Lodret strøm','En enkel akse viser læseretningen uden at tilføje en ydre kortflade.',P('M131 65v275m-6-9 6 9 6-9','none',C.subject,1.5))]),
  divider:S('En præcis skillelinje opdeler to beslægtede tekstområder. Indholdet fortsætter på begge sider.',[[300,210],[160,139],[160,277]],[
    part('first-section','Første område','To linjer etablerer indhold før opdelingen.',rows(145,124,[300,225],31)),
    part('division','Semantisk opdeling','En enkel linje skaber en tydelig, rolig grænse.',L(115,210,485,210,C.subject,1.5)+L(115,202,115,218,C.edge)+L(485,202,485,218,C.edge)),
    part('second-section','Næste område','To nye linjer fortsætter efter grænsen.',rows(145,274,[275,185],31))]),
  'scroll-area':S('Et afgrænset udsnit viser noget af et længere indhold. En scrollbar ligger inden for rammen og markerer den synlige del.',[[295,190],[457,190],[295,313]],[
    part('viewport','Afgrænset udsnit','En stabil ramme indeholder det synlige område.',R(135,75,330,275,C.plane)),
    part('visible-content','Synligt indhold','Linjer mod den nederste kant viser, at indholdet fortsætter.',rows(166,116,[230,189,215,175,220,195,141],33)),
    part('scrollbar','Rulleposition','En indvendig skinne og en kort markør viser position, ikke en skyderværdi.',L(447,95,447,327,C.edge)+R(441,148,12,83,C.subject,'none')),
    part('continuation','Mere indhold','Små fortsættelsespunkter under udsnittet peger på indhold uden for visningen.',[280,300,320].map(x=>O(x,375,2,C.edge,'none')).join(''))]),
  'data-table':S('En datatabel har kolonneoverskrifter, rækker og læsbare celleværdier. En lille pil ved overskriften viser sortering.',[[165,117],[285,210],[443,117]],[
    part('table','Native tabelstruktur','En ydre ramme og et hoved adskiller kolonnenavne fra data.',R(85,80,430,270,C.plane)+R(86,81,428,63,C.context,'none')+P('M85 145H515M85 212H515M85 279H515M220 80V350M370 80V350','none',C.edge,1)),
    part('headers','Kolonneoverskrifter','Tre korte overskrifter giver data en stabil betydning.',L(110,113,190,113,C.ink,2)+L(245,113,339,113,C.ink,2)+L(394,113,461,113,C.ink,2)+down(487,113)),
    part('values','Celleværdier','Tre rækker holder læseteksten inden for deres kolonner.',[178,245,313].map((y,i)=>L(110,y,181-i*9,y)+L(245,y,333-i*13,y)+L(395,y,482-i*15,y)).join('')),
    part('sort','Sorteret kolonne','En enkelt farvet understregning knytter sorteringen til én kolonne.',L(393,132,493,132,C.subject,2))]),
  'data-grid':S('Et redigerbart datagrid skelner en markering fra den aktive celle. En indsætningsmarkør inde i cellen angiver redigering.',[[300,200],[443,200],[218,280]],[
    part('grid','Cellegrid','Et regelmæssigt grid etablerer en arbejdsflade med egentlige celler.',R(85,80,430,270,C.plane)+P('M85 145H515M85 212H515M85 279H515M220 80V350M370 80V350','none',C.edge,1)),
    part('range','Markeret område','Et tonet område samler flere celler uden at overtage den aktive celles kontur.',R(221,146,293,132,C.context,'none')+P('M220 212H515M370 145V279','none',C.edge,1)),
    part('active-cell','Aktiv celle','En særskilt indre kontur og markør angiver den celle, der redigeres.',R(374,149,137,59,C.plane)+L(391,179,449,179)+L(463,161,463,195,C.subject,2.5)),
    part('coordinates','Celler og koordinater','Andre værdier og to kantmarkører fastholder gridets akser.',L(110,115,183,115)+L(245,115,333,115)+L(395,115,471,115)+L(110,180,183,180)+L(110,312,179,312)+L(245,312,329,312)+dot(220,367)+dot(67,145))]),
  avatar:S('Et enkelt portræt bevarer sin egen afgrænsning og sit navn. To initialstreger under portrættet antyder en læsbar fallback.',[[300,155],[300,250],[300,330]],[
    part('identity-frame','Personens ramme','En enkelt rund ramme adskiller én identitet fra en gruppe.',O(300,190,112,C.plane)),
    part('portrait','Portræt','Hoved og skuldre danner én genkendelig person.',O(300,157,31,C.subject,'none')+P('M243 257a57 57 0 0 1 114 0Z',C.context)),
    part('fallback','Navn og fallback','To korte streger reserverer plads til navn eller initialer.',L(253,329,347,329)+L(276,350,324,350,C.edge)+bracket(188,313,224))]),
  signature:S('Et lille afsendermærke ledsages af et navn og en diskret linkretning. Det er en kreditering, ikke en hovedhandling eller et nyt logo.',[[168,207],[313,197],[449,221]],[
    part('identity-mark','Afsendermærke','En neutral markør reserverer plads til en godkendt original.',R(120,157,90,90,C.plane)+P('M139 202h50M164 177v50','none',C.edge,1)+O(164,202,14,C.context)),
    part('name','Afsendernavn','Navnet står ved siden af mærket og har størst læsevægt.',L(239,187,420,187,C.ink,2.5)+L(239,217,365,217,C.edge)),
    part('credit-link','Krediteringslink','En diskret pil og fælles grundlinje viser sammenhæng og destination.',P('M431 229h34m-8-8 8 8-8 8','none',C.subject,1.5)+L(120,274,465,274,C.edge))]),
  'brand-mark':S('Et neutralt identitetsfelt står i en målt frizone. Grafikken reserverer plads til en godkendt original og forestiller ikke et bestemt brandlogo.',[[300,205],[190,95],[410,315]],[
    part('clear-space','Frizone','Åbne hjørner og mållinjer beskytter mærkets omgivelser.',P('M155 135V60H230M370 60H445V135M445 270V345H370M230 345H155V270','none',C.edge,1)+dim(190,365,220)),
    part('asset-area','Originalens felt','En tydelig ramme giver originalressourcen sin egen plads.',R(190,95,220,220,C.plane)),
    part('placeholder','Neutral identitetsmarkør','En enkel centrering uden bogstaver erstatter ikke en brandoriginal.',P('M255 170h90v70h-90ZM277 152v106M323 152v106','none',C.ink)+O(300,205,9,C.subject,'none'))]),
  text:S('Sammenhængende læsetekst vises som tre korte afsnit med en rolig linjelængde.',[[165,100],[165,210],[165,310]],[
    part('first-paragraph','Første afsnit','En løbende tekst har flere linjer og en kortere afslutning.',rows(145,95,[310,295,210],25)),
    part('second-paragraph','Næste afsnit','Et tydeligt mellemrum adskiller to tankeenheder.',rows(145,207,[300,310,235],25)),
    part('last-paragraph','Afslutning','Et sidste kort afsnit afslutter læserytmen.',rows(145,319,[310,185],25)),
    part('measure','Læsebredde','Et enkelt mål beskriver tekstens afgrænsede bredde.',P('M116 95h-10v249h10','none',C.edge,1))]),
  heading:S('En stor typografisk form indleder et indholdshierarki. De efterfølgende linjer træder tilbage i en klar, mindre skala.',[[215,177],[300,266],[300,313]],[
    part('heading','Overskriftens niveau','En stor, tydelig bogstavform etablerer første læseniveau.',T(143,206,'Aa',112)),
    part('hierarchy','Lavere niveauer','Kortere og lettere linjer følger overskriften i faldende vægt.',L(145,260,455,260,C.ink,2)+rows(145,304,[287,211],25,C.edge)),
    part('baseline','Typografisk grundlinje','En enkelt markør viser bogstavernes fælles baseline.',L(128,215,472,215,C.subject,1)+L(128,208,128,222,C.edge))]),
  label:S('En kort etiket navngiver et afgrænset område. En lille navneklamme gør dens tilknytning præcis uden en handlingsknap.',[[240,176],[300,255]],[
    part('name','Kort navn','En kompakt tekststreg har en selvstændig navnerolle.',L(170,168,390,168,C.ink,3)+L(170,188,310,188,C.edge)),
    part('attachment','Navngivet område','En klamme knytter navnet til et bestemt indholdsområde.',P('M145 145h-18v63h18M127 208v50h70','none',C.subject,1.5)),
    part('named-content','Indholdets plads','Et let felt står under etiketten uden at ligne en inputkontrol.',L(197,258,440,258,C.edge)+L(197,282,391,282,C.edge)+dot(197,258))]),
  tag:S('Et tekstmærke bærer en kategori. En afgrænset mærkatform og et lille fastgørelseshul adskiller mærkatet fra en statusmeddelelse.',[[180,205],[335,205]],[
    part('tag','Kategorimærke','En vinklet afslutning gør mærkatet til en selvstændig enhed.',P('M165 145H435L485 205 435 265H165Z',C.plane)),
    part('name','Kategoriens navn','Et kort navn står i den rolige hovedflade.',L(243,205,412,205,C.subject,2.5)),
    part('attachment','Fastgørelsespunkt','Et lille hul og en leder forklarer mærkets tilhørsforhold.',O(194,205,9,C.ground)+P('M185 205h-58v-71','none',C.edge,1))]),
  badge:S('Et kompakt statusmærke kombinerer en lille statuskerne med en tekstbetydning i samme lave flade.',[[210,205],[330,205]],[
    part('badge','Kompakt mærke','En lav, afgrænset silhuet gør status til en lille ledsager.',P('M165 160H435L460 205 435 250H165L140 205Z',C.plane)),
    part('status','Statuskerne','Et lille afgrænset tegn supplerer farven.',O(205,205,16,C.context)+P('m198 205 5 6 10-12','none',C.subject,2)),
    part('meaning','Tekstbetydning','En kort label forklarer status uden at kræve farvekendskab.',L(245,204,408,204)+dim(165,287,270))]),
  alert:S('En særskilt besked forbinder et advarselssymbol med titel og forklaring. Betydningen bæres af både form og tekst.',[[170,175],[340,150],[340,240]],[
    part('message','Afgrænset besked','En samlet indholdsflade giver beskeden sin egen grænse.',R(100,100,400,220,C.plane)+L(115,100,115,320,C.subject,3)),
    part('symbol','Beskedens hensigt','En trekant og et udråbstegn viser opmærksomhed uden at forudsætte en farvekode.',P('M174 142 209 204H139Z',C.context)+L(174,160,174,183,C.ink,2)+O(174,193,2,C.ink,'none')),
    part('message-heading','Titel','En tydelig titel indleder beskedens indhold.',L(241,151,444,151,C.ink,2.5)),
    part('explanation','Forklaring','En kort forklaring følger titlen.',rows(241,204,[217,184,142],29))]),
  toast:S('En kort meddelelse ligger ved kanten af en større kontekst. Tekst og en separat lukning bevares i den kompakte flade.',[[300,265],[454,263],[135,290]],[
    part('context','Arbejdet bag meddelelsen','To svage linjer viser en eksisterende kontekst.',rows(128,104,[300,235,270],36,C.edge)),
    part('toast','Kort meddelelse','En kompakt, vandret flade ligger nederst i arbejdsområdet.',R(95,210,410,105,C.plane)+L(95,210,95,315,C.subject,3)),
    part('text','Meddelelsens indhold','En kort titel og en forklarende linje holder teksten læsbar.',L(129,247,374,247,C.ink,2)+L(129,279,332,279)),
    part('dismiss','Eksplicit lukning','En separat lukning er adskilt fra selve meddelelsen.',L(424,229,424,296,C.edge)+cross(464,263,7))]),
  'instruction-note':S('En kort hjælpetekst står tæt ved det relevante indhold. Et lille informationspunkt understøtter vejledningen uden en stor beskedflade.',[[160,195],[310,195],[300,110]],[
    part('context','Relevant indhold','En kort kontur viser det indhold, vejledningen følger.',P('M155 93h290v43H155','none',C.edge,1)),
    part('marker','Vejledningspunkt','En lille navngiven informationsmarkør indleder hjælpen.',O(160,205,16,C.plane)+T(155,212,'i',19,C.subject)),
    part('instruction','Kort vejledning','To beskedne linjer forklarer det nærliggende indhold.',rows(203,196,[225,172],30)),
    part('proximity','Tilhørsforhold','En enkel forbindelsesakse viser hjælpetekstens placering ved indholdet.',P('M135 136v89h10','none',C.edge,1))]),
  'empty-state':S('En tom bakke viser fraværet af indhold. Et neutralt åbent felt og en afgrænset plusmarkering tilbyder en mulig begyndelse uden et fejlsignal.',[[300,185],[300,279],[300,349]],[
    part('empty-container','Tom beholder','En åben bakke reserverer en plads, hvor der endnu ikke ligger noget.',P('M135 221 164 301H436L465 221H356L337 242H263L244 221Z',C.plane)+P('M164 301v19h272v-19','none',C.edge,1)),
    part('absence','Fravær af indhold','En tom afgrænsning fremhæves frem for et fejl- eller advarselstegn.',R(247,110,106,83,'none',C.edge)+L(278,151,322,151,C.edge)),
    part('explanation','Forklaring','En kort navnelinje forklarer den tomme tilstand.',L(203,349,269,349)+L(330,349,397,349)),
    part('next-step','Mulig begyndelse','Et lille plus viser en frivillig vej til at tilføje indhold.',O(300,349,17,C.context)+plus(300,349,7))]),
  skeleton:S('Pladsholdere reserverer et portræt, tekstlinjer og brødtekst, mens rigtigt indhold mangler. Ingen del foregiver at være færdig tekst.',[[170,135],[340,135],[300,270]],[
    part('reserved-media','Reserveret billede','En neutral medieplads fastlåser det kommende layouts størrelse.',R(125,90,90,90,C.context,C.edge)),
    part('reserved-title','Reserverede tekstlinjer','To brede blokke reserverer plads til titel og metadata.',R(247,102,225,20,C.context,'none')+R(247,145,165,14,C.context,'none')),
    part('reserved-body','Reserveret indhold','Tre neutrale blokke står i stedet for endnu ikke indlæst indhold.',[235,275,315].map((y,i)=>R(125,y,[347,315,245][i],15,C.context,'none')).join('')),
    part('layout-measure','Layoutets stabilitet','En målelinje beskriver den reserverede indholdsbredde.',dim(125,364,347))]),
  spinner:S('En åben cirkulær bane angiver en aktivitet med ukendt slutværdi. Formen lover ingen procent eller afsluttende milepæl.',[[300,124],[383,220],[300,297]],[
    part('reference','Aktivitetens rum','Fire korte referencer afgrænser aktiviteten uden at måle en fuldendt værdi.',P('M300 72v22M300 314v22M168 204h22M410 204h22','none',C.edge,1)),
    part('orbit','Åben bane','En afbrudt cirkel viser vedvarende aktivitet frem for et fuldt mål.',P('M300 116a88 88 0 1 0 79 127','none',C.ink,1.5)),
    part('activity','Aktiv del','En kortere pigmentbue udpeger aktiviteten på banen.',P('M300 116a88 88 0 0 1 88 88','none',C.subject,7)+O(388,204,4,C.ground,'none')),
    part('unknown-end','Ingen kendt slutværdi','Et åbent endepunkt understreger den ukendte afslutning.',O(379,243,5,C.ground))]),
  'file-upload':S('En lokal dokumentfil vælges og lægges i en bakke. Der er ingen sky eller antydning af netoverførsel.',[[247,165],[390,235],[300,327]],[
    part('file','Lokal fil','Et dokument med foldet hjørne viser den fil, der vælges.',paper(175,75,150,205)+rows(198,145,[99,78,91],29,C.edge)),
    part('local-tray','Lokal samling','En afgrænset bakke holder det accepterede filvalg.',P('M130 301v45H470v-45M144 320H456','none',C.ink)),
    part('selection','Valg af fil','En nedadrettet pil fører filen til den lokale samling.',P('M390 153V278m-17-17 17 17 17-17','none',C.subject,2)),
    part('accepted-file','Valgt fil','En lille kvittering markerer et accepteret lokalt valg.',O(300,327,10,C.context)+P('m294 327 4 4 8-9','none',C.ink,1.5))]),
  'metric-row':S('En navngivet værdi har tydelig sammenhæng med sin enhed. En fælles grundlinje binder label og resultat sammen.',[[165,145],[314,233],[436,236]],[
    part('name','Målingens navn','En kort label navngiver nøgletallet.',L(135,119,310,119,C.ink,2)+L(135,145,243,145,C.edge)),
    part('value','Målt værdi','En stor talværdi er motivets hovedindhold.',T(216,251,'42',93,C.subject)),
    part('unit','Enhed','En mindre enhed hører direkte til talværdien.',T(348,250,'ms',27)),
    part('relationship','Navn og resultat','En fælles grundlinje og et knæk viser den semantiske tilknytning.',P('M135 166v118H465','none',C.edge,1)+dot(135,284))])
};

export const CATALOG_ANCHORS=Object.freeze(Object.fromEntries(Object.entries(scenes).map(([id,scene])=>[id,scene.anchors])));
export const CATALOG_MOTION=Object.freeze(Object.fromEntries(Object.entries(scenes).map(([id,scene])=>[id,scene.parts.map(({key},i)=>({key,start:.025+i*.145,end:Math.min(.96,.31+i*.145)}))])));
export const CATALOG_IDS=Object.freeze(Object.keys(scenes));

export function drawCatalog(motif,group){
  const scene=scenes[motif];
  if(!scene)return null;
  return {label:scene.label,body:scene.parts.map(({key,name,purpose,body})=>group(key,name,purpose,body)).join('')};
}
