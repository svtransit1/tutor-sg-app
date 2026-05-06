// Validation test for the model registry schema.
// Run: node --import tsx __tests__/registry.test.ts
// Or: npx tsx __tests__/registry.test.ts

import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import registrySchema from '../src/schema/registry.schema.json' with { type: 'json' };
import { SAMPLE_REGISTRY } from '../src/schema/registry';

const ajv = new Ajv2020({ strict: true });
addFormats(ajv);

const validate = ajv.compile(registrySchema);

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

// 1. Schema compiles without errors
console.log('✓ Schema compiles');

// 2. SAMPLE_REGISTRY validates against the schema
const valid = validate(SAMPLE_REGISTRY);
if (!valid) {
  console.error('Validation errors:', JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
console.log('✓ SAMPLE_REGISTRY validates');

// 3. Required fields are enforced
const missingField = SAMPLE_REGISTRY.map(e => {
  const copy = { ...e };
  // @ts-expect-error — intentionally removing required field
  delete (copy as any).sha256;
  return copy;
});
assert(!validate(missingField), 'Should reject entries missing sha256');
console.log('✓ Required field enforcement works');

// 4. Invalid quantization level is rejected
const badQuant = SAMPLE_REGISTRY.map(e => ({ ...e, quant: 'bad_quant' as any }));
assert(!validate(badQuant), 'Should reject invalid quant level');
console.log('✓ Enum validation works (quant)');

// 5. Invalid model family is rejected
const badFamily = SAMPLE_REGISTRY.map(e => ({ ...e, modelFamily: 'gemma-1' as any }));
assert(!validate(badFamily), 'Should reject invalid model family');
console.log('✓ Enum validation works (modelFamily)');

// 6. sha256 pattern is enforced
const badHash = SAMPLE_REGISTRY.map(e => ({ ...e, sha256: 'not-a-hash' }));
assert(!validate(badHash), 'Should reject invalid sha256');
console.log('✓ sha256 pattern validation works');

// 7. Empty cdnUrls is rejected
const emptyUrls = SAMPLE_REGISTRY.map(e => ({ ...e, cdnUrls: [] }));
assert(!validate(emptyUrls), 'Should reject empty cdnUrls');
console.log('✓ cdnUrls minItems enforcement works');

// 8. Two placeholder entries exist
assert(SAMPLE_REGISTRY.length === 2, `Expected 2 entries, got ${SAMPLE_REGISTRY.length}`);
console.log('✓ Two placeholder entries present');

console.log('\nAll 8 tests passed.');
