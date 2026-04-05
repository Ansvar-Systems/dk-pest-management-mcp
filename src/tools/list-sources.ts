import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Middeldatabasen',
      authority: 'Aarhus Universitet / Miljostyrelsen',
      official_url: 'https://middeldatabasen.dk',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'monthly',
      license: 'Public data (Danish government)',
      coverage: 'Godkendte plantebeskyttelsesmidler, aktivstoffer og anvendelsesvilkaar i Danmark',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'SEGES Innovation',
      authority: 'SEGES Innovation (Landbrug & Fodevarer)',
      official_url: 'https://www.seges.dk',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'quarterly',
      license: 'Public agricultural guidance',
      coverage: 'Plantevaernsanbefalinger, skadetaerskler, sortsvalg og IPM-vejledning for danske afgroeder',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Aarhus Universitet (Institut for Agroekologi)',
      authority: 'Aarhus Universitet',
      official_url: 'https://agro.au.dk',
      retrieval_method: 'PUBLICATION_REVIEW',
      update_frequency: 'annual',
      license: 'Academic publications',
      coverage: 'Forskningsbaseret viden om skadedyr, sygdomme, ukrudt og integreret plantevaern',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Miljostyrelsen (Pesticidregistrering)',
      authority: 'Miljostyrelsen',
      official_url: 'https://mst.dk/kemi/pesticider/',
      retrieval_method: 'BULK_DOWNLOAD',
      update_frequency: 'monthly',
      license: 'Public data (Danish government)',
      coverage: 'Pesticidafgifter, belastningsindikatorer, regelvaerk for plantevaernsmidler',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://middeldatabasen.dk' }),
  };
}
