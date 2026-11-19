// Verify source attribution and integrity at the archive boundary. Fixtures use
// a real source bundle so a changed file or missing license cannot pass silently.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { checkCatalog, searchCatalog } = require('../tools/research.cjs');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'research/catalog.json')));

function fixture(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'c64-research-'));
  const entry = structuredClone(catalog.entries.find(e => e.id === 'c64lib-common'));
  for (const file of entry.snapshots) {
    const target = path.join(dir, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file.path), target);
  }
  try { run({ schemaVersion: 1, entries: [entry] }, dir, entry); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('the collected archive has complete credits and unchanged source bytes', () => {
  assert.doesNotThrow(() => checkCatalog(catalog, root));
});

test('search finds an author and subject together without case sensitivity', () => {
  const found = searchCatalog(catalog.entries, 'MACIEJ raster');
  assert.ok(found.some(e => e.id === 'copper64'));
  assert.equal(searchCatalog(catalog.entries, 'no-such-c64-source-xyz').length, 0);
});

test('a changed source byte fails integrity validation', () => fixture((data, dir, entry) => {
  fs.appendFileSync(path.join(dir, entry.snapshots[0].path), '\nchanged\n');
  assert.throws(() => checkCatalog(data, dir), /SHA-256/);
}));

test('an archived bundle requires named attribution and license files', () => fixture((data, dir, entry) => {
  entry.authors = [];
  assert.throws(() => checkCatalog(data, dir), /authors/);
  entry.authors = ['Maciej Małecki'];
  entry.licenseFiles = [];
  assert.throws(() => checkCatalog(data, dir), /licenseFiles/);
}));

test('a reference-only entry cannot contain redistributed source', () => fixture((data, dir, entry) => {
  entry.reuse = 'reference';
  assert.throws(() => checkCatalog(data, dir), /reference.*snapshots/);
}));

test('snapshot paths cannot escape their source bundle', () => fixture((data, dir, entry) => {
  entry.snapshots.find(file => file.path.endsWith('.asm')).path = '../outside.asm';
  assert.throws(() => checkCatalog(data, dir), /snapshot path/);
}));

test('GitHub source snapshots must retain the pinned commit', () => fixture((data, dir, entry) => {
  entry.revision = '0'.repeat(40);
  assert.throws(() => checkCatalog(data, dir), /pinned commit/);
}));
