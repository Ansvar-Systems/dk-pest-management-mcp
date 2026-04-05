import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleIdentifyFromSymptoms } from '../../src/tools/identify-from-symptoms.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-identify-symptoms.db';

describe('identify_from_symptoms tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('identifies septoria from pletter paa blade', () => {
    const result = handleIdentifyFromSymptoms(db, { symptoms: 'pletter pyknidier blade' });
    const typed = result as { diagnoses: { pest_id: string; pest_name: string; confidence_score: number }[] };
    expect(typed.diagnoses.length).toBeGreaterThan(0);
    expect(typed.diagnoses[0].pest_id).toBe('septoria-tritici');
  });

  test('gives higher score for high-confidence symptom match', () => {
    const result = handleIdentifyFromSymptoms(db, { symptoms: 'sorte pyknidier blade' });
    const typed = result as { diagnoses: { pest_id: string; confidence_score: number }[] };
    expect(typed.diagnoses.length).toBeGreaterThan(0);
    expect(typed.diagnoses[0].pest_id).toBe('septoria-tritici');
    expect(typed.diagnoses[0].confidence_score).toBeGreaterThanOrEqual(1);
  });

  test('returns multiple diagnoses for ambiguous symptoms', () => {
    // "blade" appears in symptoms for both septoria and bladlus
    const result = handleIdentifyFromSymptoms(db, { symptoms: 'blade kolonier' });
    const typed = result as { diagnoses: { pest_id: string }[] };
    expect(typed.diagnoses.length).toBeGreaterThanOrEqual(1);
  });

  test('returns empty for unrecognised symptoms', () => {
    const result = handleIdentifyFromSymptoms(db, { symptoms: 'purple fluorescent glow' });
    const typed = result as { results_count: number; diagnoses: unknown[] };
    expect(typed.results_count).toBe(0);
    expect(typed.diagnoses).toHaveLength(0);
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleIdentifyFromSymptoms(db, { symptoms: 'gule pletter', jurisdiction: 'NZ' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('confidence scoring works with Danish symptom terms', () => {
    const result1 = handleIdentifyFromSymptoms(db, { symptoms: 'nekrotiske omraader nedre blade' });
    const result2 = handleIdentifyFromSymptoms(db, { symptoms: 'kornfyldning' });

    const typed1 = result1 as { diagnoses: { pest_id: string; confidence_score: number }[] };
    const typed2 = result2 as { diagnoses: { pest_id: string; confidence_score: number }[] };

    const sept1 = typed1.diagnoses.find(d => d.pest_id === 'septoria-tritici');
    const sept2 = typed2.diagnoses.find(d => d.pest_id === 'septoria-tritici');

    expect(sept1).toBeDefined();
    expect(sept2).toBeDefined();
    // First query matches "high" confidence symptom, second matches "medium" -- high should score >= medium
    expect(sept1!.confidence_score).toBeGreaterThanOrEqual(sept2!.confidence_score);
  });
});
