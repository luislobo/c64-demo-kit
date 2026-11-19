// Build a separate character-mode scene from literal application constants.
// Host-generated glyph/polar data and an authorized PSID export stay outside
// native effect loops. A release includes the adapted helper's MIT notice and
// the tune's supplied credits. The default bitmap build is unaffected.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { readConstants } = require('../host/config.cjs');
const { characterAssets } = require('../host/character.cjs');
const { parseSid, prepareSid, sidConstants } = require('../host/sid.cjs');
const { createD64 } = require('../host/d64.cjs');
const root = path.resolve(__dirname, '..');

function buildEffects({ entry = path.join(root, 'effects-demo.asm'), outDir = path.join(root, 'build/effects'), compiler = process.env.TASS64 || path.join(root, 'tools/64tass/64tass.exe') } = {}) {
  entry = path.resolve(entry); outDir = path.resolve(outDir);
  const project = path.dirname(entry), c = readConstants(entry), generated = path.join(project, 'generated');
  if (typeof c.DEMO_NAME !== 'string' || !/^[a-z0-9_-]+$/i.test(c.DEMO_NAME)) throw Error('DEMO_NAME must be a filename stem');
  for (const [key, max] of [['DEMO_DISK_NAME', 16], ['DEMO_PRG_NAME', 16], ['DEMO_DISK_ID', 2]]) {
    if (typeof c[key] !== 'string' || !c[key].length || c[key].length > max) throw Error(`Invalid ${key}`);
  }
  if (![1, 2, 3].includes(c.DEMO_EFFECT_START) || !Number.isInteger(c.DEMO_EFFECT_STEP) || c.DEMO_EFFECT_STEP < 1 || c.DEMO_EFFECT_STEP > 8) throw Error('Effect start must be 1..3 and step 1..8');
  for (const key of ['DEMO_SID_FILE', 'DEMO_FONT_FILE']) if (typeof c[key] !== 'string' || !c[key].trim()) throw Error(`Declare ${key} for the character scene`);
  const music = prepareSid(parseSid(fs.readFileSync(path.resolve(project, c.DEMO_SID_FILE))), c);
  const assets = characterAssets({ font: fs.readFileSync(path.resolve(project, c.DEMO_FONT_FILE)), title: c.DEMO_TITLE, hud: c.DEMO_HUD, scrollText: c.DEMO_SCROLL_TEXT, palette: c.DEMO_PALETTE });
  fs.mkdirSync(generated, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
  for (const [name, data] of Object.entries(assets)) fs.writeFileSync(path.join(generated, 'character-' + name + '.bin'), data);
  fs.writeFileSync(path.join(generated, 'character-config.inc'), sidConstants(music));
  fs.writeFileSync(path.join(generated, 'character-sid.bin'), music.data);
  const prg = path.join(outDir, c.DEMO_NAME + '.prg'), d64 = path.join(outDir, c.DEMO_NAME + '.d64');
  execFileSync(compiler, ['--cbm-prg', '-a', '-o', prg, '--vice-labels', '--labels=' + path.join(outDir, 'symbols.labels'), entry], { cwd: project, stdio: 'inherit' });
  const program = fs.readFileSync(prg);
  fs.writeFileSync(d64, createD64(program, { diskName: c.DEMO_DISK_NAME, diskId: c.DEMO_DISK_ID, filename: c.DEMO_PRG_NAME }));
  const { data, ...credits } = music;
  fs.writeFileSync(path.join(outDir, c.DEMO_NAME + '-music-credits.json'), JSON.stringify(credits, null, 2) + '\n');
  const license = fs.readFileSync(path.join(root, 'research/upstream/c64lib-common/LICENSE'), 'utf8');
  fs.writeFileSync(path.join(outDir, c.DEMO_NAME + '-credits.txt'), 'Character fill and scroll helpers adapted from c64lib by Maciej Małecki and contributors.\nhttps://github.com/c64lib/common\nhttps://github.com/c64lib/text\nSee docs/CHARACTER.md for pinned sources and modifications.\n\n' + license + '\nMusic: ' + credits.credit + '\nLicense: ' + credits.license + '\nSource: ' + credits.source + '\n');
  const report = { entry, prg, d64, programBytes: program.length, effects: ['plasma', 'xor', 'tunnel'], music: credits };
  fs.writeFileSync(path.join(outDir, 'build-report.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

module.exports = { buildEffects };
if (require.main === module) {
  try {
    const options = {}, args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (!['--entry', '--out'].includes(args[i]) || !args[i + 1]) throw Error('Usage: node tools/build-effects.cjs [--entry application.asm] [--out directory]');
      options[args[i] === '--entry' ? 'entry' : 'outDir'] = args[++i];
    }
    console.log(JSON.stringify(buildEffects(options), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
