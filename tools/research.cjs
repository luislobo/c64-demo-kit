// Search the source catalogue and verify archived bytes against its provenance
// manifest. Documentation is generated from the same records so credits and
// reuse notes cannot drift between separate hand-maintained lists. No network
// access, downloaded code execution or runtime build changes are involved.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const categories = new Set(['permissive', 'attribution', 'copyleft', 'scoped', 'reference', 'restricted']);

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function checkCatalog(catalog, directory) {
  requireValue(catalog.schemaVersion === 1 && Array.isArray(catalog.entries), 'Invalid catalogue schema');
  const ids = new Set();
  const archived = new Set();
  for (const entry of catalog.entries) {
    requireValue(/^[a-z0-9-]+$/.test(entry.id) && !ids.has(entry.id), `Invalid or duplicate id: ${entry.id}`);
    ids.add(entry.id);
    for (const key of ['title', 'url', 'license', 'caveats', 'opportunity', 'checkedAt', 'review']) {
      requireValue(typeof entry[key] === 'string' && entry[key].trim(), `${entry.id}: missing ${key}`);
    }
    for (const key of ['authors', 'tags', 'creditEvidence']) {
      requireValue(Array.isArray(entry[key]) && entry[key].length && entry[key].every(v => typeof v === 'string' && v.trim()), `${entry.id}: missing ${key}`);
    }
    requireValue(categories.has(entry.reuse), `${entry.id}: unknown reuse category`);
    requireValue(Array.isArray(entry.snapshots) && Array.isArray(entry.licenseFiles), `${entry.id}: invalid archive lists`);
    if (entry.repository) requireValue(/^[a-f0-9]{40}$/.test(entry.revision), `${entry.id}: invalid pinned commit`);
    if (!entry.snapshots.length) continue;
    requireValue(['permissive', 'attribution'].includes(entry.reuse), `${entry.id}: ${entry.reuse} entry has snapshots`);
    requireValue(entry.licenseFiles.length > 0 && entry.licenseEvidence.length > 0, `${entry.id}: missing licenseFiles or licenseEvidence`);
    const bundle = `research/upstream/${entry.id}/`;
    const localPaths = new Set(entry.snapshots.map(file => file.path));
    requireValue(entry.licenseFiles.every(file => localPaths.has(file)), `${entry.id}: licenseFiles are not archived`);
    for (const file of entry.snapshots) {
      requireValue(file.path.startsWith(bundle) && !file.path.includes('\\') && !file.path.split('/').some(p => p === '.' || p === '..'), `${entry.id}: unsafe snapshot path`);
      requireValue(!archived.has(file.path), `${entry.id}: duplicate snapshot path`);
      archived.add(file.path);
      requireValue(/^https:\/\//.test(file.url) && /^[a-f0-9]{64}$/.test(file.sha256), `${entry.id}: missing snapshot provenance`);
      if (entry.repository && file.url.startsWith('https://github.com/')) {
        requireValue(file.url.startsWith(`${entry.url}/blob/${entry.revision}/`), `${entry.id}: snapshot lost its pinned commit`);
      }
      const bytes = fs.readFileSync(path.join(directory, file.path));
      const actual = crypto.createHash('sha256').update(bytes).digest('hex');
      requireValue(actual === file.sha256, `${file.path}: SHA-256 mismatch`);
    }
  }
  const upstream = path.join(directory, 'research/upstream');
  if (fs.existsSync(upstream)) {
    for (const file of fs.readdirSync(upstream, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue;
      const relative = path.relative(directory, path.join(file.parentPath, file.name)).split(path.sep).join('/');
      requireValue(archived.has(relative), `${relative}: file has no provenance record`);
    }
  }
  return { entries: ids.size, snapshots: archived.size };
}

function searchCatalog(entries, query) {
  const words = query.toLocaleLowerCase('en').trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    const text = [entry.id, entry.title, ...entry.authors, ...entry.tags, entry.reuse, entry.license, entry.caveats, entry.opportunity].join(' ').toLocaleLowerCase('en');
    return words.every(word => text.includes(word));
  });
}

function links(urls) {
  return urls.map((url, i) => `[${i + 1}](${url})`).join(', ');
}

function renderSources(catalog) {
  const lines = ['# C64 source catalogue', '', 'Generated from [catalog.json](catalog.json) with `node tools/research.cjs --write`.', '', 'Read [the collection guide](README.md) for scope, reuse categories and integration limits.', '', '| Source | Topics | Reuse category | Archived files |', '| --- | --- | --- | --- |'];
  for (const entry of catalog.entries) {
    lines.push(`| [${entry.title}](#${entry.id}) | ${entry.tags.join(', ')} | ${entry.reuse} | ${entry.snapshots.length} |`);
  }
  for (const entry of catalog.entries) {
    lines.push('', `<a id="${entry.id}"></a>`, `## ${entry.title}`, '', `[Original source](${entry.url}). Checked ${entry.checkedAt}.`, '', `Credit: ${entry.authors.join('; ')}.`, '', `License record: ${entry.license}. Reuse category: ${entry.reuse}.`, '', `Useful addition: ${entry.opportunity}`, '', `Limits: ${entry.caveats}`, '', `Review scope: ${entry.review}`, '', `Credit evidence: ${links(entry.creditEvidence)}.`);
    if (entry.revision) lines.push('', `Pinned revision: \`${entry.revision}\`.`);
    if (entry.licenseEvidence.length) lines.push('', `License evidence: ${links(entry.licenseEvidence)}.`);
    if (entry.sourceFiles.length) {
      lines.push('', 'Source entry points:', '');
      for (const file of entry.sourceFiles) lines.push(`- [${file.path}](${file.url})`);
    }
    if (entry.snapshots.length) lines.push('', `Archived source: [${entry.id}](upstream/${entry.id}/). File URLs and SHA-256 values are in the manifest.`);
    if (entry.archive) lines.push('', `Release archive: [download](${entry.archive.url}), SHA-256 \`${entry.archive.sha256}\`.`);
  }
  return lines.join('\n') + '\n';
}

function renderCredits(catalog) {
  const lines = ['# Source credits and license notices', '', 'Generated from [catalog.json](catalog.json) with `node tools/research.cjs --write`.', '', 'All original source snapshots are unmodified. Their creators retain their copyright and license terms.', 'A source listed only as a reference is linked, not redistributed. Source availability alone is not a reuse grant.', '', 'Retain this record and each copied source notice when adapting a snapshot. Add the specific routine, original author, source URL, revision and modifications to the resulting module and release credits.', '', 'Article text is CC BY 4.0; Raistlin also offers the article code under MIT. The original article headers preserve this declaration. Other productions and linked images retain their original rights.', '', 'This collection does not license the rest of the kit or give permission to reuse an unrelated tune or artwork.'];
  for (const entry of catalog.entries) {
    lines.push('', `## ${entry.title}`, '', `${entry.authors.join('; ')}. [Source](${entry.url}).`, '', `License record: ${entry.license}.`, '', `Attribution evidence: ${links(entry.creditEvidence)}.`);
    if (!entry.snapshots.length) { lines.push('', 'Linked reference only. No source snapshot copied.'); continue; }
    lines.push('', `Unmodified snapshot: [${entry.id}](upstream/${entry.id}/).`, '', 'Preserved license notices:', '');
    for (const local of entry.licenseFiles) lines.push(`- [${local.replace('research/', '')}](${encodeURI(local.replace(/^research\//, ''))})`);
    lines.push('', entry.caveats);
    for (const notice of entry.notices || []) lines.push('', 'Supporting documentation notice:', '', '```text', notice.replace(/[ \t]+$/gm, ''), '```');
  }
  return lines.join('\n') + '\n';
}

function main(args) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'research/catalog.json'), 'utf8'));
  if (args[0] === '--check' || args[0] === '--write') {
    requireValue(args.length === 1, 'Use --check or --write alone');
    const report = checkCatalog(catalog, root);
    for (const [name, body] of [['SOURCES.md', renderSources(catalog)], ['CREDITS.md', renderCredits(catalog)]]) {
      const file = path.join(root, 'research', name);
      if (args[0] === '--write') fs.writeFileSync(file, body);
      else requireValue(fs.readFileSync(file, 'utf8') === body, `${name} is stale; run --write`);
    }
    console.log(`${report.entries} entries and ${report.snapshots} archived files verified; source and credit indexes are current.`);
    return;
  }
  requireValue(args.every(arg => !arg.startsWith('--')), 'Usage: node tools/research.cjs [search words | --check | --write]');
  for (const entry of searchCatalog(catalog.entries, args.join(' '))) {
    console.log(`${entry.id}: ${entry.title}\n  ${entry.authors.join('; ')}\n  ${entry.reuse}: ${entry.license}\n  ${entry.url}\n  ${entry.opportunity}\n`);
  }
}

module.exports = { checkCatalog, searchCatalog };
if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
