// Generate an original PSID export from its assembly source. Pitch tables are
// host-computed; the header is big endian while raw 6510 payload bytes are not.
// No external song, executable or package is downloaded or executed.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { musicTables } = require('../host/music.cjs');
const { parseSid } = require('../host/sid.cjs');
const root = path.resolve(__dirname, '..');

function buildExampleMusic(compiler = process.env.TASS64 || path.join(root, 'tools/64tass/64tass.exe')) {
  const generated = path.join(root, 'generated');
  const output = path.join(root, 'build/example-music');
  fs.mkdirSync(generated, { recursive: true }); fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(generated, 'example-music.inc'), musicTables({
    lead: [60, 64, 67, 72, 71, 67, 64, 62, 65, 69, 72, 76, 74, 72, 69, 65],
    bass: [36, 36, 36, 36, 36, 36, 36, 36, 41, 41, 41, 41, 41, 41, 41, 41],
    arp: [48, 52, 55, 60, 48, 52, 55, 60, 53, 57, 60, 65, 53, 57, 60, 65],
  }));
  const binary = path.join(output, 'clockwork.bin');
  execFileSync(compiler, ['-b', '-a', '-o', binary, '--vice-labels', '--labels=' + path.join(output, 'symbols.labels'), path.join(root, 'examples/music/clockwork.asm')], { stdio: 'inherit' });
  const header = Buffer.alloc(0x7c);
  header.write('PSID');
  for (const [offset, value] of [[4, 2], [6, 0x7c], [8, 0xc400], [10, 0xc400], [12, 0xc403], [14, 1], [16, 1], [118, 0x3c]]) header.writeUInt16BE(value, offset);
  header.write('Clockwork', 22); header.write('C64 demo kit contributors', 54); header.write('2026 CC0-1.0', 86);
  const bytes = Buffer.concat([header, fs.readFileSync(binary)]);
  const sid = parseSid(bytes);
  if (sid.loadAddress + sid.data.length > 0xd000) throw Error('Example music exceeds its reserved region');
  const file = path.join(generated, 'clockwork.sid'); fs.writeFileSync(file, bytes);
  return file;
}

module.exports = { buildExampleMusic };
if (require.main === module) {
  try { console.log(buildExampleMusic()); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
