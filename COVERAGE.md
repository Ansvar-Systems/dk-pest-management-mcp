# Coverage

## What Is Included

- **Pest profiles**: diseases, weeds, insects, and other pests affecting Danish arable crops (vinterhvede, vinterbyg, vaarbyg, havre, vinterraps, kartofler)
- **Symptom database** with confidence levels (high, medium) for differential diagnosis
- **Treatment options**: chemical (with active substances, timing, dose rates, resistance risk), cultural, and biological approaches
- **IPM guidance**: monitoring thresholds, decision guides, cultural controls based on EU Directive 2009/128/EC and Danish implementation
- **Approved products**: Danish pesticide approvals from Middeldatabasen

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| DK | Denmark | Supported |

## What Is NOT Included

- **Other Nordic countries** -- separate MCP servers cover Sweden, Norway, Finland
- **EU product approvals outside DK** -- only Middeldatabasen-approved products are included
- **Detailed resistance mapping** -- general resistance risk notes are included, not full resistance surveys
- **Real-time product approval changes** -- Middeldatabasen updates are ingested periodically, not in real time
- **Horticultural and ornamental pests** -- primary focus is arable crops in v0.1.0
- **Organic-specific guidance** -- some organic-approved products are included (e.g. Sluxx HP) but organic certification guidance is not
- **Spray application technology** -- always refer to product labels for current authorised rates and application methods

## Known Gaps

1. Symptom database coverage depends on available published descriptions
2. FTS5 search quality varies with query phrasing -- use specific pest or symptom terms for best results
3. Approved product data depends on Middeldatabasen publication schedule; always verify current approvals before use

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.
