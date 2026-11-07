import {drawCatalog} from './lightroom-catalog.mjs';

export const meta = {
  "id": "lightroom",
  "name": "Lysrum",
  "description": "Milde rum, afstemte lyskanter og åbninger, der inviterer blikket ind. Formen forklarer relationen; lyset giver den nærvær.",
  "qualities": [
    "Mild",
    "Inviterende",
    "Sanselig"
  ]
};

const color = key => `var(--g-${key})`;
const part = (key, body) => `<g data-part="${key}">${body}</g>`;
const fill = (key, attributes = '') => `fill="${color(key)}"${attributes ? ' ' + attributes : ''}`;
const line = (d, key = 'edge', width = 'var(--g-line-width)', extra = '') => `<path d="${d}" fill="none" stroke="${color(key)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect = (x, y, w, h, key, radius = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ${fill(key)} ${extra}/>`;
const circle = (x, y, radius, key, extra = '') => `<circle cx="${x}" cy="${y}" r="${radius}" ${fill(key)} ${extra}/>`;
const depth = shape => `<g fill="${color('depth')}" opacity="var(--g-depth-opacity)">${shape}</g>`;
const frame = (x, y, w, h, radius = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="none" stroke="${color('edge')}" stroke-width="var(--g-line-width)"/>`;
const metadata = (key, name, purpose) => ({ key, name, purpose });

function result(label, definitions, groups) {
  return {
    body: definitions + groups.map(([description, geometry]) => part(description.key, geometry)).join(''),
    viewBox: '0 0 600 420',
    label,
    parts: groups.map(([description]) => description)
  };
}

function materials(prefix) {
  const wall = `${prefix}-wall`, glow = `${prefix}-glow`, sky = `${prefix}-sky`;
  return {
    wall, glow, sky,
    body: `<defs>
      <linearGradient id="${wall}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color('light')}"/><stop offset="1" stop-color="${color('context')}"/></linearGradient>
      <radialGradient id="${glow}" cx=".45" cy=".38" r=".7"><stop stop-color="${color('light')}"/><stop offset=".68" stop-color="${color('subject')}"/><stop offset="1" stop-color="${color('counter')}"/></radialGradient>
      <linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color('counter')}"/><stop offset="1" stop-color="${color('context')}"/></linearGradient>
    </defs>`
  };
}

function poster(prefix) {
  const m = materials(prefix);
  const opening = `${prefix}-opening`;
  const definitions = m.body.replace('</defs>', `<clipPath id="${opening}"><rect x="141" y="128" width="318" height="163"/></clipPath></defs>`);
  return result('Et mildt lysfelt ses gennem to afstemte rammer. Åbningen giver plads til ét roligt tyngdepunkt.', definitions, [
    [metadata('ground', 'Billedfelt', 'Et roligt, selvstændigt underlag omkring hele rummet.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('outer-frame', 'Ydre rum', 'Den første brede ramme inviterer blikket ind og fastlægger lysets retning.'),
      rect(76, 67, 448, 286, 'context', 2) + `<path d="M76 67H524L489 100H111V320L76 353Z" fill="url(#${m.wall})"/>` + frame(76, 67, 448, 286, 2)],
    [metadata('inner-frame', 'Indre rum', 'Et andet plan skaber dybde uden at gentage en fuld mørk ramme.'),
      rect(111, 100, 378, 220, 'ground') + `<path d="M111 100H489L459 128H141V291L111 320Z" ${fill('plane')}/>` +
      depth('<path d="M459 128L489 100V320H111L141 291H459Z"/>') + line('M141 128H459V291H141Z', 'edge', '1', 'opacity=".55"')],
    [metadata('light-field', 'Lysfelt', 'En blød, afgrænset lyskilde samler opmærksomheden nederst i åbningen.'),
      `<g clip-path="url(#${opening})"><path d="M178 291V256a122 122 0 0 1 244 0v35Z" fill="url(#${m.glow})"/></g>`],
    [metadata('sill', 'Lyskant og bund', 'Den lyse forkant gør forgrund og baggrund forståelige uden skygge alene.'),
      line('M141 291H459', 'light', '2') + `<path d="M141 293H459L489 320H111Z" ${fill('plane')}/>` + line('M111 320H489', 'edge', '1', 'opacity=".6"')]
  ]);
}

function focus(prefix) {
  const m = materials(prefix);
  return result('Et enkelt lysende felt har god plads i en rolig åbning. Rummet omkring viser, hvad der er vigtigt.', m.body, [
    [metadata('ground', 'Billedfelt', 'En rolig bund uden konkurrerende markeringer.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('recess', 'Afgrænset rum', 'En indrammet åbning holder motivet samlet.'),
      rect(116, 66, 368, 288, 'context', 3) + rect(137, 87, 326, 246, 'plane', 1) + frame(116, 66, 368, 288, 3)],
    [metadata('depth', 'Indre dybde', 'En diskret forskydning gør åbningen fysisk læselig.'),
      depth('<path d="M137 87H463V333H449V101H137Z"/>')],
    [metadata('light-field', 'Fokuseret lys', 'Et enkelt tyngdepunkt med klart afgrænset silhuet.'),
      `<circle cx="300" cy="209" r="83" fill="url(#${m.glow})"/>`],
    [metadata('sill', 'Forkant', 'En fin lyskant fastholder den fysiske relation omkring fokusfeltet.'), line('M138 333H462', 'light', '2')]
  ]);
}

function relation(prefix) {
  const m = materials(prefix);
  return result('To selvstændige, gennemlyste planer deler et lyst fælles areal. Overlappet viser en relation uden at opløse delene.', m.body, [
    [metadata('ground', 'Billedfelt', 'Fælles roligt rum til begge planer.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('first-plane', 'Første plan', 'Den første selvstændige del af relationen.'),
      rect(92, 80, 250, 234, 'context', 3) + frame(92, 80, 250, 234, 3) + line('M93 81H341', 'light', '2')],
    [metadata('second-plane', 'Andet plan', 'Den anden del møder den første med sin egen farve og placering.'),
      rect(258, 116, 250, 234, 'subject', 3) + frame(258, 116, 250, 234, 3)],
    [metadata('shared-field', 'Fælles areal', 'Et oplyst overlap viser, hvor de selvstændige planer bliver forbundne.'),
      rect(258, 116, 84, 198, 'light') + line('M258 116V314H342', 'edge', '1.2', 'opacity=".65"')],
    [metadata('edges', 'Lys og samling', 'Kanter bevarer begge deles form; ingen betydning afhænger kun af farven.'),
      line('M92 314H342V80', 'edge') + line('M258 350H508V116', 'edge') + line('M343 117H507', 'light', '1.5')]
  ]);
}

function rhythm(prefix) {
  const m = materials(prefix);
  const windows = [
    { x: 72, y: 130, key: 'first-window' },
    { x: 188, y: 92, key: 'second-window' },
    { x: 304, y: 130, key: 'third-window' },
    { x: 420, y: 92, key: 'fourth-window' }
  ];
  return result('Fire ligeværdige lysåbninger gentager samme form i en rolig, skiftende rytme.', m.body, [
    [metadata('ground', 'Billedfelt', 'En fælles bund gør mellemrum og gentagelse tydelige.'), rect(0, 0, 600, 420, 'ground')],
    ...windows.map((window, index) => {
      const { x, y, key } = window;
      return [metadata(key, `Lysåbning ${index + 1}`, 'Et selvstændigt gentaget modul med samme form og areal som de øvrige.'),
        `<path d="M${x} ${y + 185}V${y + 46}a46 46 0 0 1 92 0v139Z" ${fill('context')}/>` +
        `<path d="M${x + 11} ${y + 174}V${y + 46}a35 35 0 0 1 70 0v128Z" fill="url(#${m.glow})"/>` +
        line(`M${x} ${y + 185}V${y + 46}a46 46 0 0 1 92 0v139Z`, 'edge') + line(`M${x + 11} ${y + 174}h70`, 'light', '2')];
    })
  ]);
}

function accordion(prefix) {
  const m = materials(prefix);
  return result('En afdækning løftes fra en bred åbning og afslører et roligt indholdsrum. To lukkede rækker bliver stående nedenunder.', m.body, [
    [metadata('ground', 'Billedfelt', 'Selvstændigt underlag for den illustrerede udfoldning.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('recess', 'Åbent indholdsrum', 'Et indfældet felt gør pladsen til afsløret indhold fysisk læselig.'),
      rect(117, 121, 366, 146, 'context', 6) + rect(131, 135, 338, 117, 'plane', 2) + frame(117, 121, 366, 146, 6) +
      depth('<path d="M131 135H469V252H457V147H131Z"/>')],
    [metadata('content', 'Afsløret indhold', 'Tre rolige tekstspor viser, hvad åbningen giver adgang til.'),
      line('M158 172H407M158 197H372M158 222H396', 'edge', '3')],
    [metadata('cover', 'Løftet afdækning', 'Et samlet låg med fast hængsel er et naturligt mål for senere animation.'),
      `<path d="M117 94H483V139H117Z" fill="url(#${m.wall})"/>` + frame(117, 94, 366, 45, 2) + line('M137 111H374', 'ink', '2') + line('M441 112l9 8 9-8', 'ink', '2')],
    [metadata('closed-rows', 'Lukkede rækker', 'To slanke, lukkede rækker gør det åbne felt let at skelne fra resten.'),
      rect(117, 285, 366, 25, 'context', 3) + rect(117, 322, 366, 25, 'context', 3) + line('M136 294l5 5-5 5M136 331l5 5-5 5', 'ink', '1.8') +
      line('M163 298H405M163 335H405', 'edge', '2')],
    [metadata('sill', 'Lysende forkant', 'En fin lyskant adskiller åbning og forgrund.'), line('M132 252H468', 'light', '2')]
  ]);
}

function avatarGroup(prefix) {
  const m = materials(prefix);
  const people = [
    { x: 165, key: 'first-person', pigment: 'counter' },
    { x: 300, key: 'second-person', pigment: 'subject' },
    { x: 435, key: 'third-person', pigment: 'counter' }
  ];
  return result('Tre ligeværdige portrætter deler samme lyse rum. Hver person har en tydelig, selvstændig plads.', m.body, [
    [metadata('ground', 'Billedfelt', 'Rolig fælles bund for hele gruppen.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('shared-room', 'Fælles rum', 'Ét samlet, blødt afgrænset rum viser gruppetilhørsforhold.'),
      rect(82, 119, 436, 183, 'context', 91) + rect(92, 129, 416, 163, 'plane', 81) + frame(82, 119, 436, 183, 91)],
    ...people.map(({ x, key, pigment }, index) => [metadata(key, `Person ${index + 1}`, 'En selvstændig person med samme størrelse, dybde og visuelle plads som de øvrige.'),
      depth(`<circle cx="${x + 3}" cy="216" r="62"/>`) + `<circle cx="${x}" cy="210" r="62" fill="url(#${m.wall})"/>` +
      circle(x, 210, 50, pigment) + circle(x, 193, 13, 'light') + `<path d="M${x - 25} 243a25 25 0 0 1 50 0v3h-50Z" ${fill('light')}/>` +
      `<circle cx="${x}" cy="210" r="62" fill="none" stroke="${color('edge')}" stroke-width="var(--g-line-width)"/>`]),
    [metadata('shared-edge', 'Fælles forkant', 'En diskret kant fastholder rummets sammenhæng under de tre portrætter.'), line('M155 291H445', 'light', '1.5')]
  ]);
}

function progress(prefix) {
  const m = materials(prefix);
  const steps = [126, 242, 358, 474];
  return result('En fælles rute forbinder fire ligeværdige milepæle. Tre har en oplyst kerne; den sidste er stadig åben.', m.body, [
    [metadata('ground', 'Billedfelt', 'Rolig bund uden en konkurrerende grafakse.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('route', 'Fælles rute', 'En konstant bredde og ens milepæle viser forløb frem for stigende dataværdier.'),
      rect(99, 191, 402, 38, 'context', 19) + rect(107, 199, 386, 22, 'plane', 11) + line('M107 210H493', 'edge', '1.3')],
    ...steps.map((x, index) => [metadata(`milestone-${index + 1}`, `Milepæl ${index + 1}`, index < 3 ? 'En passeret milepæl med oplyst kerne og formmarkør.' : 'En ventende milepæl med åben kerne og tydelig kant.'),
      depth(`<circle cx="${x + 3}" cy="216" r="36"/>`) + `<circle cx="${x}" cy="210" r="36" fill="url(#${m.wall})"/>` +
      circle(x, 210, 26, index < 3 ? 'subject' : 'plane') +
      `<circle cx="${x}" cy="210" r="36" fill="none" stroke="${color('edge')}" stroke-width="var(--g-line-width)"/>` +
      (index < 3 ? line(`M${x - 10} 210l7 8 14-18`, 'light', '3') : `<circle cx="${x}" cy="210" r="9" fill="none" stroke="${color('edge')}" stroke-width="1.5"/>`)]),
    [metadata('destination', 'Retning', 'En lille, separat pil viser læseretningen uden at erstatte milepælenes egne signaler.'), line('M475 279h24m-8-8 8 8-8 8', 'edge', '1.6')]
  ]);
}

function imageGeometry(prefix, captioned) {
  const m = materials(prefix);
  const imageClip = `${prefix}-image-clip`;
  const top = captioned ? 62 : 73, height = captioned ? 230 : 254;
  const bottom = top + height;
  const definitions = m.body.replace('</defs>', `<clipPath id="${imageClip}"><rect x="129" y="${top + 14}" width="342" height="${height - 28}" rx="1"/></clipPath></defs>`);
  const groups = [
    [metadata('ground', 'Billedfelt', 'Et roligt underlag omkring den illustrerede billedramme.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('frame-depth', 'Rammens dybde', 'En afgrænset forskydning giver billedet et fysisk plan.'), depth(`<rect x="121" y="${top + 9}" width="370" height="${height}" rx="3"/>`)],
    [metadata('frame', 'Billedramme', 'En lys, mild ramme afgrænser motivet og bliver stående ved fremtidig bevægelse.'),
      `<rect x="115" y="${top}" width="370" height="${height}" rx="3" fill="url(#${m.wall})"/>` + frame(115, top, 370, height, 3)],
    [metadata('sky', 'Baggrund og lys', 'En særskilt horisont og lyskilde skaber rolig afstand til forgrunden.'),
      `<g clip-path="url(#${imageClip})"><rect x="129" y="${top + 14}" width="342" height="${height - 28}" fill="url(#${m.sky})"/>` + circle(394, top + 68, 29, 'light') + '</g>'],
    [metadata('landscape', 'Forgrund', 'To afstemte, bølgende terrænplaner er et sted at se ind i, uden at konkurrere med en billedtekst.'),
      `<g clip-path="url(#${imageClip})"><path d="M129 ${bottom - 48}Q207 ${top + 65} 312 ${bottom - 87}T471 ${bottom - 81}V${bottom}H129Z" ${fill('plane')}/>` +
      `<path d="M242 ${bottom}Q335 ${top + 105} 471 ${bottom - 58}V${bottom}Z" ${fill('subject')}/></g>`],
    [metadata('light-edge', 'Lyskant', 'Den øvre kant viser rammens materiale i samme lysretning som resten af familien.'), line(`M129 ${top + 14}H471`, 'light', '2')]
  ];
  if (captioned) groups.push(
    [metadata('caption-connection', 'Tilhørsforhold', 'En kort, fysisk forbindelse samler billede og billedtekst til ét objekt.'),
      line(`M300 ${bottom}V313`, 'edge', '1.4') + circle(300, bottom, 2.5, 'subject')],
    [metadata('caption', 'Billedtekst', 'En stabil tekstflade med to rolige spor har plads under billedet.'),
      rect(148, 313, 304, 52, 'plane', 3) + line('M170 333H422M170 347H364', 'edge', '2.5')]
  );
  return result(captioned ? 'Et indrammet landskab og dets billedtekst er fysisk forbundet som ét samlet objekt.' : 'En lys ramme åbner mod et roligt landskab med to terrænplaner og en afgrænset lyskilde.', definitions, groups);
}

function checkbox(prefix) {
  const m = materials(prefix);
  return result('Et indfældet, oplyst felt viser ét tydeligt flueben. Et åbent felt nedenunder viser den uvalgte mulighed.', m.body, [
    [metadata('ground', 'Billedfelt', 'Et roligt fælles underlag for to forskellige valgtilstande.'), rect(0, 0, 600, 420, 'ground')],
    [metadata('checked-frame', 'Valgt feltramme', 'Et mildt, tydeligt afgrænset indfældet rum.'),
      depth('<rect x="123" y="97" width="111" height="111" rx="11"/>') + `<rect x="118" y="89" width="111" height="111" rx="11" fill="url(#${m.wall})"/>` + frame(118, 89, 111, 111, 11)],
    [metadata('selected-field', 'Valgt indre', 'En solid kerne samler valgets visuelle tyngde.'), rect(133, 104, 81, 81, 'subject', 5)],
    [metadata('checkmark', 'Flueben', 'Den egentlige betydningsbærende markør er forståelig uden farve.'), line('M151 142l17 19 30-38', 'light', '5')],
    [metadata('unchecked-field', 'Åbent felt', 'Samme form med tom kerne gør den uvalgte mulighed tydelig.'),
      rect(118, 249, 111, 111, 'context', 11) + rect(133, 264, 81, 81, 'plane', 5) + frame(118, 249, 111, 111, 11)],
    [metadata('labels', 'Beskrivende spor', 'Tekstspor med rolig vægt understøtter de to felter uden at ligne flere valg.'),
      line('M271 125H467M271 150H418', 'ink', '3') + line('M271 277H467M271 300H418', 'edge', '2.5')]
  ]);
}

const drawings = {
  poster,
  focus,
  relation,
  rhythm,
  accordion,
  'avatar-group': avatarGroup,
  progress,
  image: prefix => imageGeometry(prefix, false),
  caption: prefix => imageGeometry(prefix, true),
  checkbox
};

export function draw(motif, { prefix = 'lightroom' } = {}) {
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '-');
  if (!Object.hasOwn(drawings, motif)) return drawCatalog(motif,{prefix:safePrefix||'lightroom'});
  return drawings[motif](safePrefix || 'lightroom');
}
