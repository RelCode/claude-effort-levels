// Scores a variant's validator against scorecard/cases.json.
//
//   node scorecard/score.mjs <module path> [export name]
//
// The export defaults to `validate`. It may return a boolean or an object.
// Objects are read loosely (valid/isValid/ok, dateOfBirth/dob/birthDate, ...)
// because the weaker-context variants were never told the exact shape.
// If the module can't be imported in Node (e.g. it touches `document` at load),
// write a small adapter module that re-exports the function and score that.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [modulePath, exportName = 'validate'] = process.argv.slice(2);
if (!modulePath) {
  console.error('usage: node scorecard/score.mjs <module path> [export name]');
  process.exit(2);
}

const { cases } = JSON.parse(readFileSync(new URL('./cases.json', import.meta.url), 'utf8'));
const mod = await import(pathToFileURL(resolve(modulePath)).href);
const fn = mod[exportName] ?? mod.default?.[exportName] ?? (exportName === 'validate' ? mod.default : undefined);
if (typeof fn !== 'function') {
  console.error(`No function export "${exportName}" in ${modulePath}. Exports: ${Object.keys(mod).join(', ') || '(none)'}`);
  process.exit(2);
}

const pick = (obj, keys) => {
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
};

function normalise(raw) {
  if (typeof raw === 'boolean') return { valid: raw };
  if (!raw || typeof raw !== 'object') return { valid: undefined };
  const dob = pick(raw, ['dateOfBirth', 'dob', 'birthDate', 'birthdate', 'date_of_birth', 'dateOfBirthIso']);
  const gender = pick(raw, ['gender', 'sex']);
  const citizenship = pick(raw, ['citizenship', 'citizenshipStatus', 'citizen', 'status', 'residency']);
  return {
    valid: pick(raw, ['valid', 'isValid', 'ok']),
    dateOfBirth: dob instanceof Date
      ? `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`
      : typeof dob === 'string' ? dob.slice(0, 10) : dob,
    gender: typeof gender === 'string' ? (/^f/i.test(gender) ? 'female' : /^m/i.test(gender) ? 'male' : gender) : gender,
    citizenship: typeof citizenship === 'string'
      ? (/perm/i.test(citizenship) ? 'permanent_resident' : /refug/i.test(citizenship) ? 'refugee' : /citizen/i.test(citizenship) ? 'citizen' : citizenship)
      : citizenship,
  };
}

let validityPass = 0;
let fieldPass = 0;
let fieldTotal = 0;
const failures = [];

for (const c of cases) {
  let got;
  try {
    got = normalise(await fn(c.input));
  } catch (err) {
    // Throwing on bad input counts as rejecting it.
    got = { valid: false, threw: err?.message ?? String(err) };
  }

  const problems = [];
  if (got.valid === c.expected.valid) validityPass++;
  else problems.push(`valid: expected ${c.expected.valid}, got ${got.threw ? `throw (${got.threw})` : got.valid}`);

  if (c.expected.valid) {
    for (const field of ['dateOfBirth', 'gender', 'citizenship']) {
      fieldTotal++;
      if (got[field] === c.expected[field]) fieldPass++;
      else problems.push(`${field}: expected ${c.expected[field]}, got ${got[field] === undefined ? '(missing)' : JSON.stringify(got[field])}`);
    }
  }

  if (problems.length) failures.push({ c, problems });
}

const pct = (n, d) => `${((100 * n) / d).toFixed(0)}%`;
console.log(`Module:   ${modulePath} (${exportName})`);
console.log(`Validity: ${validityPass}/${cases.length} (${pct(validityPass, cases.length)})`);
console.log(`Fields:   ${fieldPass}/${fieldTotal} (${pct(fieldPass, fieldTotal)})`);

if (failures.length) {
  console.log(`\nFailures (${failures.length}):`);
  for (const { c, problems } of failures) {
    console.log(`  ${c.id} ${JSON.stringify(c.input)}: ${c.desc}`);
    for (const p of problems) console.log(`      ${p}`);
  }
}

process.exitCode = failures.length ? 1 : 0;
