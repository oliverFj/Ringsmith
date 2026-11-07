import { GRAPHIC_CATALOG_MOTIFS } from '../catalog.mjs';

const color = key => `var(--g-${key})`;
const P = (d, fill = 'subject', extra = '') => `<path d="${d}" fill="${color(fill)}" ${extra}/>`;
const L = (d, stroke = 'edge', width = 'var(--g-line-width)', extra = '') => `<path d="${d}" fill="none" stroke="${color(stroke)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const R = (x, y, w, h, fill = 'plane', extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color(fill)}" ${extra}/>`;
const C = (x, y, r, fill = 'subject', extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color(fill)}" ${extra}/>`;
const T = (text, x, y, size = 20, fill = 'ink') => `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="600" fill="${color(fill)}">${text}</text>`;
const windowFrame = (x, y, w, h, thickness = 15, fill = 'subject') => P(`M${x} ${y}h${w}v${h}h-${w}z M${x + thickness} ${y + thickness}h${w - 2 * thickness}v${h - 2 * thickness}h-${w - 2 * thickness}z`, fill, 'fill-rule="evenodd"');
const ring = (x, y, r, thickness = 14, fill = 'subject') => P(`M${x + r} ${y}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0z M${x + r - thickness} ${y}a${r - thickness} ${r - thickness} 0 1 1-${2 * (r - thickness)} 0a${r - thickness} ${r - thickness} 0 1 1 ${2 * (r - thickness)} 0z`, fill, 'fill-rule="evenodd"');
const bars = (x, y, widths, gap = 25, stroke = 'ink', weight = 2) => widths.map((w, i) => L(`M${x} ${y + i * gap}h${w}`, stroke, weight)).join('');
const plus = (x, y, size = 12, stroke = 'ground', weight = 3) => L(`M${x - size} ${y}h${2 * size}M${x} ${y - size}v${2 * size}`, stroke, weight);
const cross = (x, y, size = 5, stroke = 'ink', weight = 2) => L(`m${x - size} ${y - size} ${2 * size} ${2 * size}m0-${2 * size}-${2 * size} ${2 * size}`, stroke, weight);
const down = (x, y, stroke = 'ink') => L(`m${x - 7} ${y - 4} 7 8 7-8`, stroke, 2.5);
const right = (x, y, stroke = 'ink') => L(`m${x - 4} ${y - 7} 8 7-8 7`, stroke, 2.5);
const sheet = (x, y, w, h, fill = 'subject', fold = 33) => P(`M${x} ${y}h${w - fold}l${fold} ${fold}v${h - fold}h-${w}z`, fill) + L(`M${x + w - fold} ${y}v${fold}h${fold}`, 'ground', 2);
const sideMeasure = (x, top, bottom) => L(`M${x} ${top}V${bottom}M${x - 6} ${top}h12M${x - 6} ${bottom}h12`, 'edge', 1, 'opacity=".6"');
const g = (key, name, purpose, body, motion = {}) => ({ key, name, purpose, body, motion });
const back = (body, purpose = 'Et forskudt materialeplan gør forgrundens konstruktion tydelig.') => g('rear-plane', 'Bagplan', purpose, body, { x: -10, y: 4, depth: [4, 2.5] });
const guide = body => g('guides', 'Konstruktionsspor', 'Tilbagetrukne mål og forbindelser forklarer motivets forhold.', body, { start: .7, end: .93, y: 0, trace: true });
const textPart = (body, name = 'Indhold', purpose = 'Tekstspor giver formen et forståeligt indhold.') => g('content', name, purpose, body, { y: 0, trace: true });

function scene(label, groups, definitions = '') {
  const last = Math.max(1, groups.length - 1);
  return { label, definitions, groups: groups.map((item, index) => ({ ...item, motion: {
    start: .02 + index / last * .53, end: .35 + index / last * .55,
    x: 0, y: 11, trace: false, ...(index === 0 ? { depth: [1.5, .8] } : {}), ...item.motion
  } })) };
}

const drawings = {
  'list-item': () => scene('Tre vandrette poster danner en samlet rækkefølge. Den midterste har en tydelig materialekant, mens navn og beskrivelse forbliver samlet.', [
    back(R(136, 84, 340, 270, 'context')),
    g('collection', 'Samlingens poster', 'Tre selvstændige flader følger den samme faste rytme.', R(120, 72, 340, 78, 'plane') + R(120, 270, 340, 78, 'plane') + L('M120 150H460M120 348H460', 'edge', 1)),
    g('current', 'Aktuel post', 'En forskudt farvet flade og en mørk forkant udpeger præcis én post.', R(120, 181, 350, 78, 'ink') + R(120, 171, 350, 78, 'subject') + R(120, 171, 9, 78, 'counter'), { x: 12, y: -8, depth: [2, 1.2] }),
    textPart(L('M148 99h205M148 126h255M148 297h182M148 324h232', 'ink', 2) + L('M148 195h226', 'ground', 4) + L('M148 225h188', 'ground', 2), 'Titler og beskrivelser', 'Hver post har en bærende titel og en kortere supplerende linje.'),
    guide(sideMeasure(97, 72, 348))
  ]),
  button: () => scene('En solid trykflade med centreret label og synlig materialekant. En kontaktmarkør viser, hvor handlingen udløses.', [
    back(R(164, 171, 280, 96, 'context') + R(150, 161, 280, 96, 'ink')),
    g('cap', 'Trykflade', 'En samlet fysisk flade gør handlingens udløser tydelig.', R(150, 145, 280, 96, 'subject') + L('M150 241H430', 'ink', 2), { y: -14, depth: [.7, .4] }),
    textPart(L('M235 193h110', 'ground', 5), 'Knappens navn', 'Et centreret tekstspor navngiver handlingen.'),
    g('contact', 'Kontaktpunkt', 'Markøren beskriver aktivering uden at ændre fladens størrelse.', P('M380 241l14 37 8-14 16-5z', 'counter') + C(378, 242, 4, 'ink'), { x: 13, y: 18 }),
    guide(L('M150 295H430M150 289v12M430 289v12', 'edge', 1))
  ]),

  'action-button': () => scene('En opretstående værktøjsknap samler symbol, handlingsnavn og en lille genvej i én tydelig enhed.', [
    back(R(236, 92, 154, 254, 'context')),
    g('tool', 'Værktøjets flade', 'Den høje trykflade har plads til både symbol og navn.', R(216, 81, 154, 254, 'subject') + L('M216 335H370', 'ink', 2)),
    g('symbol', 'Handlingssymbol', 'Et enkelt indgraveret plus repræsenterer værktøjets kommando.', windowFrame(260, 115, 66, 66, 9, 'ground') + plus(293, 148, 11, 'ground'), { y: 0, start: .27, end: .61 }),
    textPart(bars(245, 229, [96, 65], 21, 'ground', 3), 'Handlingsnavn', 'Et navn følger symbolet og bærer knappens tilgængelige betydning.'),
    g('shortcut', 'Supplerende genvej', 'Et lille separat mærke er en genvej, ikke handlingens navn.', R(267, 282, 52, 25, 'counter') + L('M281 294h24', 'ink', 1.5), { y: 5 })
  ]),

  toolbar: () => scene('Fire forskellige værktøjer står i en fælles holder. En skillelinje opdeler to beslægtede handlingsgrupper.', [
    back(R(80, 259, 446, 24, 'context')),
    g('dock', 'Fælles holder', 'Én base gør de enkelte handlinger til en samlet gruppe.', P('M80 236h446v26H80z M104 236v-93h80v93z M206 236v-93h80v93z M322 236v-93h80v93z M424 236v-93h80v93z', 'ink')),
    g('first-tools', 'Første værktøjsgruppe', 'To selvstændige symboler deler placering og vægt.', R(104, 132, 80, 104, 'subject') + R(206, 132, 80, 104, 'counter') + plus(144, 184, 15, 'ground') + ring(246, 184, 20, 5, 'ink'), { y: 16 }),
    g('second-tools', 'Anden værktøjsgruppe', 'De øvrige værktøjer bevarer deres egne tydelige tegn.', R(322, 132, 80, 104, 'counter') + R(424, 132, 80, 104, 'subject') + L('M341 174h42M341 193h42M444 165h40v38h-40z', 'ground', 3), { y: 16 }),
    guide(L('M305 123v126M80 314H526', 'edge', 1.3))
  ]),

  link: () => scene('To udskårne kædeled griber ind i hinanden. Forbindelsen leder videre til et selvstændigt mål.', [
    back(P('M123 210h166v60H123zM311 154h166v60H311z', 'context')),
    g('first-link', 'Første kædeled', 'Et selvstændigt, åbent led gør forbindelsen konkret.', `<g transform="rotate(-15 240 210)">${windowFrame(133, 162, 205, 96, 21)}${L('M133 258H338', 'ink', 1.5)}</g>`, { x: -18, y: 0 }),
    g('second-link', 'Andet kædeled', 'Et komplementært led giver det første en destination.', `<g transform="rotate(-15 370 182)">${windowFrame(263, 134, 205, 96, 21, 'counter')}${L('M263 230H468', 'ink', 1.5)}</g>`, { x: 18, y: 0 }),
    guide(L('M150 313H452m-11-7 11 7-11 7', 'edge', 1.5))
  ]),

  input: () => scene('En enkelt udskåret tekstlinje rummer kort indhold og en tydelig indsætningsmarkør.', [
    back(R(124, 159, 378, 104, 'context')),
    g('field', 'Tekstkontrol', 'Et langt, lavt hulrum er beregnet til én fri tekstlinje.', windowFrame(104, 145, 378, 104, 19)),
    textPart(L('M148 197h139', 'ink', 3), 'Indtastet tekst', 'Et kort tekstspor bevarer plads til fortsat indtastning.'),
    g('caret', 'Indsætningsmarkør', 'En lodret markør skelner et tekstinput fra et rent valg.', L('M309 178v38', 'ink', 3), { x: -12, y: 0, start: .44, end: .78 }),
    guide(sideMeasure(518, 145, 249))
  ]),

  field: () => scene('Label, tekstkontrol og hjælp er samlet i én opbygning. En fælles sideklamme forklarer deres tilhørighed.', [
    back(R(127, 164, 365, 96, 'context')),
    g('label', 'Feltets label', 'Et særskilt navn står før kontrollen.', R(110, 93, 151, 27, 'ink'), { y: 0, trace: true }),
    g('field', 'Native kontrol', 'Den udskårne kontrol giver plads til selve værdien.', windowFrame(110, 150, 365, 96, 17) + L('M146 198h153M313 181v34', 'ink', 2.5)),
    textPart(bars(110, 287, [262, 182], 22, 'edge', 1.6), 'Hjælp og forklaring', 'Supplerende tekst står tæt på sin kontrol uden at blive dens navn.'),
    guide(L('M86 103H73V309h13', 'edge', 1.2))
  ]),

  textarea: () => scene('En rummelig tekståbning indeholder flere linjer. Et hjørnegreb viser, at feltet kan udvides.', [
    back(R(123, 112, 380, 223, 'context')),
    g('frame', 'Flerlinjeåbning', 'Et højt hulrum adskiller flerlinjetekst fra et enkelt tekstinput.', windowFrame(105, 98, 380, 223, 18)),
    textPart(bars(142, 148, [284, 242, 264, 172], 36, 'ink', 2.3)),
    g('resize', 'Udvidelsesgreb', 'Tre skrå spor beskriver et brugbart hjørnegreb.', L('m434 291 16-16m-5 16 16-16m-5 16 16-16', 'ink', 1.6), { x: -5, y: -5 }),
    guide(L('M105 355h380', 'edge', 1))
  ]),

  'number-input': () => scene('Et tal står i en præcis indfældning. To separate trinmarkører viser, at værdien kan øges eller mindskes.', [
    back(R(147, 147, 326, 125, 'context')),
    g('field', 'Talfelt', 'En samlet indfældning afgrænser den numeriske værdi.', windowFrame(128, 132, 326, 125, 18)),
    g('value', 'Numerisk værdi', 'En egentlig talform gør feltets databetydning tydelig.', T('24', 174, 216, 57), { y: 0 }),
    g('steppers', 'Trinvise ændringer', 'To afgrænsede symboler beskriver op og ned uden at ligne et frit tekstfelt.', R(359, 150, 77, 89, 'counter') + plus(397, 174, 9, 'ink', 2) + L('M388 215h18M359 194H436', 'ink', 1.8), { x: 10, y: 0 }),
    guide(L('M128 299H454M128 292v14M454 292v14', 'edge', 1))
  ]),

  select: () => scene('En lukket valgliste viser én valgt linje og en særskilt nedadrettet åbning. Bagved anes de øvrige muligheder.', [
    back(R(127, 170, 365, 88, 'context') + L('M132 278H461M139 294H454', 'edge', 1.5)),
    g('field', 'Valglistens ramme', 'En afgrænset indfældning viser ét aktuelt valg.', windowFrame(110, 154, 365, 88, 17)),
    textPart(L('M148 198H329', 'ink', 3), 'Aktuelt valg', 'Én tekstlinje står som det valgte element.'),
    g('toggle', 'Åbning til listen', 'En særskilt udskæring viser, at kontrollen åbner kendte muligheder.', R(389, 171, 69, 54, 'counter') + down(424, 198), { y: -7 }),
    guide(L('M110 123H267', 'edge', 1))
  ]),

  'choice-field': () => scene('En navngivet valgliste forbindes med både hjælp og en tydelig åbning til mulighederne.', [
    back(R(124, 159, 365, 90, 'context')),
    g('label', 'Valgets navn', 'Labelen navngiver, hvad de kendte muligheder handler om.', R(108, 93, 166, 25, 'ink'), { y: 0 }),
    g('control', 'Valgliste', 'En native-lignende indfældning viser én værdi med en nedadrettet åbning.', windowFrame(108, 145, 365, 90, 17) + L('M144 190H310', 'ink', 3) + R(390, 162, 66, 56, 'counter') + down(423, 190)),
    textPart(bars(108, 280, [277, 182], 24, 'edge', 1.6), 'Valgets hjælp', 'Hjælpen står efter kontrollen og uddyber valget.'),
    guide(L('M82 104H70V306h12', 'edge', 1.1))
  ]),

  combobox: () => scene('En skriveåbning og en filtreret liste deler samme akse. Markøren i tekstfeltet skelner søgning fra et almindeligt listevalg.', [
    back(R(118, 91, 382, 254, 'context')),
    g('query', 'Søgetekst', 'En tekstmarkør og et kort spor repræsenterer den indtastede filtrering.', windowFrame(101, 77, 382, 73, 14) + L('M138 113h105M258 98v30', 'ink', 2.4) + down(446, 114)),
    g('list', 'Filtrerede muligheder', 'En åben liste bevarer en synlig forbindelse til tekstfeltet.', windowFrame(101, 164, 382, 165, 12, 'ink') + R(122, 186, 340, 36, 'counter'), { y: -14 }),
    textPart(bars(155, 204, [205, 239, 170], 43, 'ink', 2) + C(137, 204, 4, 'ink'), 'Mulighedernes navne', 'Tre læsbare spor illustrerer filtrerede, selvstændige elementer.'),
    guide(L('M513 113v133h-14', 'edge', 1.1))
  ]),

  multiselect: () => scene('To udvalgte værdier ligger som selvstændige mærker i tekståbningen. Listen nedenunder rummer yderligere muligheder.', [
    back(R(112, 91, 398, 253, 'context')),
    g('input', 'Fælles indtastningsfelt', 'Én bred åbning rummer både de valgte mærker og fortsat filtrering.', windowFrame(94, 77, 398, 97, 14) + L('M434 112v28', 'ink', 2.5)),
    g('selected', 'Flere valgte værdier', 'To særskilte mærker med egne fjernelsestegn gør flervalg tydeligt.', R(120, 103, 132, 43, 'subject') + R(266, 103, 132, 43, 'counter') + L('M134 124h69M280 124h67', 'ground', 2) + cross(231, 124, 4, 'ground') + cross(377, 124, 4, 'ink'), { x: -11, y: 0 }),
    g('options', 'Flere muligheder', 'Listen er et separat sæt tilgængelige elementer, ikke en anden enkeltværdi.', R(108, 192, 369, 132, 'plane') + L('M109 193H477V324H109zM137 216l6 7 13-16M137 267h18', 'edge', 1.8) + bars(176, 218, [218, 171, 234], 38, 'ink', 2), { y: -10, trace: true }),
    guide(L('M94 355H492', 'edge', 1))
  ]),

  'date-picker': () => {
    const days = Array.from({ length: 28 }, (_, i) => R(174 + i % 7 * 35, 163 + Math.floor(i / 7) * 37, 11, 11, i === 10 ? 'ground' : 'edge')).join('');
    return scene('Et kalenderark samler uger i et fast gitter. En enkelt dato er udskåret som det aktuelle valg.', [
      back(R(145, 79, 314, 269, 'context')),
      g('calendar', 'Kalenderark', 'En samlet ramme giver de enkelte datoer deres kendte orden.', windowFrame(128, 65, 314, 269, 15) + R(143, 80, 284, 49, 'ink')),
      g('bindings', 'Kalenderens ophæng', 'To enkle ophæng og en månedsmarkering gør arket genkendeligt.', R(190, 49, 15, 42, 'counter') + R(366, 49, 15, 42, 'counter') + L('M236 104h99', 'ground', 3), { y: -12 }),
      g('chosen-date', 'Valgt dato', 'Én dato får et afgrænset felt uden at ændre kalenderens geometri.', R(270, 190, 31, 31, 'counter'), { y: 0, start: .43, end: .78 }),
      g('days', 'Dagenes gitter', 'Syv ens kolonner og fire rækker viser kalenderens tidslige opbygning.', days, { y: 0, start: .26, end: .64 }),
      guide(L('M128 365H442', 'edge', 1))
    ]);
  },

  'time-picker': () => {
    const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return L(`M${300 + Math.sin(a) * 81} ${200 - Math.cos(a) * 81}l${Math.sin(a) * 9} ${-Math.cos(a) * 9}`, 'edge', 1.5); }).join('');
    return scene('Et ur har et tydeligt centrum, to visere og et afgrænset tidsfelt. Motivet beskriver et valgt tidspunkt.', [
      back(C(314, 212, 114, 'context')),
      g('clock', 'Urets åbning', 'En cirkulær udskæring giver viserne et roligt rum.', ring(300, 200, 114, 17) + C(300, 200, 97, 'ground')),
      g('hours', 'Tidsinddeling', 'Tolv jævne markører gør cirklen til et ur.', ticks, { y: 0, trace: true }),
      g('hands', 'Valgt tidspunkt', 'Visernes fælles centrum viser en konkret tidsrelation.', L('M248 214L300 200V273', 'ink', 5) + C(300, 200, 7, 'counter'), { y: 0, start: .31, end: .72, trace: true }),
      g('time', 'Tidsfelt', 'En kompakt numerisk værdi knytter uret til et tidsinput.', R(226, 331, 148, 36, 'ink') + T('08:30', 255, 357, 23, 'ground'), { y: 7 })
    ]);
  },

  radio: () => scene('Tre lige store cirkulære valg deler en fælles gruppe. Kun den midterste kerne er fyldt.', [
    back(L('M108 92H92V322h16', 'edge', 1.2)),
    g('choices', 'Tre alternativer', 'Ens cirkulære åbninger viser gensidigt udelukkende muligheder.', [115, 205, 295].map(y => ring(164, y, 29, 7, 'subject')).join('')),
    g('selection', 'Enkelt valg', 'Én fyldt kerne betyder én valgt mulighed i gruppen.', C(164, 205, 12, 'counter'), { y: 0, start: .38, end: .72 }),
    textPart(bars(227, 115, [238, 198, 219], 90, 'ink', 3), 'Mulighedernes navne', 'Hver cirkel har sit eget læsbare indhold.'),
    guide(L('M227 143h141M227 233h170M227 323h121', 'edge', 1.2))
  ]),

  switch: () => scene('To ens kontakter viser til og fra. Positionen af den solide skyder, sammen med sporets fyld, bærer forskellen.', [
    back(R(117, 134, 212, 66, 'context', 'rx="33"') + R(117, 279, 212, 66, 'context', 'rx="33"')),
    g('tracks', 'Kontaktens spor', 'Samme kapselgeometri bevares i begge tilstande.', R(105, 119, 212, 66, 'subject', 'rx="33"') + R(105, 264, 212, 66, 'context', 'rx="33"') + L('M138 264h146a33 33 0 0 1 0 66H138a33 33 0 0 1 0-66', 'edge', 1.5)),
    g('on-thumb', 'Til-position', 'Den første skyder ligger ved sporets aktive ende.', C(282, 152, 25, 'ground'), { x: -78, y: 0, start: .29, end: .72 }),
    g('off-thumb', 'Fra-position', 'Den anden skyder bliver ved den modsatte ende.', C(140, 297, 25, 'ground'), { y: 0, start: .2, end: .48 }),
    textPart(L('M365 152h115M365 297h115', 'ink', 3), 'Indstillingernes navne', 'Et navn er knyttet til hver selvstændig indstilling.')
  ]),

  'range-field': () => scene('En grebbar skyder ligger i en kontinuerlig kanal. Værdien over grebet er forbundet med det aktuelle punkt.', [
    back(R(105, 222, 390, 20, 'context')),
    g('channel', 'Værdikanal', 'En sammenhængende kanal viser et interval frem for adskilte valg.', R(105, 206, 390, 20, 'ink') + R(105, 206, 207, 20, 'subject'), { y: 0 }),
    g('thumb', 'Skydergreb', 'Et afgrænset greb viser den værdi, som kan flyttes.', ring(312, 216, 31, 12, 'counter') + C(312, 216, 10, 'ground'), { x: -65, y: 0, start: .22, end: .73 }),
    g('value', 'Synlig værdi', 'En kort forbindelseslinje knytter tallet til grebet.', R(276, 116, 72, 47, 'subject') + T('64', 292, 149, 26, 'ground') + L('M312 163v20', 'ink', 1.5), { y: 6, start: .51, end: .83 }),
    guide(L('M105 260v13M183 260v8M261 260v8M339 260v8M417 260v8M495 260v13M105 304h148', 'edge', 1.5))
  ]),

  'segmented-control': () => scene('Tre ligeværdige segmenter ligger i én samlet holder. Midtersegmentets fyld gør det aktuelle indholdsvalg tydeligt.', [
    back(R(103, 158, 407, 114, 'context')),
    g('housing', 'Fælles segmentramme', 'Én samlet konstruktion binder alle tre valg sammen.', windowFrame(86, 144, 407, 114, 13, 'ink')),
    g('active-segment', 'Aktuelt indholdsvalg', 'Et indsat materialeplan fremhæver ét segment uden at ændre dets størrelse.', R(228, 157, 123, 88, 'counter'), { x: -18, y: 0, start: .29, end: .67 }),
    g('segments', 'Segmenternes navne', 'Lige store rum og skillelinjer bevarer valgenes samhørighed.', L('M222 157v88M357 157v88M126 201h65M258 201h64M391 201h64', 'ink', 2), { y: 0, trace: true }),
    guide(L('M86 302H493', 'edge', 1))
  ]),

  'segmented-option': () => scene('Ét udskåret segment er løftet frem fra en kompakt række. De tilstødende konturer gør det klart, at det er en mulighed i et fælles sæt.', [
    back(R(84, 254, 434, 22, 'context')),
    g('neighbours', 'Beslægtede muligheder', 'To tilbagetrukne konturer viser den omkringliggende valggruppe.', windowFrame(84, 151, 132, 103, 10, 'context') + windowFrame(386, 151, 132, 103, 10, 'context')),
    g('option', 'Det enkelte segment', 'Én selvstændig trykflade er motivets bærende mulighed.', R(235, 124, 132, 130, 'subject') + C(301, 162, 14, 'ground') + L('M257 214h88', 'ground', 3), { y: 17 }),
    guide(L('M107 202h84M409 202h84M84 305H518', 'edge', 1.5))
  ]),

  tabs: () => scene('Tre faner ligger over et fælles indholdspanel. Den valgte fane er fysisk forbundet med det synlige indhold.', [
    back(R(100, 156, 414, 177, 'context')),
    g('inactive-tabs', 'Øvrige faner', 'To roligere konturer er alternative indgange til samme panel.', windowFrame(242, 91, 112, 65, 11, 'context') + windowFrame(370, 91, 112, 65, 11, 'context')),
    g('selected-panel', 'Valgt fane og panel', 'En ubrudt silhuet viser, hvilken fane der ejer det aktuelle indhold.', P('M84 77h142v65h270v174H84z M106 171h368v123H106z', 'subject', 'fill-rule="evenodd"') + L('M111 108h87', 'ground', 3)),
    textPart(bars(133, 203, [262, 221, 237], 32, 'ink', 2)),
    guide(L('M270 122h55M399 122h55', 'edge', 1.5))
  ]),

  breadcrumb: () => scene('Tre navngivne led beskriver vejen til den aktuelle side. Små chevrons adskiller niveauerne; kun det sidste led er aktuelt.', [
    back(L('M77 268H518', 'edge', 1, 'opacity=".55"')),
    g('ancestor', 'Øverste niveau', 'Et understreget navn viser et reelt, tidligere navigationsmål.', R(82, 163, 116, 59, 'context') + L('M101 191h77M101 208h77', 'ink', 2)),
    g('parent', 'Nærmeste overordnede', 'Det næste navngivne led bevarer samme navigationslogik.', R(247, 163, 116, 59, 'counter') + L('M266 191h77M266 208h77', 'ink', 2), { x: -10, y: 0 }),
    g('current', 'Aktuel side', 'En solid afslutning er den aktuelle destination, ikke et gennemført måletrin.', R(412, 163, 116, 59, 'subject') + L('M431 191h77', 'ground', 3), { x: -10, y: 0 }),
    g('separators', 'Niveauadskillelse', 'To chevrons beskriver hierarki mellem navngivne led.', right(221, 192) + right(387, 192), { y: 0, trace: true })
  ]),

  pagination: () => scene('Lige store sidemærker ligger mellem forrige og næste. Ét af de nummererede felter er markeret som den aktuelle side.', [
    back(R(113, 264, 374, 18, 'context')),
    g('pages', 'Sider i resultatsættet', 'Ens ark viser en afgrænset række af destinationer.', [122, 207, 292, 377].map(x => windowFrame(x, 143, 66, 113, 10, 'context')).join('')),
    g('current', 'Aktuel side', 'Et fyldt felt fremhæver den side, der er åben nu.', R(292, 143, 66, 113, 'subject') + T('3', 314, 211, 33, 'ground'), { y: 13 }),
    g('numbers', 'Sidetal', 'Numre og udeladelse adskiller paginering fra en hierarkisk sti.', T('1', 144, 211, 33) + T('2', 229, 211, 33) + T('…', 395, 211, 27), { y: 0 }),
    g('previous-next', 'Forrige og næste', 'To modsatrettede pile forbinder siderne i rækkefølge.', L('m83 188-12 12 12 12M71 200h27m418 0h68m-12-12 12 12-12 12', 'ink', 2), { y: 0, trace: true })
  ]),

  navigation: () => scene('Tre understregede links har en fælles akse. Den aktuelle destination åbner et selvstændigt indholdsfelt ved siden af.', [
    back(R(339, 121, 165, 207, 'context')),
    g('links', 'Navigationens links', 'Understregede tekstspor beskriver destinationer frem for programkommandoer.', bars(97, 137, [164, 143, 154], 73, 'ink', 4) + L('M97 152h164M97 225h143M97 298h154', 'edge', 1.2), { x: -10, y: 0, trace: true }),
    g('current-link', 'Aktuelt navigationsmål', 'En lille udskåret markør udpeger det åbne område.', R(77, 185, 10, 45, 'subject') + right(278, 210), { x: -8, y: 0 }),
    g('destination', 'Åbnet indhold', 'Et særskilt vindue gør navigationens resultat konkret.', windowFrame(323, 105, 165, 207, 16) + bars(356, 155, [96, 77, 85], 34, 'ink', 2)),
    guide(L('M293 210h30', 'edge', 1.5))
  ]),

  menubar: () => scene('En vedvarende menulinje har flere kommandoindgange. Én åbner en afgrænset menu nedenunder uden at være en indholdsfane.', [
    back(R(84, 119, 440, 37, 'context')),
    g('bar', 'Vedvarende kommandolinje', 'En lang, samlet skinne er indgangen til programmets kommandoer.', R(76, 91, 440, 50, 'ink') + L('M103 116h74M375 116h91', 'ground', 3)),
    g('active-menu', 'Åben menuindgang', 'En afgrænset indgang forbinder linjen med en nedhængende menu.', R(217, 91, 124, 50, 'subject') + L('M238 116h75', 'ground', 3) + R(217, 151, 238, 159, 'subject') + R(233, 168, 206, 126, 'ground'), { y: -13 }),
    textPart(bars(259, 194, [144, 114, 139], 38, 'ink', 2), 'Programmets kommandoer', 'Tre adskilte spor beskriver handlinger i menuen.'),
    guide(L('M217 141v10M76 338H516', 'edge', 1.2))
  ]),

  menu: () => scene('En fritstående kommandotavle har grupper, en skillelinje og en fremhævet handling. Den indeholder kommandospor frem for formularfelter.', [
    back(R(174, 78, 280, 292, 'context')),
    g('panel', 'Kommandoflade', 'En samlet, opretstående ramme afgrænser et sæt handlinger.', windowFrame(157, 64, 280, 292, 14, 'ink')),
    g('active-command', 'Aktuel kommando', 'En solid række giver én handling et tydeligt tyngdepunkt.', R(181, 126, 232, 43, 'subject') + right(389, 147, 'ground'), { x: -10, y: 0 }),
    textPart(L('M183 97h89M205 147h139M205 192h160M205 269h134M205 311h169', 'ink', 2) + L('M205 147h139', 'ground', 2), 'Kommandoernes navne', 'Navngivne rækker bevarer en læsbar handlingsstruktur.'),
    g('grouping', 'Kommandogrupper', 'En skillelinje adskiller handlinger med forskelligt formål.', L('M181 227h232', 'edge', 1.2) + C(190, 192, 4, 'counter') + C(190, 269, 4, 'counter'), { y: 0, trace: true })
  ]),

  'menu-item': () => scene('Én navngivet kommando samler symbol, handlingsnavn, genvej og en pil til et muligt underniveau.', [
    back(R(105, 179, 408, 81, 'context')),
    g('row', 'Kommandorække', 'En enkelt lang række har en tydelig plads i en menu.', R(89, 163, 408, 81, 'subject') + L('M89 244H497', 'ink', 1.5)),
    g('symbol', 'Kommandosymbol', 'Et lille indgraveret tegn supplerer handlingens navn.', windowFrame(112, 185, 35, 35, 7, 'ground'), { y: 0 }),
    textPart(L('M173 203h136', 'ground', 4), 'Handlingsnavn', 'Navnet er den bærende oplysning i rækken.'),
    g('shortcut', 'Genvej og underniveau', 'To små genvejsfelter og en højrepil er supplerende signaler.', R(347, 186, 30, 34, 'counter') + R(383, 186, 30, 34, 'counter') + L('M355 203h14M391 203h14', 'ink', 1.5) + right(462, 203, 'ground'), { x: 8, y: 0 })
  ]),

  tree: () => scene('En fælles stamme forgrener sig til navngivne elementer på to niveauer. Indrykningen gør hierarkiet synligt.', [
    back(L('M118 119v165h91M118 201h91M241 311v30h88', 'edge', 2)),
    g('parent', 'Overordnet element', 'En enkelt åbning er indgangen til de underliggende grene.', R(94, 91, 197, 53, 'subject') + down(122, 118, 'ground') + L('M151 118h111', 'ground', 3)),
    g('children', 'Underordnede elementer', 'Forskudte rækker deler samme stamme og samme niveau.', windowFrame(209, 174, 224, 53, 10, 'counter') + L('M251 200h145', 'ink', 2) + windowFrame(209, 258, 224, 53, 10, 'counter') + L('M251 284h122', 'ink', 2), { x: -12, y: 0 }),
    g('leaf', 'Indlejret element', 'Et yderligere indryk viser et selvstændigt barn på næste niveau.', R(329, 320, 160, 42, 'context') + L('M350 341h117', 'ink', 2), { x: -12, y: 0 }),
    guide(L('M69 91v271M64 91h10M64 362h10', 'edge', 1))
  ]),

  card: () => scene('En solid indholdsflade har en særskilt overskrift, et rummeligt indholdsfelt og en handling i foden.', [
    back(R(163, 77, 291, 291, 'context')),
    g('frame', 'Kortets fælles flade', 'Én ydre konstruktion samler header, indhold og footer.', windowFrame(145, 62, 291, 291, 17)),
    g('header', 'Overskrift', 'En solid topbjælke navngiver kortets indhold.', R(162, 79, 257, 51, 'ink') + L('M187 105h163', 'ground', 3), { y: -9 }),
    textPart(bars(187, 173, [193, 160, 178], 34, 'ink', 2)),
    g('footer', 'Kortets handling', 'En afgrænset handling følger efter indholdet i samme enhed.', L('M162 283H419', 'edge', 1.1) + R(307, 302, 88, 28, 'counter') + L('M324 316h54', 'ink', 1.5), { y: 7 })
  ]),

  'field-group': () => scene('To formularfelter ligger under en fælles legend. En åben konstruktionsramme beskriver deres tilhørighed.', [
    back(R(117, 113, 386, 223, 'context')),
    g('group-frame', 'Fælles feltramme', 'En ramme med plads til legend samler felterne uden at gøre dem til én kontrol.', P('M96 95h57v14h-43v205h373V109H336V95h165v235H96z', 'subject')),
    g('legend', 'Gruppens navn', 'Et særskilt navnefelt afbryder den øverste kant.', R(167, 81, 153, 39, 'ink') + L('M185 100h117', 'ground', 3), { y: -6 }),
    g('fields', 'Beslægtede felter', 'To separate indfældninger bevarer egne labels og værdier.', windowFrame(144, 153, 309, 52, 10, 'counter') + windowFrame(144, 238, 309, 52, 10, 'counter') + L('M166 180h172M166 265h136', 'ink', 2), { y: 0 }),
    guide(L('M96 362h251', 'edge', 1))
  ]),

  alert: () => scene('Et markeret beskedfelt har en titel og en forklaring. Et tydeligt symbol supplerer farvefladen.', [
    back(R(98, 147, 429, 150, 'context')),
    g('message', 'Beskedens flade', 'En afgrænset flade giver orienteringen en fast plads i indholdet.', windowFrame(81, 131, 429, 150, 15, 'subject')),
    g('marker', 'Betydningsmarkør', 'Et udskåret udråbstegn bærer opmærksomheden uafhængigt af farve.', R(96, 146, 73, 120, 'counter') + R(128, 173, 9, 40, 'ink') + C(132.5, 232, 5, 'ink'), { y: 0, start: .25, end: .61 }),
    textPart(L('M199 173h219', 'ink', 4) + bars(199, 212, [253, 189], 23, 'ink', 1.8), 'Titel og forklaring', 'Et tydeligt hierarki skelner det væsentlige fra den uddybende tekst.'),
    guide(L('M81 320H510', 'edge', 1))
  ]),

  toast: () => scene('En kort besked ligger som en selvstændig slip ved arbejdsfladens kant. En lukning og et kort handlingsspor hører til meddelelsen.', [
    back(L('M66 298H536M66 312H536', 'edge', 1.2)),
    g('slip', 'Kort meddelelse', 'En lille løftet flade adskiller meddelelsen fra det igangværende arbejde.', R(167, 164, 337, 127, 'context') + R(151, 148, 337, 127, 'subject'), { x: 18, y: 10, depth: [2, 1.2] }),
    g('symbol', 'Meddelelsens mærke', 'Et lille punkt angiver en ny orientering uden at være en statusfarve.', C(183, 184, 11, 'counter'), { y: 0 }),
    textPart(L('M212 180h187M212 211h163M212 247h86', 'ground', 2.5), 'Besked og handling', 'Et kort navn, en forklaring og en underordnet handling holdes samlet.'),
    g('close', 'Lukning', 'En selvstændig lukkeindikator gør beskeden afsluttelig.', cross(460, 171, 5, 'ground', 2), { y: 0, trace: true })
  ]),

  'instruction-note': () => scene('En lille foldet seddel giver en kort vejledning tæt ved det indhold, den forklarer.', [
    back(P('M151 111h297v201H151z', 'context')),
    g('note', 'Vejledningens ark', 'Et let foldet hjørne gør hjælpen til et supplerende indholdslag.', sheet(134, 95, 297, 201, 'counter', 41)),
    g('marker', 'Vejledende tegn', 'Et enkelt informationstegn beskriver hjælp frem for en fejlstatus.', ring(179, 146, 19, 4, 'ink') + C(179, 138, 2, 'ink') + L('M179 146v11', 'ink', 2), { y: 0, trace: true }),
    textPart(bars(222, 144, [151, 167, 130, 150], 32, 'ink', 2), 'Kort vejledning', 'Få tekstspor giver en konkret forklaring.'),
    guide(L('M134 244H95v74h53', 'edge', 1.2) + C(148, 318, 4, 'subject'))
  ]),

  tooltip: () => scene('En kompakt tekstforklaring er forankret til en lille kontrol. Der er ingen formularfelter eller handlinger i hjælpen.', [
    back(R(209, 267, 181, 48, 'context')),
    g('trigger', 'Kontrol med forklaring', 'Et afgrænset tegn er den kontrol, hjælpen knytter sig til.', R(209, 255, 181, 48, 'subject') + L('M249 279h100', 'ground', 3)),
    g('bubble', 'Kort forklaring', 'En tæt tekstflade med en pegende åbning viser supplerende information.', P('M157 105h281v112H312l-16 21-16-21H157z', 'ink'), { y: 9, depth: [2, 1.3] }),
    textPart(bars(186, 147, [217, 164], 30, 'ground', 2.5), 'Hjælpens tekst', 'Kun korte tekstspor indgår i forklaringen.'),
    guide(L('M296 239v15', 'edge', 1.1) + C(296, 255, 4, 'counter'))
  ]),

  popover: () => scene('Et ikke-modalt panel med indhold og handling er forankret til en synlig udløser. Arbejdsfladen omkring det forbliver åben.', [
    back(L('M65 330H539', 'edge', 1.1)),
    g('trigger', 'Forankrende udløser', 'En synlig knap ejer panelets placering.', R(261, 295, 74, 42, 'counter') + plus(298, 316, 9, 'ink', 2)),
    g('panel', 'Supplerende panel', 'En udskåret flade har plads til både information og en handling.', windowFrame(157, 79, 312, 197, 15) + P('M282 276h32l-16 17z'), { y: 12, depth: [3, 1.8] }),
    textPart(bars(190, 123, [209, 169], 32, 'ink', 2.3)),
    g('action', 'Handling i panelet', 'En selvstændig handling adskiller panelet fra et rent værktøjstip.', R(335, 205, 100, 36, 'ink') + L('M356 223h58', 'ground', 2), { y: 7 }),
    guide(L('M298 279v16', 'edge', 1.2))
  ]),

  dialog: () => scene('En central dialog ligger tydeligt foran arbejdsfladen. Titel, lukning, indhold og to handlinger samles i ét afgrænset rum.', [
    back(R(70, 85, 462, 267, 'context') + bars(92, 118, [122, 164, 105], 36, 'edge', 1.2)),
    g('dialog-frame', 'Dialogens rum', 'En selvstændig forgrund adskiller dialogen fra arbejdet bagved.', R(130, 107, 358, 224, 'ink') + R(128, 106, 328, 194, 'ground') + windowFrame(113, 91, 358, 224, 15), { y: 18, depth: [2, 1] }),
    g('title-close', 'Titel og lukning', 'En tydelig titel og et eget kryds markerer dialogens afgrænsning.', R(128, 106, 328, 45, 'ink') + L('M152 128h186', 'ground', 3) + cross(432, 128, 5, 'ground'), { y: 0 }),
    textPart(bars(152, 186, [261, 214], 30, 'ink', 2)),
    g('actions', 'Dialogens handlinger', 'To forskellige fremhævelser giver et tydeligt handlingshierarki.', windowFrame(249, 258, 74, 30, 4, 'edge') + R(336, 258, 96, 30, 'counter') + L('M263 273h46M354 273h60', 'ink', 1.8), { y: 8 })
  ]),

  drawer: () => scene('Et sidepanel træder ind fra arbejdsfladens højre kant. Indholdet i panelet har sin egen overskrift og handling.', [
    back(R(70, 105, 440, 227, 'context')),
    g('workspace', 'Arbejde bag panelet', 'En del af den oprindelige flade er fortsat synlig ved siden af panelet.', windowFrame(70, 105, 440, 227, 12, 'edge') + bars(101, 149, [176, 139, 161], 37, 'edge', 1.5), { y: 0 }),
    g('drawer', 'Indgående sidepanel', 'En høj, selvstændig forgrund har en klar fælles sidekant.', R(336, 66, 184, 277, 'subject') + R(350, 80, 156, 248, 'ground') + L('M336 66V343', 'ink', 2), { x: 28, y: 0, depth: [2.5, 1] }),
    textPart(L('M371 115h94M371 159h106M371 195h83', 'ink', 2.5) + cross(487, 95, 4), 'Panelets indhold', 'Titel, lukning og to indholdsspor ligger i panelets egen ramme.'),
    g('action', 'Panelhandling', 'En afsluttende handling bliver i sidepanelets arbejdsområde.', R(383, 272, 100, 31, 'counter') + L('M402 288h61', 'ink', 1.8), { y: 6 })
  ]),

  inspector: () => scene('Et valgt objekt er forbundet med et separat detaljepanel. Panelets afsnit beskriver netop det markerede indhold.', [
    back(R(302, 79, 205, 279, 'context')),
    g('object', 'Valgt objekt', 'En kompakt, afgrænset figur er inspektionens genstand.', windowFrame(92, 143, 136, 136, 18) + C(160, 211, 29, 'counter'), { x: -9, y: 0 }),
    g('panel', 'Detaljepanel', 'Et opretstående panel har plads til titel, forklaring og afsnit.', windowFrame(285, 64, 205, 279, 15, 'ink') + R(300, 79, 175, 47, 'subject'), { x: 16, y: 0 }),
    textPart(L('M320 103h130', 'ground', 3) + bars(320, 158, [129, 95], 25, 'ink', 2) + L('M310 214h155M320 248h89M320 280h128', 'edge', 1.5), 'Beskrivelse og afsnit', 'Et titelhierarki og en skillelinje organiserer objektets egenskaber.'),
    g('selection-link', 'Valgets forbindelse', 'Et markeret knæk forbinder objektet direkte til detaljeområdet.', L('M228 211h27V164h30', 'ink', 1.8) + C(228, 211, 5, 'counter'), { y: 0, trace: true })
  ]),

  'data-table': () => scene('En læsetabel har tydelige kolonner, rækker og en fælles overskrift. En markeret række angiver et udvalg uden en redigeringsmarkør.', [
    back(R(99, 94, 420, 244, 'context')),
    g('table', 'Tabellens ramme', 'En enkelt samlet flade organiserer data i to retninger.', windowFrame(82, 78, 420, 244, 14, 'ink') + R(96, 92, 392, 43, 'subject')),
    g('selected-row', 'Valgt række', 'Et helt rækkefelt beskriver udvælgelse frem for celleredigering.', R(96, 196, 392, 51, 'counter'), { x: -11, y: 0 }),
    g('grid', 'Kolonner og rækker', 'Fælles justering og afgrænsninger gør indholdet til en semantisk tabel.', L('M96 142H488M96 194H488M96 247H488M96 297H488M191 92V308M319 92V308', 'edge', 1.2), { y: 0, trace: true }),
    textPart(L('M116 115h52M215 115h75M344 115h101', 'ground', 2.3) + [169, 221, 274].map(y => L(`M119 ${y}h49M215 ${y}h68M344 ${y}h105`, 'ink', 2)).join(''), 'Tabeldata', 'Gentagne læsbare spor har samme placering under deres kolonneoverskrifter.')
  ]),

  'data-grid': () => scene('Et redigerbart gitter skelner en markeret cellegruppe fra den aktive indtastningscelle. En markør står i den aktive celle.', [
    back(R(101, 95, 420, 244, 'context')),
    g('grid-frame', 'Gitterets struktur', 'En fælles ramme holder cellernes rumlige relation stabil.', windowFrame(84, 79, 420, 244, 14, 'ink') + R(98, 93, 392, 42, 'subject')),
    g('range-selection', 'Uafhængig markering', 'Et samlet område dækker flere celler og er forskelligt fra den aktive position.', R(194, 189, 248, 108, 'context') + L('M194 189H442V297H194z', 'edge', 2), { y: 0 }),
    g('active-cell', 'Aktiv redigeringscelle', 'En enkelt celle har en tydelig ramme og en tekstmarkør.', R(194, 189, 124, 54, 'counter') + L('M194 189H318V243H194zM267 204v25', 'ink', 2.5) + T('24', 217, 228, 23), { x: -8, y: 0 }),
    g('cell-lines', 'Cellernes grænser', 'En fælles gitterstruktur bevarer den regelmæssige navigation.', L('M98 135H490M98 189H490M98 243H490M98 297H490M194 93V309M318 93V309M442 93V309', 'edge', 1), { y: 0, trace: true }),
    textPart(L('M117 113h53M214 113h80M340 113h78', 'ground', 2) + L('M117 164h53M215 164h61M341 164h76M117 217h53M341 217h76M117 270h53M215 270h61M341 270h76', 'ink', 1.8), 'Data og overskrifter', 'Indholdet forbliver under sine kolonneoverskrifter under redigering.')
  ]),

  avatar: () => scene('En individuel persons silhuet er skåret ud af et opretstående portrætfelt. Et lille initialmærke beskriver en billedfallback.', [
    back(R(220, 79, 184, 265, 'context')),
    g('portrait', 'Portrætfelt', 'Én stor udskæring repræsenterer én person frem for en gruppe.', R(202, 63, 184, 265, 'subject') + C(294, 144, 31, 'ground') + P('M237 265v-28a57 57 0 0 1 114 0v28z', 'ground')),
    g('initials', 'Læselig fallback', 'Et afgrænset initialmærke er et alternativ til et manglende billede.', R(311, 299, 99, 51, 'counter') + T('AB', 337, 334, 25), { x: 12, y: 0 }),
    guide(L('M202 369H386M179 63V328', 'edge', 1.1))
  ]),

  badge: () => scene('Et kompakt status- eller kategorimærke sidder på kanten af en indholdsflade. Tegn og tekstspor bærer markeringen sammen.', [
    back(R(133, 123, 316, 195, 'context') + bars(163, 160, [129, 197, 158], 43, 'edge', 1.4)),
    g('badge', 'Kompakt markering', 'Et lille solidt mærke kan beskrive status eller kategori uden at være en handling.', P('M305 91h177v87H305l-22-43z') + L('M305 178H482', 'ink', 1.5)),
    g('symbol', 'Betydningsbærende tegn', 'Et lille udskåret symbol supplerer tekstens betydning uden at afhænge af farve.', C(322, 135, 10, 'ground'), { y: 0 }),
    textPart(L('M347 135h105', 'ground', 3), 'Mærkets tekst', 'En kort tekst står som kategori eller status.'),
    guide(L('M133 351H449', 'edge', 1))
  ]),

  tag: () => scene('En udskåret mærkat har et fysisk fæstne og et selvstændigt tekstfelt. Et lille kryds repræsenterer valgfri fjernelse.', [
    back(P('M147 166l54-43h271v133H201l-54-43z', 'context')),
    g('ticket', 'Mærkatens flade', 'En tydelig billetform skelner kategorien fra et almindeligt indholdskort.', P('M130 151l54-43h271v133H184l-54-43z') + C(175, 174, 13, 'ground'), { x: -12, y: 0 }),
    g('label', 'Kategoriens navn', 'En kort, rolig tekstlinje er mærkatens primære indhold.', L('M218 174h144', 'ground', 4), { y: 0, trace: true }),
    g('remove', 'Separat fjernelse', 'Et lille adskilt kryds repræsenterer en valgfri handling.', R(390, 142, 44, 64, 'counter') + cross(412, 174, 6, 'ink'), { y: 0 }),
    guide(L('M175 174H97v123h40', 'edge', 1.2))
  ]),

  signature: () => scene('Et neutralt originalfelt og en kort navnelinje står på fælles bund. Motivet angiver afsenderkreditering uden at genskabe et bestemt logo.', [
    back(R(116, 180, 365, 76, 'context')),
    g('original', 'Plads til godkendt original', 'Et tomt, velafgrænset mærkefelt repræsenterer den originale afsenderressource.', windowFrame(100, 144, 104, 104, 16) + L('M126 170h52v52h-52z', 'edge', 1.2)),
    g('name', 'Afsenderens navn', 'En navnelinje følger originalen og deler dens grundlinje.', L('M236 183h245M236 218h174', 'ink', 3.5), { x: -10, y: 0, trace: true }),
    guide(L('M100 280H481M100 273v14M204 273v14M236 273v14M481 273v14', 'edge', 1.2))
  ]),

  'brand-mark': () => scene('Et neutralt LOGO-felt ligger inden for faste proportions- og frizonemål. Det er en pladsholder for en godkendt original, ikke et nyt brandmærke.', [
    back(R(174, 106, 272, 207, 'context')),
    g('asset-window', 'Originalens billedfelt', 'En tydelig udskæring er reserveret til en originalressource med egne proportioner.', windowFrame(158, 91, 272, 207, 17)),
    g('placeholder', 'Neutral originalplads', 'Et typografisk pladsholderord undgår at opfinde eller efterligne et eksisterende logo.', T('LOGO', 214, 209, 37, 'ink'), { y: 0 }),
    g('clear-space', 'Reserveret frizone', 'Fire hjørnemål beskriver luft omkring originalen.', L('M132 125V65h60M396 65h60v60M456 264v60h-60M192 324h-60v-60', 'edge', 1.3), { y: 0, trace: true }),
    guide(L('M158 355H430M158 348v14M430 348v14', 'edge', 1))
  ]),

  heading: () => scene('En stor typografisk form står foran to roligere tekstlinjer. Størrelse og vægt skaber et tydeligt indholdsniveau.', [
    back(R(137, 272, 339, 15, 'context')),
    g('heading', 'Tydeligt overskriftsniveau', 'To store bogstavformer bærer det typografiske hierarki.', T('Aa', 145, 236, 126), { y: 14 }),
    textPart(bars(148, 309, [294, 222], 27, 'edge', 2), 'Underordnet læsetekst', 'To mindre tekstspor gør størrelsesforskellen meningsfuld.'),
    guide(sideMeasure(107, 117, 238) + L('M145 88h103', 'edge', 1.2))
  ]),

  text: () => scene('En sammenhængende blok af læselinjer har rolig rytme og varierede linjelængder. Motivet viser tekst frem for interaktiv betjening.', [
    back(L('M105 104V319M99 104h12M99 319h12', 'edge', 1.1)),
    g('opening', 'Tekstens begyndelse', 'En lidt kraftigere første linje viser, hvor læsningen starter.', L('M143 118h309', 'ink', 5), { x: -12, y: 0, trace: true }),
    g('paragraph', 'Sammenhængende læsetekst', 'Ens linjeafstand og forskellige længder skaber et genkendeligt afsnit.', bars(143, 166, [334, 281, 315, 202], 43, 'ink', 2.6), { x: -10, y: 0, trace: true }),
    guide(L('M143 355H477', 'edge', 1))
  ]),

  label: () => scene('En lille etiket navngiver et større indholdsområde. Et præcist fæstne viser, hvad navnet hører til.', [
    back(R(151, 189, 306, 121, 'context')),
    g('area', 'Navngivet indhold', 'En rolig, åben flade er det område, etiketten beskriver.', windowFrame(134, 173, 306, 121, 13, 'counter') + bars(166, 224, [217, 163], 30, 'edge', 2)),
    g('label', 'Kort etiket', 'En kompakt tekstflade giver indholdet et forståeligt navn.', R(166, 102, 186, 43, 'ink') + L('M187 123h144', 'ground', 3), { y: 9 }),
    g('attachment', 'Navnets tilhørighed', 'Et fast anker viser forbindelsen fra etiket til indhold.', L('M259 145v28', 'ink', 1.8) + C(259, 173, 4, 'subject'), { y: 0, trace: true })
  ]),

  'metric-row': () => scene('Et kort navn står over en stor numerisk værdi. En afstemt sideflade giver plads til enhed eller sammenhæng.', [
    back(R(162, 292, 286, 16, 'context')),
    g('name', 'Nøgletallets navn', 'En kort etiket forklarer, hvad værdien handler om.', L('M161 108h194', 'ink', 3), { y: 0, trace: true }),
    g('value', 'Tydelig værdi', 'En stor talform er et faktisk resultat, ikke et dekorativt diagram.', T('42', 163, 268, 127), { y: 14 }),
    g('context', 'Enhed og sammenhæng', 'En lodret afgrænsning samler supplerende information ved værdien.', L('M359 159v125M385 190h85M385 219h63M385 248h79', 'edge', 2), { x: 9, y: 0, trace: true }),
    guide(L('M162 337H448', 'edge', 1))
  ]),

  divider: () => scene('To beslægtede indholdsområder adskilles af én tydelig tværgående linje. Afstand viser grupperingen omkring den.', [
    g('first-section', 'Første indholdsafsnit', 'Tre relaterede tekstspor danner ét område.', bars(144, 92, [284, 232, 257], 31, 'ink', 2.4), { y: -7 }),
    g('divider', 'Semantisk opdeling', 'En enkelt solid grænse opdeler indholdet uden ekstra panelrammer.', R(103, 201, 394, 9, 'subject'), { x: -18, y: 0, start: .25, end: .64 }),
    g('second-section', 'Andet indholdsafsnit', 'Et nyt sæt tekstspor får sin egen rolige rytme efter opdelingen.', bars(144, 268, [263, 217, 279], 31, 'ink', 2.4), { y: 7 }),
    guide(L('M80 182v48M74 182h12M74 230h12', 'edge', 1.1))
  ]),

  stack: () => scene('Tre lige store indholdsslabber står lodret med samme luft imellem. En sideklamme gør stakkens fælles afstand synlig.', [
    back(R(158, 101, 297, 51, 'context') + R(158, 189, 297, 51, 'context') + R(158, 277, 297, 51, 'context')),
    g('first', 'Første indholdsenhed', 'En selvstændig slabbe ejer sit eget indhold.', R(142, 86, 297, 51, 'subject') + L('M167 111h194', 'ground', 2.5)),
    g('second', 'Anden indholdsenhed', 'Samme format følger efter med ens ydre afstand.', R(142, 174, 297, 51, 'counter') + L('M167 199h155', 'ink', 2.5)),
    g('third', 'Tredje indholdsenhed', 'En tredje enhed bevarer den samme rytme.', R(142, 262, 297, 51, 'subject') + L('M167 287h213', 'ground', 2.5)),
    guide(L('M111 86H96V313h15M96 137h15M96 174h15M96 225h15M96 262h15', 'edge', 1.3))
  ]),

  spinner: () => scene('Et koncentrisk materialeplan bærer et åbent aktivitetsspor. Præcise kanter og et kort indlæg på samme bue samler motivet uden et procenttal.', [
    g('rear-plane', 'Koncentrisk materialeplan', 'En samlet ring har samme centrum som forgrunden og giver den lige meget plads på begge sider.', `<circle cx="300" cy="210" r="101" fill="none" stroke="${color('context')}" stroke-width="36"/>`, { y: 0 }),
    g('orbit', 'Materialets konturer', 'To præcise kanter følger materialets indre og ydre radius omkring det samme centrum.', [83, 119].map(r => `<circle cx="300" cy="210" r="${r}" fill="none" stroke="${color('edge')}" stroke-width="1.2"/>`).join(''), { y: 0, trace: true }),
    g('activity', 'Åbent aktivitetsspor', 'En solid bue med en fri kvartåbning viser aktivitet uden at angive en slutværdi.', `<path d="M300 109a101 101 0 1 1-101 101" fill="none" stroke="${color('subject')}" stroke-width="24" stroke-linecap="butt"/>`, { y: 0, trace: true }),
    g('accent', 'Indlagt modfarve', 'Et kort indlæg afslutter selve buen og tilføjer ingen løs cirkel eller ekstra destination.', `<path d="M201.207 230.999a101 101 0 0 1-2.207-20.999" fill="none" stroke="${color('counter')}" stroke-width="24" stroke-linecap="butt"/>`, { y: 0, trace: true }),
    guide(L('M248 359h104', 'edge', 1.5))
  ]),

  skeleton: () => scene('En tom portrætreservation og tre tekstreservationer fylder en kendt indholdsstruktur. Motivet har endnu ingen person eller læsetekst.', [
    back(R(115, 132, 392, 163, 'context')),
    g('frame', 'Reserveret indholdsområde', 'En fælles konstruktion bevarer pladsen, mens indhold mangler.', windowFrame(98, 116, 392, 163, 12, 'edge')),
    g('portrait-space', 'Billedreservation', 'En ren cirkel reserverer et billede uden at påstå en personidentitet.', C(170, 197, 42, 'context'), { y: 0, start: .19, end: .57 }),
    g('text-spaces', 'Tekstreservationer', 'Faste felter reserverer kommende linjers placering og bredde.', R(240, 151, 209, 17, 'context') + R(240, 188, 174, 17, 'context') + R(240, 225, 194, 17, 'context'), { y: 0 }),
    guide(L('M98 321H490M98 314v14M490 314v14', 'edge', 1))
  ]),

  'empty-state': () => scene('Et ubesat indholdsrum står åbent over en solid bund. Et lille plus viser muligheden for at begynde uden at fylde tomrummet med falske data.', [
    back(P('M143 213h314v97H143z', 'context')),
    g('empty-room', 'Tomt indholdsrum', 'Et stort aktivt hulrum gør fraværet af indhold synligt.', windowFrame(126, 104, 314, 190, 16, 'edge') + P('M126 294h314v22H126z')),
    g('beginning', 'Mulig begyndelse', 'En lille særskilt handling giver et næste skridt uden at ligne eksisterende indhold.', R(249, 154, 68, 68, 'counter') + plus(283, 188, 13, 'ink', 3), { y: 8, start: .31, end: .72 }),
    textPart(L('M184 353h198', 'ink', 2.5), 'Forklaring', 'Et enkelt tekstspor er den forklaring, der ledsager det tomme område.')
  ]),

  'file-upload': () => scene('Et lokalt dokument står over en modtagende bakke. En opadrettet markør beskriver filvalg uden en sky- eller servermetafor.', [
    back(P('M102 284h396v52H102z', 'context')),
    g('tray', 'Lokal filbakke', 'En tydelig modtagende åbning beskriver filvælgerens lokale område.', P('M83 262h99v18h-80v36h396v-36h-80v-18h99v73H83z', 'ink')),
    g('file', 'Valgt dokument', 'Et foldet ark repræsenterer en fil med egne oplysninger.', sheet(190, 62, 193, 184, 'subject', 38) + bars(219, 116, [105, 123, 82], 29, 'ground', 2.2), { y: -15 }),
    g('selection', 'Filvalgets retning', 'En opadrettet pil knytter dokumentet til den lokale åbning.', L('M286 304v-76m-15 15 15-15 15 15', 'counter', 5), { y: 11, start: .39, end: .83, trace: true }),
    guide(L('M151 364h289', 'edge', 1.1))
  ]),

  'scroll-area': ({ prefix }) => {
    const clip = prefix + '-viewport';
    return scene('Et langt indhold passerer gennem en afgrænset åbning. En separat scrollbar viser, at der findes mere uden for udsnittet.', [
      back(R(141, 81, 322, 278, 'context')),
      g('viewport', 'Scrollområdets vindue', 'En fast ydre ramme afgrænser kun det synlige udsnit.', windowFrame(123, 65, 322, 278, 17)),
      g('content', 'Indhold i udsnittet', 'Fortsatte rækker over og under den synlige åbning antyder mere indhold.', `<g clip-path="url(#${clip})">${Array.from({ length: 9 }, (_, i) => R(160, 47 + i * 44, i % 2 ? 207 : 235, 19, i === 4 ? 'counter' : 'context')).join('')}</g>`, { y: 0, start: .2, end: .61 }),
      g('scrollbar', 'Lokal scrollbar', 'En afgrænset markør viser placering i et længere indhold.', R(416, 91, 10, 225, 'ink') + R(411, 151, 20, 75, 'counter'), { y: 0 }),
      guide(sideMeasure(486, 65, 343))
    ], `<defs><clipPath id="${clip}"><rect x="140" y="82" width="265" height="244"/></clipPath></defs>`);
  }
};

export const PASSAGE_CATALOG_IDS = Object.freeze(Object.keys(drawings));

function definition(motif, { prefix = 'passage-catalog' } = {}) {
  if (!Object.hasOwn(drawings, motif)) throw new RangeError('Ukendt Passage-katalogmotiv: ' + String(motif));
  return drawings[motif]({ prefix: String(prefix).replace(/[^a-zA-Z0-9_-]/g, '-') || 'passage-catalog' });
}

export function drawCatalog(motif, options) {
  const result = definition(motif, options);
  const name = GRAPHIC_CATALOG_MOTIFS.find(item => item.id === motif)?.name;
  return {
    body: result.definitions + result.groups.map(({ key, body }) => `<g data-part="${key}">${body}</g>`).join(''),
    viewBox: '0 0 600 420', label: (name ? name + '. ' : '') + result.label,
    parts: result.groups.map(({ key, name, purpose }) => ({ key, name, purpose }))
  };
}

export function catalogMotion(motif) {
  return definition(motif).groups.map(({ key, motion }) => ({ key, ...motion }));
}
