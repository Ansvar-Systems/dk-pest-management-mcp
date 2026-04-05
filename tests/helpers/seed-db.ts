import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Pests
  db.run(
    `INSERT INTO pests (id, name, common_names, pest_type, description, lifecycle, identification, crops_affected, risk_factors, economic_impact, images_description, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'septoria-tritici', 'Septoria (Septoria tritici)', JSON.stringify(['hvedebladplet', 'Septoria tritici blotch', 'STB']),
      'disease', 'Den vigtigste bladsvampesygdom i dansk vinterhvede. Foraarsager betydelige udbyttetab i fugtige aar.',
      'Overvintrer i stubresterne. Spredes via regnspaenk. Udvikler sig i fugtigt vejr (>6 timer bladfugt).',
      'Gule/brune pletter med sorte pyknidier paa blade. Starter nederst i bestanden.',
      JSON.stringify(['vinterhvede', 'vinterbyg']),
      'Tidlig saaning, modtagelige sorter, hvede efter hvede, rigelig nedbor',
      'Udbyttetab paa 10-30% i ubehandlede marker i fugtige aar.',
      'Gule/brune pletter med sorte pyknidier paa bladoverflade',
      'DK',
    ]
  );
  db.run(
    `INSERT INTO pests (id, name, common_names, pest_type, description, lifecycle, identification, crops_affected, risk_factors, economic_impact, images_description, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ukrudt-rajgraes', 'Agerraeveahle / Rajgraes (Alopecurus myosuroides / Lolium spp.)', JSON.stringify(['agerraeveahle', 'rajgraes', 'blackgrass']),
      'weed', 'Tuedannende graesukrudt med stigende herbicidresistens i Danmark.',
      'Fremspiring primaert om efteraaret. Froproduktion op til 10.000 froe per plante.',
      'Tuedannende graesukrudt. Stigende herbicidresistens i DK.',
      JSON.stringify(['vinterhvede', 'vinterbyg', 'vinterraps']),
      'Ensidig vinterkornsdyrkning, reduceret jordbearbejdning, gentagen brug af ACCase/ALS-herbicider',
      'Udbyttetab paa 20-50% ved kraftig bestand. Herbicidresistens oeger omkostningerne.',
      'Tuedannende graes i kornbestand',
      'DK',
    ]
  );
  db.run(
    `INSERT INTO pests (id, name, common_names, pest_type, description, lifecycle, identification, crops_affected, risk_factors, economic_impact, images_description, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'bladlus-korn', 'Bladlus i korn (Sitobion avenae / Rhopalosiphum padi)', JSON.stringify(['kornbladlus', 'havrebladlus', 'grain aphid']),
      'insect', 'Kornbladlus og havrebladlus er de vigtigste bladlusarter i dansk korn.',
      'Havrebladlus overvintrer paa haeg. Indflyvning i kornmarker fra maj.',
      'Groenne eller roede kolonier, ofte i aks eller paa flag/fanebladet.',
      JSON.stringify(['vinterhvede', 'vaarbyg', 'havre']),
      'Varmt, toert foraar, tidlig indflyvning, fravaer af nyttedyr',
      'Direkte sugetab op til 10-15% ved staerke angreb.',
      'Groenne/roede bladluskolonier paa kornaks',
      'DK',
    ]
  );

  // Symptoms -- Septoria (3 symptoms at different confidence levels)
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['septoria-tritici', 'Gule/brune pletter med sorte pyknidier', 'blade', 'BBCH 25-69', 'high']
  );
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['septoria-tritici', 'Sammenflydende nekrotiske omraader paa nedre blade', 'nedre blade', 'BBCH 30-45', 'high']
  );
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['septoria-tritici', 'Reduceret kornfyldning ved svaere angreb', 'aks', 'BBCH 70-85', 'medium']
  );

  // Symptoms -- Rajgraes (2 symptoms)
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['ukrudt-rajgraes', 'Tuedannende graes i kornbestanden', 'hele planten', 'BBCH 13-30', 'high']
  );
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['ukrudt-rajgraes', 'Tynde eller forkroebne afgroedepletter med graesukrudtskonkurrence', 'hele planten', 'foraar', 'medium']
  );

  // Symptoms -- Bladlus (2 symptoms)
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['bladlus-korn', 'Groenne/roede kolonier paa blade eller i aks', 'blade, aks', 'BBCH 37-75', 'high']
  );
  db.run(
    `INSERT INTO symptoms (pest_id, symptom, plant_part, timing, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    ['bladlus-korn', 'Honningdug og sodskimmel', 'blade', 'BBCH 51-77', 'medium']
  );

  // Treatments -- Septoria (1 chemical, 1 cultural)
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'septoria-tritici', 'chemical', 'Prosaro (prothioconazole + tebuconazole)',
      'prothioconazole 125 g/l + tebuconazole 125 g/l', 'BBCH 37-61',
      '0.5-1.0 l/ha', 'God effekt mod Septoria. Bedst som blanding med SDHI.',
      'Moderat. Azol-resistens er stigende i DK.',
      'Godkendt i DK', 'Middeldatabasen', 'DK',
    ]
  );
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'septoria-tritici', 'non_chemical', 'Resistent sortsvalg og sen saatid',
      null, 'Ved saaning',
      null, 'Vaelg sorter med hoej Septoria-resistens. Sen saaning reducerer smittetrykket.',
      null, null, 'SEGES Innovation', 'DK',
    ]
  );

  // Treatments -- Rajgraes (1 chemical, 1 cultural)
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ukrudt-rajgraes', 'chemical', 'Boxer (prosulfocarb)',
      'prosulfocarb 800 g/l', 'Pre-emergence eller tidlig post-emergence',
      '2.0-3.0 l/ha', 'Jordvirkende middel med god effekt mod rajgraes.',
      'Lav. Anden virkningsmekanisme end ACCase/ALS.',
      'Godkendt i DK', 'Middeldatabasen', 'DK',
    ]
  );
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ukrudt-rajgraes', 'non_chemical', 'Saedskifte med vaarsaed og ploejning',
      null, 'Saedskifteplanlsegning',
      null, 'Afbryd med vaarsaed hvert 2.-3. aar. Ploejning nedmulder froe.',
      null, null, 'SEGES Innovation', 'DK',
    ]
  );

  // Treatments -- Bladlus (1 chemical, 1 cultural)
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'bladlus-korn', 'chemical', 'Pirimor (pirimicarb)',
      'pirimicarb 500 g/kg', 'BBCH 51-69, ved >40% straa med lus',
      '0.15-0.3 kg/ha', 'Selektivt middel der skaaner nyttedyr.',
      'Lav til moderat.',
      'Godkendt i DK', 'Middeldatabasen', 'DK',
    ]
  );
  db.run(
    `INSERT INTO treatments (pest_id, approach, treatment, active_substance, timing, dose_rate, efficacy_notes, resistance_risk, approval_status, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'bladlus-korn', 'non_chemical', 'Nyttedyr (snyltehvepse, mariehons)',
      null, 'Hele vaekstperioden',
      null, 'Naturlige fjender kan holde bladluspopulationer under skadetaersklen.',
      null, null, 'SEGES Innovation', 'DK',
    ]
  );

  // IPM guidance -- vinterhvede + septoria
  db.run(
    `INSERT INTO ipm_guidance (crop_id, pest_id, threshold, monitoring_method, cultural_controls, prevention, decision_guide, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'vinterhvede', 'septoria-tritici',
      'Septoria paa 3. oeverste blad ved BBCH 37-39',
      'Ugentlig inspektion af nedre blade fra BBCH 30. Brug Plantevaern Onlines beslutningsstoettesystem.',
      'Resistent sortsvalg, sen saatid, stubbearbejdning, saedskifte',
      'Forebyggelse via sortsvalg og saedskifte reducerer behovet for kemisk bekaempelse med 30-50%.',
      'Fuld/halv dosis afhaengt af sortens modtagelighed. Se Landsforsogene.',
      'SEGES Innovation', 'DK',
    ]
  );

  // Approved products
  db.run(
    `INSERT INTO approved_products (product_name, active_substance, target_pests, approved_crops, approval_expiry, registration_number, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Prosaro EC 250', 'prothioconazole 125 g/l + tebuconazole 125 g/l', 'Septoria, gulrust, brunrust, akseskimmel',
      'vinterhvede, vinterbyg, vaarbyg', '2027-07-31', 'DK-18-00841', 'Middeldatabasen', 'DK',
    ]
  );
  db.run(
    `INSERT INTO approved_products (product_name, active_substance, target_pests, approved_crops, approval_expiry, registration_number, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Pirimor 500 WG', 'pirimicarb 500 g/kg', 'Bladlus',
      'korn, raps, kartofler', '2026-10-31', 'DK-1-00052', 'Middeldatabasen', 'DK',
    ]
  );

  // FTS5 search index entries for all 3 pests
  db.run(
    `INSERT INTO search_index (name, common_names, description, identification, pest_type, jurisdiction) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'Septoria (Septoria tritici)', 'hvedebladplet, Septoria tritici blotch, STB',
      'Den vigtigste bladsvampesygdom i dansk vinterhvede. Foraarsager betydelige udbyttetab i fugtige aar.',
      'Gule/brune pletter med sorte pyknidier paa blade. Starter nederst i bestanden.',
      'disease', 'DK',
    ]
  );
  db.run(
    `INSERT INTO search_index (name, common_names, description, identification, pest_type, jurisdiction) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'Agerraeveahle / Rajgraes (Alopecurus myosuroides / Lolium spp.)', 'agerraeveahle, rajgraes, blackgrass',
      'Tuedannende graesukrudt med stigende herbicidresistens i Danmark.',
      'Tuedannende graesukrudt. Stigende herbicidresistens i DK.',
      'weed', 'DK',
    ]
  );
  db.run(
    `INSERT INTO search_index (name, common_names, description, identification, pest_type, jurisdiction) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'Bladlus i korn (Sitobion avenae / Rhopalosiphum padi)', 'kornbladlus, havrebladlus, grain aphid',
      'Kornbladlus og havrebladlus er de vigtigste bladlusarter i dansk korn.',
      'Groenne eller roede kolonier, ofte i aks eller paa flag/fanebladet.',
      'insect', 'DK',
    ]
  );

  return db;
}
