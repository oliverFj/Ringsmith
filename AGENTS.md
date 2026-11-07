<!-- design-studio -->
## Design Studio

Brug Design Studio-systemet i E:/AI projekter/Design Studio.
Læs systemets AGENTS.md og README.md samt docs/AGENT-WORKFLOW.md før UI-arbejde. Arbejdsgangen er den fælles indgang; docs/INTEGRATION.md indeholder API-eksempler, og docs/DESIGN-FOUNDATIONS.md forklarer designprincipperne. Følg også dette produkts egne anvisninger.
Find design-studio.project.json og brug dens faktiske stier og scope. Projektets tema er design/design.json; design/design.css og design/runtime genereres af sync og må ikke håndredigeres.

Lever som standard projektets egen index.html i roden, som åbnes direkte via file:// uden server, terminal eller installeret runtime.
Brug projektets npm run build til at pakke kode, runtime, CSS og nødvendige ressourcer til offlinebrug; undgå CDN'er og lokale fetch-/modulkald, der kræver en server.
Agenten installerer udviklingsafhængigheder og genbygger efter kode-, tema- og ressourceændringer. Brugeren skal blot genindlæse browseren.
Init har oprettet src-filer, tools/build.mjs, package.json og en færdig index.html. Kør npm install ved første udviklingsopsætning. Redigér src-filerne, ikke den genererede index.html.
Bevar eksisterende arkitektur og brand. En anden driftsmodel kræver et udtrykkeligt brugerkrav eller konkret nødvendig funktionalitet.

Genbrug biblioteket fra design/runtime/components.mjs og temaets tokens under ds-scope. Brug de fælles breddeprofiler gennem createLayout eller ds-layout/data-layout; produktet ejer kolonner og placering.
Registrér kun faktiske frameworkadaptere i konfigurationens components med verificerede file og export. Direkte runtimebrug kræver ingen lokal adapter. Nye genbrugelige roller og varianter udvikles i det fælles bibliotek, ikke som lokale kopier.
Brug de fælles controllere til interaktion: mountMenuControls til kommandomenuer, mountTree til hierarkier og native showModal()/close() til dialoger. Produktet ejer data, kommandoer og validering. Bevar kladder, fejl og valg ved temaskift; ryd controllere ved genmontering.
Læs brandprincipper, sektionsregler og logobrug i temaet. Brug logo-originalerne fra design/assets efter brandreglerne og bevar licenser.
Brug createProjectFile fra design/runtime/files.mjs med produktets format-id, version og validering. Annullerede eller ugyldige åbninger bevarer state. Downloads overskriver ikke automatisk originalfilen.

Kør sync fra systemmappen ved ændret tema eller fælles runtime og genbyg derefter produktet. Rene produktændringer kræver ikke sync. Brug npm run doctor i offline-startprojektet til at finde konkrete fejl; kontrollen ændrer ikke filer.
tools/cli.mjs update PROJECT_DIR viser valgfrie skabelonopdateringer. Gennemgå planen før --apply; lokale ændringer bevares. Opdatering erstatter ikke dette produkts AGENTS.md.
Kontrollér den berørte funktion proportionelt. Nye skærme skal inspiceres i browseren med relevant tastatur, smal bredde og fejl-/tomtilstande. HTTP-kontrol beviser ikke file://; respekter værktøjets URL-politik og angiv manglende kontrol præcist.
Åbn "E:\AI projekter\Design Studio\index.html" direkte i browseren, og vælg Åbn tema for at indlæse "E:\AI projekter\Second Gen\Ringsmith\design\design.json".
Gem tema henter en JSON-fil. Placér den som projektets design/design.json før sync; originalfilen overskrives ikke automatisk.
