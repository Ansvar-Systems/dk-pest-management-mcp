export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Data er baseret paa danske godkendelser og anbefalinger fra Middeldatabasen, SEGES Innovation, ' +
  'Aarhus Universitet og Miljostyrelsen. Disse data erstatter ikke professionel raadgivning. ' +
  'Kontakt altid en planteavlskonsulent foer beslutning om plantevaern. ' +
  'Tjek altid Middeldatabasen (middeldatabasen.dk) for aktuelle godkendelser og vilkaar. ' +
  'Pesticidanvendelse i Danmark kraever gyldigt sprojtecertifikat.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://middeldatabasen.dk',
    copyright: 'Data: Middeldatabasen, SEGES Innovation, Aarhus Universitet, Miljostyrelsen. Server: Apache-2.0 Ansvar Systems.',
    server: 'dk-pest-management-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
