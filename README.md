# Ringsmith

Et lokalt værksted til parametriske smykkeringe. Form en almindelig ring eller en udhulet signetring, tilføj et motiv, anslå vægten i forskellige metaller, og eksportér til OBJ eller 3MF i millimeter.

## Brug programmet

Den aktuelle lokale leverance ligger i `deliverables/Ringsmith-nyeste.zip`. Pak den ud, og åbn `Ringsmith.html` i en browser. `Start her.txt` indeholder en kort brugervejledning. HTML-filen kan også åbnes direkte fra `deliverables/`.

Programmet fungerer offline uden installation eller udviklingsserver og behandler motiver lokalt. En eventuel [udgivet GitHub-release](https://github.com/oliverFj/Ringsmith/releases/latest) opdateres separat fra den lokale leverance.

- Skydere og præcis talindtastning til størrelse, profil og udhuling.
- Flad, rund signetflade med afrundet kant, åbent hulrum under toppen og to baner langs indersiden. Bunden af ringskinnen bevares massiv.
- SVG, PNG, JPG og WebP som gravering eller relief.
- Støbetillæg skalerer den færdige eksport, mens designmålene bevares.
- Sammenfoldelig vægtberegner med materialesammenligning og tilpasset vægtfylde.
- Baggrundsberegning med beskeder om det aktuelle beregningstrin. Loading-boksen ligger oven på 3D-visningen uden at flytte indholdet eller ændre visningsområdets størrelse.

Udviklingsudgave: kontrollér mål, gods, motiv og printbarhed i sliceren før produktion. Programmet placerer ikke printstøtter.

## Ringform og afrunding

Arbejd med det færdige smykkes mål i millimeter. Den indvendige diameter måles ved fingerhullets smalleste sted. Signetringens bredde og tykkelse angives nederst på ringskinnen; fladens diameter gælder den plane, runde del inden kantafrundingen.

Signetringens fingerhul er cylindrisk. Afrundingen ændrer kanterne lokalt frem for at bøje hele fingerfladen efter bredden nederst:

- **Ydre åbningskant · mm** afrunder den sammenhængende kant rundt om fingerhullet gennem bund og skuldre. Den ønskede afrunding begrænses lokalt af plads og godstykkelse.
- **Kant mod baner og hulrum · %** afrunder overgangen fra fingerhullet til udhulingen og begge baner. Afrundingen aftager ved banernes afslutninger; 0 % giver en skarp kant.
- **Kantens runding · %** styrer signetfladens ydre kant. Den er en formindstilling, ikke en radius i millimeter.

Den almindelige ring har sine egne indstillinger for ydersidens fladhed og indersidens runding. Tværsnittet viser den almindelige profil eller signetringens nederste ringskinne. 3D-visningen kan drejes med mus eller piletaster og zoomes med musehjulet eller plus/minus. Signetringen har desuden visninger af indersiden, forsiden og signetfladen.

## Motiv, gemning og eksport

Motiver fra SVG, PNG, JPG og WebP kan graveres ind i fladen eller tilføjes som relief. Filer må højst fylde 2 MB. Billeder omdannes til en sort/hvid silhuet; brug SVG til fine detaljer og omdan tekst til kurver. Størrelse, rotation, placering og dybde kan tilpasses. Gravering skal efterlade mindst 0,2 mm gods under motivet.

**Gem design** henter det aktuelle ringdesign som en redigerbar `.ringsmith.json`-fil. Brug **Åbn design** for at fortsætte senere. Der er ingen automatisk lagring, og downloads overskriver ikke automatisk den oprindelige fil. En OBJ- eller 3MF-fil erstatter ikke designfilen. Annullerede og ugyldige åbninger bevarer det aktuelle design.

Ældre signetdesign konverteres ved åbning til den runde flade, cylindriske fingerudskæring og lokale kantafrunding. Programmet viser en besked om konverteringen. Kontrollér formen, og gem som en ny designfil.

Støbetillægget skalerer eksporten ens i alle retninger og anvendes én gang. Designmålene bevares. 3MF angiver millimeter som enhed; ved OBJ-import skal du vælge mm. Eksportmål vises med tre decimaler, mens beregningen bruger de uafrundede mål.

## Vægtberegner

Fold **Vægtberegner** ud i fremstillingspanelet. Den viser den anslåede vægt af den færdige ring og en sammenligning af 13 standardmaterialer:

- Sterlingsølv 925 og finsølv 999.
- Gult guld i 8, 9, 14, 18 og 22 karat samt 14 karat hvidguld og roséguld.
- Platin 950, palladium 950, titan Grade 2 og rustfrit stål 316L.

Vælg et materiale, tilpas vægtfylden i g/cm³, eller vælg **Egen legering**. **Brug standardværdi** gendanner materialets oprindelige værdi. Tilpasninger bevares ved materialeskift i den åbne session, men vægtværktøjets indstillinger følger ikke med designfilen og gendannes ikke efter genindlæsning.

Beregningen er `volumen i mm³ × vægtfylde i g/cm³ ÷ 1.000`. Den bruger ringens eksisterende, uafrundede volumen inklusive motiv og udhuling. Materialevalg og ændret vægtfylde kræver ingen ny 3D-beregning. Vægten er uden støbetillæg, støbekanaler og efterbearbejdning. Under en ny geometriberegning eller ved ugyldige mål vises ingen gammel vægt som et aktuelt resultat.

Standardværdierne er eksempler på konkrete legeringer, ikke en entydig følge af karattallet. Brug støberiets præcise tal, når de kendes. Kilderne er knyttet til hvert materiale i værktøjet og findes i `src/weight.mjs`: C.HAFNER, Berolina, Smiths Metal Centres og thyssenkrupp.

## Udvikling

Kræver Node.js 20 eller nyere.

```sh
npm ci
npm test
npm run build
```

Åbn derefter den genererede `index.html` direkte i browseren. Ingen udviklingsserver er nødvendig. Redigér `src/`; HTML-filen genereres af buildet.

Projektet indeholder sin lokale Design Studio-runtime og sit tema. Almindelige builds kræver ikke en separat Design Studio-installation. `design/design.css` og `design/runtime/` opdateres gennem Design Studios sync-værktøj.

### Beregning og visning

`src/geometry-client.mjs` holder højst én aktiv beregning og én ventende forhåndsvisning. Hurtige ændringer erstatter den ventende forhåndsvisning; ældre resultater overskriver ikke nye feltværdier. Eksport bruger et snapshot af designet ved klik. Workerens trinbeskeder driver aktivitetsvisningen, som også kan vise ventetid og eksport.

`src/signet.mjs` gemmer højst to færdige grundformer uden motiv i en native cache. Nøglen omfatter ringens geometrimål og opløsning; motiv og støbetillæg indgår ikke. Motivændringer genbruger grundformen og anvender motivet på ny, så ændringer ikke ophobes. Forhåndsvisning og eksport har forskellig opløsning og genbruger kun en passende cachepost.

Normals føres med fra de oprindelige flader gennem skæringerne. Åbningsafrundingerne har en beregnet normalretning fra deres cirkulære forløb, inklusive ændringer i radius og centrum. Begge sider bevarer disse retninger gennem spejling og oprydning, så smalle skæringstrekanter ikke bestemmer udglatningen. Signetringen har sit eget materiale i visningen; den almindelige ring bruger en separat profilbaseret beregning af normals. Skarpe motivkanter bevares.

### Kontrol og lokal levering

`npm test` dækker blandt andet lukkede og sammenhængende ringmodeller, repræsentative ydermål, afrundingens geometri og normals, motivbehandling, cachegenbrug, beregningskøen, eksport og vægtomregning. Brug målrettede testfiler ved afgrænsede ændringer. `npm run doctor` kontrollerer Design Studio-tilknytning og offlinebuild; den erstatter ikke funktionstest eller kontrol i sliceren.

Den aktuelle pakning giver en statisk fetch-advarsel i doctor på grund af loaderfunktioner i de indlejrede Manifold- og Three.js-biblioteker. Produktkoden indlæser WASM fra indlejrede bytes og bruger lokale ressourcer. Kildekontrol og browserkontrol over HTTP beviser ikke i sig selv alle direkte `file://`-forløb.

Efter et nyt build kopieres `index.html` til `deliverables/Ringsmith.html`. Den aktuelle HTML og `deliverables/Start her.txt` pakkes sammen som `deliverables/Ringsmith-nyeste.zip`. Bevar de ældre versionsmapper og ZIP-filer som tidligere leverancer. `index.html` og `deliverables/` er genererede/lokale filer og er udeladt fra Git; de opdateres ikke automatisk ved et commit eller en GitHub-release.

## Licenser

Tredjepartslicenser er indlejret i den færdige HTML-fil. Fontlicenser findes også i `design/assets/`. Projektets egen kode har endnu ingen valgt open source-licens.
