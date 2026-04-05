# Denmark Pest Management MCP

[![CI](https://github.com/ansvar-systems/dk-pest-management-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ansvar-systems/dk-pest-management-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/ansvar-systems/dk-pest-management-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/ansvar-systems/dk-pest-management-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Danish pest, disease, and weed management via the [Model Context Protocol](https://modelcontextprotocol.io). Identify crop threats, get treatment options, IPM guidance, and run symptom-based differential diagnosis -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Farmers and agronomists need quick access to pest identification, treatment options, and IPM thresholds. This information is published by Middeldatabasen, SEGES Innovation, and Aarhus Universitet but is scattered across databases, knowledge portals, and research publications. This MCP server brings it all together in a searchable, structured format.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pest-management": {
      "command": "npx",
      "args": ["-y", "@ansvar/dk-pest-management-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add dk-pest-management npx @ansvar/dk-pest-management-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/dk-pest-management/mcp
```

### Docker (self-hosted)

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/dk-pest-management-mcp:latest
```

### npm (stdio)

```bash
npx @ansvar/dk-pest-management-mcp
```

## Example Queries

Ask your AI assistant:

- "Hvilke sygdomme angriber vinterhvede?"
- "Jeg ser gule pletter paa mine hvedeblade med sorte prikker -- hvad kan det vaere?"
- "Hvad er behandlingsmulighederne for rajgraes?"
- "Vis IPM-vejledning for Septoria i vinterhvede"
- "Hvilke produkter med prothioconazole er godkendt til hvede?"
- "Hvilke skadedyr og ukrudt angriber vaarbyg?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 10 (3 meta + 7 domain) |
| Jurisdiction | DK |
| Data sources | Middeldatabasen, SEGES Innovation, Aarhus Universitet, Miljostyrelsen |
| License (data) | Public data (Danish government and research institutions) |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_pests` | FTS5 search across pest, disease, and weed data |
| `get_pest_details` | Full pest profile with symptoms and identification |
| `get_treatments` | Chemical, cultural, and biological treatment options |
| `get_ipm_guidance` | IPM thresholds, monitoring, and decision guides |
| `search_crop_threats` | All threats affecting a specific crop |
| `identify_from_symptoms` | Symptom-based differential diagnosis with confidence scoring |
| `get_approved_products` | Danish-approved pesticide products from Middeldatabasen |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs 6 security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

Pesticide data is for reference only. **Always check the current Middeldatabasen (middeldatabasen.dk) for approved products and conditions before applying any product.** Pesticide use in Denmark requires a valid spray certificate (sprojtecertifikat). This tool is not professional pest management advice. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data sourced from Danish public government and research institutions.
