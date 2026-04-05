import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Denmark Pest Management MCP',
    description:
      'Danish pest, disease, and weed identification, treatment options, IPM guidance, and symptom-based ' +
      'differential diagnosis. Data sourced from Middeldatabasen, SEGES Innovation, Aarhus Universitet, ' +
      'and Miljostyrelsen.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: ['Middeldatabasen', 'SEGES Innovation', 'Aarhus Universitet', 'Miljostyrelsen'],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/dk-pest-management-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
