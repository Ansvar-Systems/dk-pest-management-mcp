/**
 * Denmark Pest Management MCP -- Data Ingestion Script
 *
 * Populates the SQLite database with Danish pest management data.
 * Sources: Middeldatabasen (middeldatabasen.dk), SEGES Innovation,
 *          Aarhus Universitet (Institut for Agroekologi), Miljostyrelsen.
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ─── Pests ───────────────────────────────────────────────────────────────────

interface PestRecord {
  id: string;
  name: string;
  common_names: string;
  pest_type: string;
  description: string;
  lifecycle: string;
  identification: string;
  crops_affected: string;
  risk_factors: string;
  economic_impact: string;
}

const pests: PestRecord[] = [
  {
    id: 'septoria-tritici',
    name: 'Septoria (Septoria tritici)',
    common_names: 'hvedebladplet, Septoria tritici blotch, STB',
    pest_type: 'disease',
    description: 'Den vigtigste bladsvampesygdom i dansk vinterhvede. Foraarsager betydelige udbyttetab i fugtige aar. Angriber blade og reducerer det fotosyntetisk aktive areal.',
    lifecycle: 'Overvintrer i stubresterne. Spredes via regnspaenk. Udvikler sig i fugtigt vejr (>6 timer bladfugt). Inkubationstid 14-28 dage afhaengig af temperatur.',
    identification: 'Gule/brune pletter med sorte pyknidier paa blade. Starter nederst i bestanden og bevaeger sig opad med regnspaenk.',
    crops_affected: 'vinterhvede, vinterbyg',
    risk_factors: 'Tidlig saaning, modtagelige sorter, hvede efter hvede, rigelig nedbor i vaekstperioden',
    economic_impact: 'Udbyttetab paa 10-30% i ubehandlede marker i fugtige aar. Den mest tabsgivende sygdom i dansk hvede.',
  },
  {
    id: 'gulrust',
    name: 'Gulrust (Puccinia striiformis)',
    common_names: 'gulrust, yellow rust, striped rust',
    pest_type: 'disease',
    description: 'Obligat parasit der kan foraarsage epidemisk spredning i modtagelige hvedesorter. Spredes med vinden over lange afstande.',
    lifecycle: 'Spredes med vindbaarne uredosporer. Kan overvintre paa groenne planter. Optimal udvikling ved 10-15 grader C med hoj luftfugtighed.',
    identification: 'Gule pustler i striber langs bladnerverne. Karakteristisk stribet monster adskiller gulrust fra brunrust.',
    crops_affected: 'vinterhvede',
    risk_factors: 'Modtagelige sorter, mild vinter, kole foraarsklimaer',
    economic_impact: 'Kan foraarsage totalt udbyttetab i modtagelige sorter. Epidemier kan udvikle sig hurtigt over faa uger.',
  },
  {
    id: 'brunrust',
    name: 'Brunrust (Puccinia recondita)',
    common_names: 'brunrust, brown rust, leaf rust',
    pest_type: 'disease',
    description: 'Bladrust der primaert optrseder sent i vaekstperioden. Mindre tabsgivende end gulrust, men udbredt i danske kornmarker.',
    lifecycle: 'Spredes med vindbaarne sporer. Favoriseres af varme (>15 grader C) og hoj fugtighed. Typisk sen infektion fra BBCH 55.',
    identification: 'Runde, brune pustler spredt tilfaeldigt paa bladoverfladen. Ikke i striber som gulrust.',
    crops_affected: 'vinterhvede, vinterbyg',
    risk_factors: 'Modtagelige sorter, varm forsommer, sent angreb svart at opdage',
    economic_impact: 'Udbyttetab paa 5-15% i modtagelige sorter, men sjseldent katastrofalt. Vigtigst paa faneblad og 2. blad.',
  },
  {
    id: 'meldug',
    name: 'Meldug (Blumeria graminis)',
    common_names: 'meldug, powdery mildew',
    pest_type: 'disease',
    description: 'Udbredt svampesygdom i korn, sserligt i tset, frodig bestand med hoj kvselstoftilforsle. Reducerer fotosyntese og transpiration.',
    lifecycle: 'Obligat parasit. Spredes med vindbaarne konidier. Favoriseres af taet, frodig bestand og moderat temperatur (15-22 grader C). Hoej luftfugtighed omkring planten.',
    identification: 'Hvidt svampelag paa blade og bladskeder. Gaar senere hen til graabrunt med sorte frugtlegemer (cleistothecier).',
    crops_affected: 'vinterhvede, vaarbyg',
    risk_factors: 'Hoej kvaelstoftilforsle, taet bestand, modtagelige sorter, mild vinter',
    economic_impact: 'Udbyttetab paa 5-20% ved tidlige angreb. Vigtigst i vaarbyg i Danmark.',
  },
  {
    id: 'fusarium',
    name: 'Akseskimmel (Fusarium spp.)',
    common_names: 'akseskimmel, Fusarium head blight, FHB, aksfusariose',
    pest_type: 'disease',
    description: 'Svampesygdom der angriber aks under blomstring. Producerer mykotoksiner (DON, ZEA) som er sundhedsskadelige og kan medfoere afvisning ved salg.',
    lifecycle: 'Overvintrer i planterester. Askosporer spredes med vinden under blomstring. Risiko stoerst ved fugtigt vejr under blomstring (BBCH 61-69).',
    identification: 'Lyse, blegte aks eller dele af aks. Mykotoksinrisiko ved hoest. Orange-rosa sporemasser ved fugtigt vejr. Skrumpne, hvidlige kerner.',
    crops_affected: 'vinterhvede',
    risk_factors: 'Majs eller hvede som forfrugt, reduceret jordbearbejdning, nedbor under blomstring, modtagelige sorter',
    economic_impact: 'Udbyttetab op til 30%. Mykotoksinindhold kan medfoere afvisning af partier. EU-graensevaerdier for DON: 1250 mikrogram/kg i uhforarbet hvede.',
  },
  {
    id: 'rapsjordlopper',
    name: 'Rapsjordlopper (Psylliodes chrysocephala)',
    common_names: 'rapsjordlopper, cabbage stem flea beetle',
    pest_type: 'insect',
    description: 'Vigtigste insektskadegor i vinterraps i Danmark. Voksne biller gnaver huller i blade, larver minerer i bladstilke og staengler og kan draebe planterne.',
    lifecycle: 'Voksne biller flyver til nyetablerede rapsmarker fra september. Aeglaegning i jord ved planter oktober-november. Larver minerer i bladstilke og staengler fra november til foraar.',
    identification: 'Smaa metalblaa biller, 3-5 mm. Runde huller i kimblade og foerste loevblade. Larver minerer i bladstilke og staengler (hvide, hovedlose larver 5-8 mm).',
    crops_affected: 'vinterraps',
    risk_factors: 'Tidlig saaning, toor september, rapsmarker taet paa foregaaende aars rapsarealer',
    economic_impact: 'Kan foraarsage total oedelaeggelse af rapsmarken ved kraftige angreb. Stigende problem paa grund af neonicotinoidforbud.',
  },
  {
    id: 'bladlus-korn',
    name: 'Bladlus i korn (Sitobion avenae / Rhopalosiphum padi)',
    common_names: 'kornbladlus, havrebladlus, grain aphid, bird cherry-oat aphid',
    pest_type: 'insect',
    description: 'Kornbladlus (Sitobion avenae) og havrebladlus (Rhopalosiphum padi) er de vigtigste bladlusarter i dansk korn. Suger plantesaft og kan overfoere havreroedsot (BYDV).',
    lifecycle: 'Havrebladlus overvintrer paa haeg (Prunus padus). Indflyvning i kornmarker fra maj. Kolonier opbygges hurtigt ved varmt vejr. Kornbladlus forekommer primaert i aks.',
    identification: 'Groenne eller roede kolonier, ofte i aks eller paa flag/fanebladet. Honningdug og sodskimmel ved staerke angreb.',
    crops_affected: 'vinterhvede, vaarbyg, havre',
    risk_factors: 'Varmt, toort foraar, tidlig indflyvning, fravser af nyttedyr',
    economic_impact: 'Direkte sugetab op til 10-15% ved staerke angreb. Indirekte tab via BYDV-overforsel kan vaere stoerre.',
  },
  {
    id: 'kornbladbille',
    name: 'Kornbladbille (Oulema melanopus)',
    common_names: 'kornbladbille, cereal leaf beetle',
    pest_type: 'insect',
    description: 'Larver gnaver aflange vinduesstriber i blade. Voksne biller gnaver ogsaa men er mindre skaadelige. Udbredt i hele Danmark.',
    lifecycle: 'Voksne biller overvintrer i jord og flyver til kornmarker i april-maj. Aeglaegning paa blade. Larver fodrer i 2-3 uger, forpupper sig i jord.',
    identification: 'Aflange huller/striber i bladene (vinduegnav). Larver daekket af sort slim (egne ekskrementer). Voksne biller er 5 mm, metalblaa med rodt brystskjold.',
    crops_affected: 'vinterhvede, vaarbyg, havre',
    risk_factors: 'Varmt foraar, sene sorter, marker tset paa foregaaende aars kornarealer',
    economic_impact: 'Sjseldent oekonomisk vasentlig i Danmark. Bekaempelse er sjaeldent loensom undtagen ved meget kraftige angreb.',
  },
  {
    id: 'snegle',
    name: 'Agersnegle (Deroceras reticulatum)',
    common_names: 'agersnegle, graa marksnegle, grey field slug',
    pest_type: 'mollusc',
    description: 'Snegle gnaver paa kimblade og unge planter, saerligt i vinterraps og vinterhvede. Storst problem i fugtige efteraar med reduceret jordbearbejdning.',
    lifecycle: 'Aeglaegning i jord om efteraaret. Snegle er aktive om natten og i fugtigt vejr. Favoriseres af planterester paa jordoverfladen, tung lerjord og fugtigt klima.',
    identification: 'Ujaevne huller i blade, slimspor. Kimblade afgnevet. Vaerst i fugtige efteraar efter reduceret jordbearbejdning.',
    crops_affected: 'vinterraps, vinterhvede',
    risk_factors: 'Reduceret jordbearbejdning, planterester paa overfladen, fugtig lerjord, fugtige efteraar',
    economic_impact: 'Kan nodvendiggoere omsaaning. Storst risiko i vinterraps (kimbladstadiet). Tab paa 5-25% ved staerke angreb.',
  },
  {
    id: 'kartoffelskimmel',
    name: 'Kartoffelskimmel (Phytophthora infestans)',
    common_names: 'kartoffelskimmel, potato late blight, kartoffel-bladskimmel',
    pest_type: 'disease',
    description: 'Den vigtigste sygdom i dansk kartoffelavl. Kan oedelaegge hele toppen paa faa dage under gunstige betingelser. Knoldsmitte kan ogsaa forekomme.',
    lifecycle: 'Overvintrer i inficerede knolde og affaldsbunker. Spredes med vindbaarne sporangier. Krsever frit vand paa blade og temperaturer over 10 grader C. Hurtig epidemisk udvikling.',
    identification: 'Moerke, vandige pletter paa blade, ofte fra bladkanter. Hvid skimmelvsekst paa bladunderside i fugtigt vejr. Brunlige, faste pletter paa knolde.',
    crops_affected: 'kartofler',
    risk_factors: 'Fugtige perioder med temperaturer 12-25 grader C, nattedug, modtagelige sorter, ubehandlede affaldsbunker',
    economic_impact: 'Ubehandlede marker kan miste hele udbyttet. Krsever 8-15 svampebekaempelser per saeson i konventionel avl. Hoeje bekaempelsesomkostninger.',
  },
  {
    id: 'ukrudt-rajgraes',
    name: 'Agerraeveahle / Rajgraes (Alopecurus myosuroides / Lolium spp.)',
    common_names: 'agerraeveahle, vaeselhale, rajgraes, blackgrass, ryegrass',
    pest_type: 'weed',
    description: 'Tuedannende graesukrudt med stigende herbicidresistens i Danmark. Agerraeveahle er primaert et problem i Sydsjslland og paa oerne. Rajgraes er udbredt i hele landet.',
    lifecycle: 'Fremspiring primaert om efteraaret (september-november). Froproduktion op til 10.000 fro per plante. Fro overlever 3-5 aar i jorden.',
    identification: 'Tuedannende graesukrudt. Stigende herbicidresistens i DK. Agerraeveahle har slanke, cylindriske aks. Rajgraes har flade aks med smaakorn paa skift.',
    crops_affected: 'vinterhvede, vinterbyg, vinterraps',
    risk_factors: 'Ensidig vinterkornsdyrkning, reduceret jordbearbejdning, manglende saedskifte, gentagen brug af ACCase/ALS-herbicider',
    economic_impact: 'Udbyttetab paa 20-50% ved kraftig bestand. Herbicidresistens oeger omkostningerne drastisk. Kan goere vinterkornsdyrkning urentabel.',
  },
  {
    id: 'ukrudt-kamille',
    name: 'Kamille (Matricaria spp.)',
    common_names: 'kamille, lugtloes kamille, scentless mayweed, matricaria',
    pest_type: 'weed',
    description: 'Udbredt tokirnbladet ukrudt i danske kornmarker. Konkurrerer om lys, vand og naeringsstoffer. Kan vaere vanskelig at bekaempe i vaarbyg.',
    lifecycle: 'Fremspiring forar og efteraar. Froproduktion op til 50.000 froe per plante. Froe langlivet i jorden.',
    identification: 'Hvide blomsterhoveder med gul midte. Fint opdelte blade. Kan forveksles med andre kurvblomstrede ukrudtsarter.',
    crops_affected: 'vinterhvede, vaarbyg',
    risk_factors: 'Utilstrsekkelig efteraarsbekaempelse, ALS-resistens, ensidig korndyrkning',
    economic_impact: 'Moderat udbyttetab (5-10%), men kan vanskeliggoere hoest ved kraftig forekomst.',
  },
  {
    id: 'ukrudt-fuglegraes',
    name: 'Fuglegraes (Stellaria media)',
    common_names: 'fuglegraes, fuglemure, chickweed, common chickweed',
    pest_type: 'weed',
    description: 'Et af de mest udbredte ukrudtsarter i dansk landbrug. Trives i sserligt naeringsrig, fugtig jord. Kan daekke jordoverfladen fuldstaendigt.',
    lifecycle: 'Kan fremspire aaret rundt, men primaert foraar og efteraar. Op til 3 generationer per aar. Froproduktion op til 15.000 froe per plante.',
    identification: 'Lille, krybende plante med aegrunde blade og smaa hvide blomster med delte kronblade. Haarlinie langs staenglen.',
    crops_affected: 'vinterraps, vinterhvede',
    risk_factors: 'Naeringsrig jord, fugtige betingelser, utilstrseklig jordbearbejdning',
    economic_impact: 'Moderat tab, men kan vaere vaert at bekaempe i raps paa grund af konkurrence i etableringsfasen.',
  },
  {
    id: 'phoma-raps',
    name: 'Rodhalsraad/Phoma (Leptosphaeria maculans)',
    common_names: 'phoma, rodhalsraad, phoma stem canker, blackleg',
    pest_type: 'disease',
    description: 'Alvorlig sygdom i vinterraps. Bladpletter om efteraaret foerer til systemisk infektion og rodhalsraad, som kan knaekke planten foer hoest.',
    lifecycle: 'Overvintrer i stubresterne. Askosporer frigives i fugtige perioder om efteraaret. Svampen vokser systemisk fra bladinfektioner ned til rodhalsen over vinteren.',
    identification: 'Lyse bladpletter med moerke pyknidier om efteraaret. Raadne, moerkfarvede laesioner paa rodhalsen om foraaret. Knaekkede planter ved hoest.',
    crops_affected: 'vinterraps',
    risk_factors: 'Raps efter raps, korte saedskifter med raps, modtagelige sorter, tidlig saaning',
    economic_impact: 'Udbyttetab paa 10-30% ved modtagelige sorter. Kan foere til total plantefoerliste ved staerke angreb.',
  },
  {
    id: 'skulpesnudebille',
    name: 'Skulpesnudebille (Ceutorhynchus assimilis)',
    common_names: 'skulpesnudebille, skulpegalmyg, cabbage seed weevil',
    pest_type: 'insect',
    description: 'Voksne biller gnaver huller i skulper for at aeglaegge. Larver fodrer paa froe inde i skulpen. Hullerne muliggoer ogsaa infektion med skulpegalmyg.',
    lifecycle: 'Voksne biller indflyer fra overvintringsstedet i april-maj. Aeglaegning i unge skulper. Larver udvikles inde i skulpen, aeder 3-5 froe, falder ud og forpupper sig i jord.',
    identification: 'Smaa graa snudebiller (2.5-3 mm) paa blomster og unge skulper. Hul i skulpevsetggen fra aeglaegning.',
    crops_affected: 'vinterraps',
    risk_factors: 'Store rapsarealer i omraadet, tidlig blomstring, varmt vejr i april-maj',
    economic_impact: 'Direkte tab beskedent (3-5%). Stoerste risiko er som vektor for skulpegalmyg, som kan fordoble tabet.',
  },
  {
    id: 'trips',
    name: 'Trips (Thrips spp.)',
    common_names: 'trips, korntrips, bladtrips, thrips',
    pest_type: 'insect',
    description: 'Smaa insekter (1-2 mm) der suger paa blade og aks. Forekommer i vaarbyg og havre, sjseldent i hvede. Skade primaert kosmetisk, men kan reducere kvalitet.',
    lifecycle: 'Overvintrer i jord. Indflyvning i kornmarker fra maj-juni. Formerer sig hurtigt i varmt, toert vejr.',
    identification: 'Smaa, aflange insekter (1-2 mm), gullige eller morkbrune. Soelvfarvede pletter paa blade fra sugningen. Aks kan faa brune pletter.',
    crops_affected: 'vaarbyg, havre',
    risk_factors: 'Varmt, toert vejr i juni-juli, marker taet paa graesarealer',
    economic_impact: 'Sjaeldent oekonomisk vasentligt i Danmark. Kan reducere maltbygkvalitet ved meget staerke angreb.',
  },
  {
    id: 'havrerodsot',
    name: 'Havrerodsot (BYDV)',
    common_names: 'havrerodsot, barley yellow dwarf virus, BYDV, virusgulsot',
    pest_type: 'virus',
    description: 'Virusygdom der overfoeres af bladlus (primaert havrebladlus). Kan foraarsage alvorlige udbyttetab sserligt i tidligt saaet vinterhvede og vaarbyg.',
    lifecycle: 'Overfoeres af bladlus paa persistent maade. Havrebladlus (R. padi) er vigtigste vektor. Virus formerer sig i floem-vaevet. Ingen froe-overforsel.',
    identification: 'Roedfarvet bladspidser, dvaergvaekst. Gulfarvet bladvaev i byg. Pletter eller striber med misfarvet vaev. Kraftigst ved tidlig infektion.',
    crops_affected: 'vinterhvede, vaarbyg, havre',
    risk_factors: 'Tidlig saaning (foer 20. september), mild efteraar/vinter, hoj bladluspopulation, groen bro-effekt',
    economic_impact: 'Udbyttetab paa 30-80% ved tidlig infektion af modtagelige sorter. Sjaelden epidemisk, men alvorlig naar det forekommer.',
  },
];

// ─── Treatments ──────────────────────────────────────────────────────────────

interface TreatmentRecord {
  pest_id: string;
  approach: string;
  treatment: string;
  active_substance: string;
  timing: string;
  dose_rate: string;
  efficacy_notes: string;
  resistance_risk: string;
  approval_status: string;
  source: string;
}

const treatments: TreatmentRecord[] = [
  // septoria-tritici
  {
    pest_id: 'septoria-tritici',
    approach: 'chemical',
    treatment: 'Prosaro (prothioconazole + tebuconazole)',
    active_substance: 'prothioconazole 125 g/l + tebuconazole 125 g/l',
    timing: 'BBCH 37-61, naar sygdommen er konstateret paa 3. oeverste blad',
    dose_rate: '0.5-1.0 l/ha',
    efficacy_notes: 'God effekt mod Septoria. Bedst som blanding med SDHI. Maaks 2 behandlinger per saeson.',
    resistance_risk: 'Moderat. Azol-resistens er stigende i DK. Anvend altid i blanding.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'septoria-tritici',
    approach: 'chemical',
    treatment: 'Balaya (mefentrifluconazole + fluxapyroxad)',
    active_substance: 'mefentrifluconazole 75 g/l + fluxapyroxad 50 g/l',
    timing: 'BBCH 32-61',
    dose_rate: '1.0-1.5 l/ha',
    efficacy_notes: 'Ny azol med bedre effekt mod azolresistente Septoria-stammer. SDHI-komponenten giver bredspektret virkning.',
    resistance_risk: 'Lavere resistensrisiko end aeldre azoler, men SDHI-resistens skal monitoreres.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'septoria-tritici',
    approach: 'non_chemical',
    treatment: 'Resistent sortsvalg',
    active_substance: '',
    timing: 'Ved saaning',
    dose_rate: '',
    efficacy_notes: 'Vaelg sorter med hoej Septoria-resistens (8-9 paa Landsforsogenes skala). Vasentligste forebyggende tiltag.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation, Sortsforsog',
  },
  {
    pest_id: 'septoria-tritici',
    approach: 'non_chemical',
    treatment: 'Sen saatid og stubbearbejdning',
    active_substance: '',
    timing: 'Efteraar',
    dose_rate: '',
    efficacy_notes: 'Sen saaning (efter 20. september) reducerer smittetrykket. Stubbearbejdning nedbryder inficerede planterester.',
    resistance_risk: '',
    approval_status: '',
    source: 'Aarhus Universitet, Institut for Agroekologi',
  },

  // gulrust
  {
    pest_id: 'gulrust',
    approach: 'chemical',
    treatment: 'Prosaro (prothioconazole + tebuconazole)',
    active_substance: 'prothioconazole 125 g/l + tebuconazole 125 g/l',
    timing: 'Ved foerste symptomer, typisk BBCH 30-39',
    dose_rate: '0.5-0.8 l/ha',
    efficacy_notes: 'Hurtig kurative effekt mod gulrust. Azol-baserede midler er foerstevalg.',
    resistance_risk: 'Lav resistensrisiko for gulrust mod azoler.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'gulrust',
    approach: 'non_chemical',
    treatment: 'Resistent sortsvalg',
    active_substance: '',
    timing: 'Ved saaning',
    dose_rate: '',
    efficacy_notes: 'Vigtigste bekaempelse. Vaelg sorter med hoej gulrustresistens. Resistensbrydning kan forekomme med nye racer.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation, Landsforsogene',
  },

  // brunrust
  {
    pest_id: 'brunrust',
    approach: 'chemical',
    treatment: 'Prosaro (prothioconazole + tebuconazole)',
    active_substance: 'prothioconazole 125 g/l + tebuconazole 125 g/l',
    timing: 'Ved symptomer paa faneblad eller 2. blad, BBCH 55-69',
    dose_rate: '0.5-0.8 l/ha',
    efficacy_notes: 'God effekt mod brunrust. Sent angreb kan bekaempes i forbindelse med aksbehandling.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // meldug
  {
    pest_id: 'meldug',
    approach: 'chemical',
    treatment: 'Talius (proquinazid)',
    active_substance: 'proquinazid 200 g/l',
    timing: 'BBCH 25-39, forebyggende eller ved foerste symptomer',
    dose_rate: '0.15-0.25 l/ha',
    efficacy_notes: 'Specialmiddel mod meldug. God forebyggende effekt. Ingen effekt mod andre sygdomme.',
    resistance_risk: 'Moderat. Krydsresistens med QoI-midler er ikke paavist.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'meldug',
    approach: 'non_chemical',
    treatment: 'Resistent sortsvalg og tilpasset kvaelstofgoedning',
    active_substance: '',
    timing: 'Ved saaning og goedningsplanlsegning',
    dose_rate: '',
    efficacy_notes: 'Vaelg sorter med hoej meldugresistens. Undgaa overgoedskning med kvaelstof. Undgaa for taet saaning.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation',
  },

  // fusarium
  {
    pest_id: 'fusarium',
    approach: 'chemical',
    treatment: 'Prosaro (prothioconazole + tebuconazole)',
    active_substance: 'prothioconazole 125 g/l + tebuconazole 125 g/l',
    timing: 'BBCH 61-69 (blomstring). Timing er afgoerende — maa ramme blomstringen.',
    dose_rate: '0.8-1.0 l/ha',
    efficacy_notes: 'Bedste kemiske bekaempelse mod akseskimmel. Reducerer baade udbyttetab og mykotoksinindhold (DON). Effekten afhaenger staerkt af korrekt timing.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'fusarium',
    approach: 'non_chemical',
    treatment: 'Saedskifte og plejning af halm',
    active_substance: '',
    timing: 'Foer saaning',
    dose_rate: '',
    efficacy_notes: 'Undgaa hvede efter majs (hoejeste risiko). Ploejning nedmulder inficerede planterester. Resistent sortsvalg reducerer risiko.',
    resistance_risk: '',
    approval_status: '',
    source: 'Aarhus Universitet, SEGES Innovation',
  },

  // rapsjordlopper
  {
    pest_id: 'rapsjordlopper',
    approach: 'chemical',
    treatment: 'Karate (lambda-cyhalothrin)',
    active_substance: 'lambda-cyhalothrin 100 g/l',
    timing: 'September-oktober ved >5 biller per fangbakke over 3 uger',
    dose_rate: '0.15-0.2 l/ha',
    efficacy_notes: 'Pyrethrider er eneste godkendte insekticidgruppe mod rapsjordlopper i DK efter neonicotinoidforbud. Effekten er begrsenset mod larver i plantevevet.',
    resistance_risk: 'Stigende pyrethroidresistens rapporteret i nabolande (UK, DE). Monitoreres i DK.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'rapsjordlopper',
    approach: 'non_chemical',
    treatment: 'Fangbakke-overvaagning og saatidspunkt',
    active_substance: '',
    timing: 'August-oktober',
    dose_rate: '',
    efficacy_notes: 'Gule fangbakker i markkanten fra august. Bekaempelsestseeskel: 5 biller per fangbakke over 3 uger. Sen saaning kan reducere angreb.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation, Plantevaern Online',
  },

  // bladlus-korn
  {
    pest_id: 'bladlus-korn',
    approach: 'chemical',
    treatment: 'Pirimor (pirimicarb)',
    active_substance: 'pirimicarb 500 g/kg',
    timing: 'BBCH 51-69, ved >40% straa med lus',
    dose_rate: '0.15-0.3 kg/ha',
    efficacy_notes: 'Selektivt middel der skaarner nyttedyr (mariehons, snyltehvepse). Forstevalg mod bladlus i korn i Danmark.',
    resistance_risk: 'Lav til moderat. Krydsresistens med carbamates mulig.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'bladlus-korn',
    approach: 'non_chemical',
    treatment: 'Nyttedyr (snyltehvepse, mariehons)',
    active_substance: '',
    timing: 'Hele vaekstperioden',
    dose_rate: '',
    efficacy_notes: 'Naturlige fjender kan holde bladluspopulationer under skadetserkslen. Blomsterstriber og insekthoteller fremmer nyttedyr.',
    resistance_risk: '',
    approval_status: '',
    source: 'Aarhus Universitet, SEGES Innovation',
  },

  // kornbladbille
  {
    pest_id: 'kornbladbille',
    approach: 'chemical',
    treatment: 'Karate (lambda-cyhalothrin)',
    active_substance: 'lambda-cyhalothrin 100 g/l',
    timing: 'BBCH 37-59, ved >0.5-1 larve per straa',
    dose_rate: '0.15 l/ha',
    efficacy_notes: 'Sjaeldent noedvendigt i Danmark. Kun ved meget kraftige angreb paa oeverste blade.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // snegle
  {
    pest_id: 'snegle',
    approach: 'chemical',
    treatment: 'Sluxx HP (jernfosfat)',
    active_substance: 'jern(III)fosfat 30 g/kg',
    timing: 'Ved saaning eller ved foerste tegn paa sneglegnas',
    dose_rate: '5-7 kg/ha',
    efficacy_notes: 'Oekologisk acceptabelt middel. Snegle stopper fodring efter indtagelse. Nedbryder sig til jern og fosfat i jorden.',
    resistance_risk: 'Ingen.',
    approval_status: 'Godkendt i DK (ogsaa oekologisk)',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'snegle',
    approach: 'non_chemical',
    treatment: 'Tromling og stubbearbejdning',
    active_substance: '',
    timing: 'Efteraar, foer og efter saaning',
    dose_rate: '',
    efficacy_notes: 'Tromling knuser snegle og aegklynger. Overfladisk harvning (2-3 cm) stoerer sneglene. Stubbearbejdning reducerer levesteder.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation',
  },

  // kartoffelskimmel
  {
    pest_id: 'kartoffelskimmel',
    approach: 'chemical',
    treatment: 'Revus (mandipropamid)',
    active_substance: 'mandipropamid 250 g/l',
    timing: 'Forebyggende fra raekkelukking, 7-10 dages interval',
    dose_rate: '0.6 l/ha',
    efficacy_notes: 'God forebyggende effekt. Regnfast. Anvendes i sproejteprogrammer med skiftende virkningsmekanismer.',
    resistance_risk: 'Moderat. Anvend i rotation med andre middelgrupper.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'kartoffelskimmel',
    approach: 'chemical',
    treatment: 'Ranman Top (cyazofamid)',
    active_substance: 'cyazofamid 160 g/l',
    timing: 'Forebyggende, 7-10 dages interval',
    dose_rate: '0.5 l/ha',
    efficacy_notes: 'Alternativ virkningsmekanisme til CAA-midler. God effekt mod knoldssmitte.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // ukrudt-rajgraes
  {
    pest_id: 'ukrudt-rajgraes',
    approach: 'chemical',
    treatment: 'Boxer (prosulfocarb)',
    active_substance: 'prosulfocarb 800 g/l',
    timing: 'Pre-emergence eller tidlig post-emergence (BBCH 10-13)',
    dose_rate: '2.0-3.0 l/ha',
    efficacy_notes: 'Jordvirkende middel med god effekt mod rajgraes og agerraeveahle. Krsever fugtighed i jorden for optimal virkning.',
    resistance_risk: 'Lav. Anden virkningsmekanisme end ACCase/ALS.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'ukrudt-rajgraes',
    approach: 'non_chemical',
    treatment: 'Saedskifte med vaarsaed og plejning',
    active_substance: '',
    timing: 'Ssdskifteplanlsegning',
    dose_rate: '',
    efficacy_notes: 'Afbryd med vaarsaed hvert 2.-3. aar. Plejning nedmulder froe, der mister spiringsevnen. Forsinkelsessaaning (falsk saabed) reducerer froebanken.',
    resistance_risk: '',
    approval_status: '',
    source: 'Aarhus Universitet, SEGES Innovation',
  },

  // ukrudt-kamille
  {
    pest_id: 'ukrudt-kamille',
    approach: 'chemical',
    treatment: 'Express (tribenuron-methyl)',
    active_substance: 'tribenuron-methyl 500 g/kg',
    timing: 'Foraar, BBCH 20-32 i afgroeden',
    dose_rate: '7.5-15 g/ha (1/2 til 1 tablet/ha)',
    efficacy_notes: 'God effekt mod kamille. ALS-haemmer. Billigt og effektivt, men ALS-resistens er stigende.',
    resistance_risk: 'Hoej. ALS-resistens hos kamille er paavist i DK. Varieer virkningsmekanisme.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // ukrudt-fuglegraes
  {
    pest_id: 'ukrudt-fuglegraes',
    approach: 'chemical',
    treatment: 'Stomp CS (pendimethalin)',
    active_substance: 'pendimethalin 455 g/l',
    timing: 'Pre-emergence eller tidlig post-emergence',
    dose_rate: '1.5-2.0 l/ha',
    efficacy_notes: 'Jordvirkende middel med god effekt mod fuglegraes i vinterraps og vinterhvede.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // phoma-raps
  {
    pest_id: 'phoma-raps',
    approach: 'chemical',
    treatment: 'Prosaro (prothioconazole + tebuconazole)',
    active_substance: 'prothioconazole 125 g/l + tebuconazole 125 g/l',
    timing: 'Efteraar, BBCH 14-18, ved >10% planter med bladpletter',
    dose_rate: '0.5-0.8 l/ha',
    efficacy_notes: 'Forebyggende behandling om efteraaret kan reducere rodhalsraad om foraaret. Effekten afhaenger af timing.',
    resistance_risk: 'Lav til moderat.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'phoma-raps',
    approach: 'non_chemical',
    treatment: 'Saedskifte (mindst 4 aar mellem raps)',
    active_substance: '',
    timing: 'Saedskifteplanlsegning',
    dose_rate: '',
    efficacy_notes: 'Mindst 4 aars pause mellem rapsafgroeder paa samme areal. Resistent sortsvalg er det vigtigste tiltag.',
    resistance_risk: '',
    approval_status: '',
    source: 'SEGES Innovation',
  },

  // skulpesnudebille
  {
    pest_id: 'skulpesnudebille',
    approach: 'chemical',
    treatment: 'Biscaya (thiacloprid)',
    active_substance: 'thiacloprid 240 g/l',
    timing: 'Under blomstring, ved >1 bille per plante',
    dose_rate: '0.3 l/ha',
    efficacy_notes: 'Neonicotinoid til bladbehandling (ikke bejdsning). Effektiv mod skulpesnudebille. EU-revurdering kan pavirke tilgsngelighed.',
    resistance_risk: 'Lav.',
    approval_status: 'Udgaaet i EU/DK (anvendelsesfrist udloebet). Alternative midler: pyrethrider.',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'skulpesnudebille',
    approach: 'chemical',
    treatment: 'Mavrik Vita (tau-fluvalinat)',
    active_substance: 'tau-fluvalinat 240 g/l',
    timing: 'Afblomstring, ved >1 bille per plante',
    dose_rate: '0.15-0.2 l/ha',
    efficacy_notes: 'Pyrethroid med god effekt mod skulpesnudebille. Kan anvendes under blomstring da den er bi-sikker sammenlignet med andre pyrethrider.',
    resistance_risk: 'Lav til moderat.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // trips
  {
    pest_id: 'trips',
    approach: 'chemical',
    treatment: 'Karate (lambda-cyhalothrin)',
    active_substance: 'lambda-cyhalothrin 100 g/l',
    timing: 'BBCH 51-69, ved konstaterede angreb',
    dose_rate: '0.15 l/ha',
    efficacy_notes: 'Sjeldent loensomt i Danmark. Kun relevant i maltbyg ved meget kraftige angreb.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },

  // havrerodsot
  {
    pest_id: 'havrerodsot',
    approach: 'chemical',
    treatment: 'Karate (lambda-cyhalothrin) mod bladlus-vektor',
    active_substance: 'lambda-cyhalothrin 100 g/l',
    timing: 'Efteraar, ved bladlusindflyvning (BBCH 11-25)',
    dose_rate: '0.15-0.2 l/ha',
    efficacy_notes: 'Bekaemper bladlusvektoren, ikke virus direkte. Kun relevant ved tidlig saaning og konstateret bladlusindflyvning.',
    resistance_risk: 'Lav.',
    approval_status: 'Godkendt i DK',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    pest_id: 'havrerodsot',
    approach: 'non_chemical',
    treatment: 'Saatidspunkt og sortsvalg',
    active_substance: '',
    timing: 'Ved saaning',
    dose_rate: '',
    efficacy_notes: 'Udskyd saaning af vinterhvede til efter 20. september. Vaelg tolerante sorter. Tidlig saaning oeger risikoen vasentligt.',
    resistance_risk: '',
    approval_status: '',
    source: 'Aarhus Universitet, SEGES Innovation',
  },
];

// ─── IPM Guidance ────────────────────────────────────────────────────────────

interface IpmRecord {
  crop_id: string;
  pest_id: string | null;
  threshold: string;
  monitoring_method: string;
  cultural_controls: string;
  prevention: string;
  decision_guide: string;
  source: string;
}

const ipmGuidance: IpmRecord[] = [
  {
    crop_id: 'vinterhvede',
    pest_id: 'septoria-tritici',
    threshold: 'Septoria paa 3. oeverste blad ved BBCH 37-39. Registreringsnettet viser regionsspecifikke anbefalinger.',
    monitoring_method: 'Ugentlig inspektion af nedre blade fra BBCH 30. Brug Plantevaern Onlines beslutningsstoettesystem.',
    cultural_controls: 'Stubbearbejdning, resistent sortsvalg, sen saatid, saedskifte vaek fra hvede-paa-hvede.',
    prevention: 'Forebyggelse via sortsvalg og saedskifte reducerer behovet for kemisk bekaempelse med 30-50%.',
    decision_guide: 'Fuld/halv dosis afhaengt af sortens modtagelighed. Se sortsblandets bekaempelsesbehov i Landsforsogene.',
    source: 'SEGES Innovation, Plantevaern Online',
  },
  {
    crop_id: 'vinterhvede',
    pest_id: 'bladlus-korn',
    threshold: '40% straa med bladlus i perioden BBCH 51-69. Under 40%: nyttedyr klarer det oftest.',
    monitoring_method: 'Undersoeg 40 straa spredt i marken. Taels straa med mindst 1 bladlus.',
    cultural_controls: 'Bevar nyttedyr (undgaa bredspektrede insekticider). Blomsterstriber og levende hegn fremmer nyttedyr.',
    prevention: 'Tidlig overvagning og nyttedyrfremmende tiltag reducerer behovet for insekticidbehandling.',
    decision_guide: 'Brug Pirimor (selektivt) fremfor pyrethrider. Pyrethrider draeber ogsaa nyttedyr og kan forvaerre problemet.',
    source: 'SEGES Innovation, Plantevaern Online',
  },
  {
    crop_id: 'vinterraps',
    pest_id: 'rapsjordlopper',
    threshold: '5 biller per gul fangbakke over 3 uger i september-oktober.',
    monitoring_method: 'Gule fangbakker placeres i markkanten fra august. Taelles ugentligt. Registrer i Plantevaern Online.',
    cultural_controls: 'Hurtig etablering, kraftige planter modstaar angreb bedre. Undgaa raps taet paa foregaaende aars rapsareal.',
    prevention: 'Saabed og saatidspunkt er afgoerende. Sene saatider (efter 20. august) kan reducere angreb men ogsaa svekke etablering.',
    decision_guide: 'Pyrethroidbehandling kun ved overskriden af skadetaerskel. Spraejt om aftenen naar billerne er aktive.',
    source: 'SEGES Innovation',
  },
  {
    crop_id: 'vinterraps',
    pest_id: 'snegle',
    threshold: 'Sneglefalder: >4 snegle per faelde over 3 naetter indikerer bekaempelsesbehov.',
    monitoring_method: 'Sneglefaelder (fugtet saekkestof/braedt paa 25x25 cm) udlaegges i marken. Taelles efter 3 naetter.',
    cultural_controls: 'Tromling efter saaning. Overfladisk harvning (2-3 cm). Fjern planterester fra overfladen.',
    prevention: 'God jordbearbejdning reducerer sneglebestanden. Undgaa direkte saaning i marker med sneglehistorik.',
    decision_guide: 'Jernfosfat-pellets (Sluxx HP) er foerstevalg. Metaldehyd er udgaaet i DK.',
    source: 'SEGES Innovation',
  },
  // General IPM principles (EU Directive 2009/128/EC)
  {
    crop_id: 'alle_afgroeder',
    pest_id: null,
    threshold: 'Skadetaerskler er afgroede- og skadegoererspecifikke. Se Plantevaern Onlines anbefalinger for aktuelle taerskler.',
    monitoring_method: 'Regelmaessig markinspektion. Brug Plantevaern Onlines registreringsnet og varslingssystemer.',
    cultural_controls: 'Saedskifte, resistente sorter, tilpasset saatid, mekanisk ukrudtsbekaempelse, balanceret goedning.',
    prevention: '8 IPM-principper (EU-direktiv 2009/128/EF): (1) Forebyggelse via saedskifte, sortsvalg, hygiejne. (2) Overvaagning med faelder, inspektioner, varslingssystemer. (3) Beslutning baseret paa skadetaerskler. (4) Ikke-kemisk bekaempelse foerst (mekanisk, biologisk, termisk). (5) Reduceret dosering og praecisionssprojdtning. (6) Antiresistensstrategi (skift virkningsmekanisme). (7) Evaluering af effekt. (8) Registrering i sprojtejournal.',
    decision_guide: 'Sprojtejournal er lovpligtig i DK. Sprojtecertifikat (sprojtebevis) er obligatorisk og skal fornyes hvert 4. aar. Pesticidafgift beregnes efter belastningsindikator (BI) med differentierede afgiftssatser.',
    source: 'Miljostyrelsen, EU-direktiv 2009/128/EF, Bekendtgorelse om plantevaernsmidler',
  },
  {
    crop_id: 'kartofler',
    pest_id: 'kartoffelskimmel',
    threshold: 'Forebyggende behandling fra raekkeslutning. Ingen egentlig skadetaeerskel — sprojt foer angreb starter.',
    monitoring_method: 'Daglig inspektion fra raekkeslutning. Brug Blight Management (bladskimmelvarslinger) for beslutningsstoette.',
    cultural_controls: 'Resistent sortsvalg, fjern affaldsbunker (smittekilde), certificeret laeggekartoffel, bred raekkeafstand.',
    prevention: 'Forebyggende sproejtning er afgoerende. Start ved raekkeslutning, 7-10 dages interval. Skift virkningsmekanisme for at forsinke resistens.',
    decision_guide: 'Programsproejtning med skiftende midler (CAA, QiI, carbamat). Start med kontaktmidler, skift til systemiske ved hoejt tryk.',
    source: 'Aarhus Universitet, SEGES Innovation, Kartoffelafgiftsfonden',
  },
];

// ─── Symptoms ────────────────────────────────────────────────────────────────

interface SymptomRecord {
  pest_id: string;
  symptom: string;
  plant_part: string;
  timing: string;
  confidence: string;
}

const symptoms: SymptomRecord[] = [
  { pest_id: 'septoria-tritici', symptom: 'Gule/brune pletter med sorte pyknidier', plant_part: 'blade', timing: 'BBCH 25-69', confidence: 'high' },
  { pest_id: 'septoria-tritici', symptom: 'Sammenflydende nekrotiske omraader paa nedre blade', plant_part: 'nedre blade', timing: 'BBCH 30-45', confidence: 'high' },
  { pest_id: 'gulrust', symptom: 'Gule pustler i striber langs bladnerverne', plant_part: 'blade', timing: 'BBCH 25-69', confidence: 'high' },
  { pest_id: 'gulrust', symptom: 'Stribet monster af sporer paa bladoverfladen', plant_part: 'blade, bladskeder', timing: 'BBCH 30-59', confidence: 'high' },
  { pest_id: 'brunrust', symptom: 'Runde, brune pustler spredt tilfaeldigt paa blade', plant_part: 'blade', timing: 'BBCH 55-77', confidence: 'high' },
  { pest_id: 'meldug', symptom: 'Hvidt svampelag paa blade og bladskeder', plant_part: 'blade, bladskeder', timing: 'BBCH 20-59', confidence: 'high' },
  { pest_id: 'meldug', symptom: 'Graabrunt svampelag med sorte frugtlegemer', plant_part: 'blade', timing: 'BBCH 40-69', confidence: 'medium' },
  { pest_id: 'fusarium', symptom: 'Blegte aks eller aksdele', plant_part: 'aks', timing: 'BBCH 65-85', confidence: 'high' },
  { pest_id: 'fusarium', symptom: 'Orange-rosa sporemasser paa aks', plant_part: 'aks', timing: 'BBCH 69-85', confidence: 'high' },
  { pest_id: 'fusarium', symptom: 'Skrumpne, hvidlige kerner', plant_part: 'kerner', timing: 'BBCH 85-92', confidence: 'medium' },
  { pest_id: 'rapsjordlopper', symptom: 'Runde huller i kimblade og unge blade', plant_part: 'blade', timing: 'BBCH 09-14', confidence: 'high' },
  { pest_id: 'rapsjordlopper', symptom: 'Larveminering i bladstilke og staengler', plant_part: 'bladstilke, staengler', timing: 'BBCH 14-50', confidence: 'high' },
  { pest_id: 'bladlus-korn', symptom: 'Groenne/roede kolonier paa blade eller i aks', plant_part: 'blade, aks', timing: 'BBCH 37-75', confidence: 'high' },
  { pest_id: 'bladlus-korn', symptom: 'Honningdug og sodskimmel', plant_part: 'hele planten', timing: 'BBCH 51-77', confidence: 'medium' },
  { pest_id: 'kornbladbille', symptom: 'Aflange vinduesstriber i blade', plant_part: 'blade', timing: 'BBCH 30-59', confidence: 'high' },
  { pest_id: 'kornbladbille', symptom: 'Larver med sort slim paa blade', plant_part: 'blade', timing: 'BBCH 32-55', confidence: 'high' },
  { pest_id: 'snegle', symptom: 'Ujaevne huller i kimblade, slimspor', plant_part: 'kimblade, blade', timing: 'BBCH 07-14', confidence: 'high' },
  { pest_id: 'snegle', symptom: 'Helt afgnevet kimblad', plant_part: 'kimblade', timing: 'BBCH 09-12', confidence: 'medium' },
  { pest_id: 'kartoffelskimmel', symptom: 'Moerke, vandige pletter paa blade', plant_part: 'blade', timing: 'juni-august', confidence: 'high' },
  { pest_id: 'kartoffelskimmel', symptom: 'Hvid skimmelvaekst paa bladunderside', plant_part: 'bladunderside', timing: 'juni-august', confidence: 'high' },
  { pest_id: 'kartoffelskimmel', symptom: 'Brunlige pletter paa knolde', plant_part: 'knolde', timing: 'hoest', confidence: 'medium' },
  { pest_id: 'havrerodsot', symptom: 'Roedfarvet bladspidser', plant_part: 'blade', timing: 'BBCH 20-50', confidence: 'high' },
  { pest_id: 'havrerodsot', symptom: 'Dvaergvaekst og reduceret bestockning', plant_part: 'hele planten', timing: 'BBCH 15-40', confidence: 'medium' },
  { pest_id: 'phoma-raps', symptom: 'Lyse bladpletter med moerke pyknidier', plant_part: 'blade', timing: 'BBCH 14-19 (efteraar)', confidence: 'high' },
  { pest_id: 'phoma-raps', symptom: 'Moerke laesioner paa rodhalsen', plant_part: 'rodhals', timing: 'BBCH 50-85 (foraar)', confidence: 'high' },
  { pest_id: 'skulpesnudebille', symptom: 'Huller i skulpevssgen', plant_part: 'skulper', timing: 'BBCH 71-80', confidence: 'high' },
  { pest_id: 'ukrudt-rajgraes', symptom: 'Tuedannende graes i kornbestanden', plant_part: 'hele planten', timing: 'BBCH 13-30', confidence: 'high' },
];

// ─── Approved Products ───────────────────────────────────────────────────────

interface ProductRecord {
  product_name: string;
  active_substance: string;
  target_pests: string;
  approved_crops: string;
  approval_expiry: string;
  registration_number: string;
  source: string;
}

const approvedProducts: ProductRecord[] = [
  {
    product_name: 'Prosaro EC 250',
    active_substance: 'Prothioconazole 125 g/l + tebuconazole 125 g/l',
    target_pests: 'Septoria, gulrust, brunrust, akseskimmel, phoma',
    approved_crops: 'Vinterhvede, vinterbyg, vaarbyg, rug, triticale, vinterraps',
    approval_expiry: '2027-07-31',
    registration_number: 'DK-18-00841',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Balaya',
    active_substance: 'Mefentrifluconazole 75 g/l + fluxapyroxad 50 g/l',
    target_pests: 'Septoria, gulrust, brunrust, meldug, ramularia',
    approved_crops: 'Vinterhvede, vinterbyg, vaarbyg, rug, triticale',
    approval_expiry: '2028-04-30',
    registration_number: 'DK-21-01123',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Pirimor 500 WG',
    active_substance: 'Pirimicarb 500 g/kg',
    target_pests: 'Bladlus',
    approved_crops: 'Korn, raps, kartofler, groentsager',
    approval_expiry: '2026-10-31',
    registration_number: 'DK-1-00052',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Karate 2.5 WG',
    active_substance: 'Lambda-cyhalothrin 25 g/kg',
    target_pests: 'Rapsjordlopper, kornbladbille, trips, bladlus, skulpesnudebille',
    approved_crops: 'Korn, raps, kartofler, roer',
    approval_expiry: '2027-06-30',
    registration_number: 'DK-4-00312',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Sluxx HP',
    active_substance: 'Jern(III)fosfat 30 g/kg',
    target_pests: 'Snegle',
    approved_crops: 'Alle afgroeder (ogsaa okologisk)',
    approval_expiry: '2029-12-31',
    registration_number: 'DK-12-00678',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Talius',
    active_substance: 'Proquinazid 200 g/l',
    target_pests: 'Meldug',
    approved_crops: 'Vinterhvede, vinterbyg, vaarbyg, rug, triticale',
    approval_expiry: '2027-11-30',
    registration_number: 'DK-10-00489',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Revus',
    active_substance: 'Mandipropamid 250 g/l',
    target_pests: 'Kartoffelskimmel',
    approved_crops: 'Kartofler',
    approval_expiry: '2028-01-31',
    registration_number: 'DK-08-00401',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Ranman Top',
    active_substance: 'Cyazofamid 160 g/l',
    target_pests: 'Kartoffelskimmel',
    approved_crops: 'Kartofler',
    approval_expiry: '2027-09-30',
    registration_number: 'DK-09-00445',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Boxer EC',
    active_substance: 'Prosulfocarb 800 g/l',
    target_pests: 'Graesukrudt (rajgraes, agerraeveahle)',
    approved_crops: 'Vinterhvede, vinterbyg, vinterrug',
    approval_expiry: '2027-12-31',
    registration_number: 'DK-14-00723',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Express 50 SX',
    active_substance: 'Tribenuron-methyl 500 g/kg',
    target_pests: 'Tokimbladet ukrudt (kamille, fuglegrsees, tvetand)',
    approved_crops: 'Vinterhvede, vaarbyg, havre, rug',
    approval_expiry: '2026-12-31',
    registration_number: 'DK-3-00198',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Stomp CS',
    active_substance: 'Pendimethalin 455 g/l',
    target_pests: 'Tokimbladet ukrudt og graesukrudt',
    approved_crops: 'Vinterhvede, vinterbyg, vinterraps, kartofler',
    approval_expiry: '2027-05-31',
    registration_number: 'DK-6-00355',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
  {
    product_name: 'Mavrik Vita',
    active_substance: 'Tau-fluvalinat 240 g/l',
    target_pests: 'Skulpesnudebille, rapsjordlopper, bladlus',
    approved_crops: 'Vinterraps, varraps',
    approval_expiry: '2028-03-31',
    registration_number: 'DK-16-00795',
    source: 'Middeldatabasen (middeldatabasen.dk)',
  },
];

// ─── Insert Data ─────────────────────────────────────────────────────────────

console.log('Inserting Danish pest management data...');

const insertPest = db.instance.prepare(`
  INSERT OR REPLACE INTO pests (id, name, common_names, pest_type, description, lifecycle, identification, crops_affected, risk_factors, economic_impact, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DK')
`);

const insertTreatment = db.instance.prepare(`
  INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DK')
`);

const insertIpm = db.instance.prepare(`
  INSERT INTO ipm_guidance (crop_id, pest_id, threshold, monitoring_method, cultural_controls, prevention, decision_guide, source, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DK')
`);

const insertSymptom = db.instance.prepare(`
  INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
  VALUES (?, ?, ?, ?, ?)
`);

const insertProduct = db.instance.prepare(`
  INSERT INTO approved_products (product_name, active_substance, target_pests, approved_crops, approval_expiry, registration_number, source, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'DK')
`);

const insertFts = db.instance.prepare(`
  INSERT INTO search_index (name, common_names, description, identification, pest_type, jurisdiction)
  VALUES (?, ?, ?, ?, ?, 'DK')
`);

const insertAll = db.instance.transaction(() => {
  // Pests
  for (const p of pests) {
    insertPest.run(p.id, p.name, p.common_names, p.pest_type, p.description, p.lifecycle, p.identification, p.crops_affected, p.risk_factors, p.economic_impact);
  }
  console.log(`  Inserted ${pests.length} pests`);

  // Treatments
  for (const t of treatments) {
    insertTreatment.run(t.pest_id, t.approach, t.treatment, t.active_substance, t.timing, t.dose_rate, t.efficacy_notes, t.resistance_risk, t.approval_status, t.source);
  }
  console.log(`  Inserted ${treatments.length} treatments`);

  // IPM Guidance
  for (const g of ipmGuidance) {
    insertIpm.run(g.crop_id, g.pest_id, g.threshold, g.monitoring_method, g.cultural_controls, g.prevention, g.decision_guide, g.source);
  }
  console.log(`  Inserted ${ipmGuidance.length} IPM guidance records`);

  // Symptoms
  for (const s of symptoms) {
    insertSymptom.run(s.pest_id, s.symptom, s.plant_part, s.timing, s.confidence);
  }
  console.log(`  Inserted ${symptoms.length} symptoms`);

  // Approved Products
  for (const p of approvedProducts) {
    insertProduct.run(p.product_name, p.active_substance, p.target_pests, p.approved_crops, p.approval_expiry, p.registration_number, p.source);
  }
  console.log(`  Inserted ${approvedProducts.length} approved products`);

  // FTS5 index
  for (const p of pests) {
    insertFts.run(p.name, p.common_names, p.description, p.identification, p.pest_type);
  }
  console.log(`  Built FTS5 search index (${pests.length} entries)`);
});

insertAll();

// ─── Metadata ────────────────────────────────────────────────────────────────

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('pest_count', ?)", [String(pests.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('treatment_count', ?)", [String(treatments.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('ipm_count', ?)", [String(ipmGuidance.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('symptom_count', ?)", [String(symptoms.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('product_count', ?)", [String(approvedProducts.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('data_sources', ?)", [
  'Middeldatabasen (middeldatabasen.dk), SEGES Innovation, Aarhus Universitet (Institut for Agroekologi), Miljostyrelsen',
]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'DK')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Denmark Pest Management MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('schema_version', '1.0')", []);

// ─── Coverage JSON ───────────────────────────────────────────────────────────

writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Denmark Pest Management MCP',
  jurisdiction: 'DK',
  jurisdiction_name: 'Denmark',
  build_date: now,
  status: 'populated',
  data_sources: [
    'Middeldatabasen (middeldatabasen.dk)',
    'SEGES Innovation',
    'Aarhus Universitet (Institut for Agroekologi)',
    'Miljostyrelsen',
  ],
  counts: {
    pests: pests.length,
    treatments: treatments.length,
    ipm_guidance: ipmGuidance.length,
    symptoms: symptoms.length,
    approved_products: approvedProducts.length,
  },
  pest_types: {
    disease: pests.filter(p => p.pest_type === 'disease').length,
    insect: pests.filter(p => p.pest_type === 'insect').length,
    weed: pests.filter(p => p.pest_type === 'weed').length,
    mollusc: pests.filter(p => p.pest_type === 'mollusc').length,
    virus: pests.filter(p => p.pest_type === 'virus').length,
  },
  crops_covered: [
    'vinterhvede', 'vinterbyg', 'vaarbyg', 'havre',
    'vinterraps', 'kartofler',
  ],
  disclaimer: 'Data er baseret paa danske godkendelser og anbefalinger. Tjek altid Middeldatabasen for aktuelle godkendelser.',
}, null, 2));

db.close();

console.log(`\nDenmark Pest Management MCP — ingestion complete.`);
console.log(`  ${pests.length} pests, ${treatments.length} treatments, ${ipmGuidance.length} IPM records`);
console.log(`  ${symptoms.length} symptoms, ${approvedProducts.length} approved products`);
console.log(`  Database: data/database.db`);
console.log(`  Coverage: data/coverage.json`);
