// Build a standalone PAL/NTSC PSID from Joplin's first strain and a new groove.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { musicTables } = require('../host/music.cjs');
const { parseSid } = require('../host/sid.cjs');

const root = path.resolve(__dirname, '..');
const compiler = process.env.TASS64 || path.join(root, 'tools/64tass/64tass.exe');
const generated = path.join(root, 'generated');
const output = path.join(root, 'build/entertainer-disco');
const tie = 255;
const hook = [64, 72, tie, 64, 72, tie, 64, 72];
const climb = [tie, tie, tie, tie, tie, 72, 74, 75];
const turn = [76, 72, 74, 76, tie, 71, 74, tie];
const pickup = [72, tie, tie, tie, tie, tie, 62, 63];
const reply = [76, 72, 74, 76, tie, 72, 74, 72];

// The score is in 2/4. Two rows make one disco measure in 4/4.
const lead = [
  hook, climb, turn, pickup,
  hook, [tie, tie, tie, tie, tie, tie, 69, 67],
  [66, 69, 72, 76, tie, 74, 72, 69], [74, tie, tie, tie, tie, tie, 62, 63],
  hook, climb, turn, [72, tie, tie, tie, tie, tie, 72, 74],
  reply, reply, turn, pickup
].flat();

const roots = [36, 41, 36, 43, 36, 41, 38, 43, 36, 41, 36, 43, 36, 34, 43, 36];
const minor = new Set([6, 13]);
const bass = roots.flatMap((note, i) => [
  note, tie, note + 12, tie, note, tie, note + 7, i % 4 === 3 ? roots[(i + 1) % roots.length] - 1 : tie
]);
const kick = 254;
const hat = 253;
const accents = roots.flatMap((note, i) => [
  kick, tie, note + (minor.has(i) ? 27 : 28), hat,
  kick, tie, note + 31, hat
]);
const bytes = (name, values) => `${name}:\n${Array.from({ length: values.length / 16 }, (_, i) =>
  '    .byte ' + values.slice(i * 16, (i + 1) * 16).join(',')).join('\n')}\n`;

fs.mkdirSync(generated, { recursive: true });
fs.mkdirSync(output, { recursive: true });
const pitch = Array.from({ length: 80 }, (_, midi) => midi);
fs.writeFileSync(path.join(generated, 'entertainer-disco.inc'),
  bytes('lead_notes', lead) + bytes('bass_notes', bass) + bytes('accents', accents) + musicTables({ pitch }));
const binary = path.join(output, 'entertainer-disco.bin');
execFileSync(compiler, [
  '-b', '-a', '-o', binary, '--vice-labels', '--labels=' + path.join(output, 'symbols.labels'),
  path.join(root, 'examples/music/entertainer-disco.asm')
], { stdio: 'inherit' });

const header = Buffer.alloc(0x7c);
header.write('PSID');
for (const [offset, value] of [[4, 2], [6, 0x7c], [8, 0xc400], [10, 0xc400], [12, 0xc403], [14, 1], [16, 1], [118, 0x3c]]) {
  header.writeUInt16BE(value, offset);
}
header.write('The Entertainer (Disco)', 22);
header.write('Scott Joplin / C64 demo kit', 54);
header.write('1902 / 2026 CC0-1.0', 86);
const sid = Buffer.concat([header, fs.readFileSync(binary)]);
const parsed = parseSid(sid);
if (parsed.loadAddress + parsed.data.length > 0xd000) throw Error('Disco arrangement exceeds reserved SID RAM');
const file = path.join(output, 'entertainer-disco.sid');
fs.writeFileSync(file, sid);
console.log(file);
