/** Generate an ordered-density charset, palette rows and polar/sine tables on
 * the host. The native renderer only adds, XORs and looks up bytes. Text glyphs
 * remain separate from the sixteen effect glyphs. The mathematical reference
 * below defines the visible 40x20 cell field for emulator comparisons.
 * Original implementation; source attribution and scene contract: docs/CHARACTER.md.
 */
const sine = phase => Math.round(63.5 * (1 + Math.sin((phase & 255) * 2 * Math.PI / 256)));
function polar(x, y) {
  const dx = (x - 19.5) / 2, dy = y - 9.5;
  return [Math.round(96 / Math.max(1, Math.hypot(dx, dy))) & 255, Math.round(Math.atan2(dy, dx) * 128 / Math.PI) & 255];
}

function characterAssets({ font, title, hud, scrollText, palette }) {
  if (!Buffer.isBuffer(font) || font.length !== 512) throw Error('Character font must contain 64 eight-byte glyphs');
  for (const [key, value] of Object.entries({ title, hud, scrollText })) {
    if (typeof value !== 'string' || !/^[\x20-\x5f]+$/.test(value)) throw Error(`${key} must use uppercase C64 font characters`);
    if (key !== 'scrollText' && value.length > 40) throw Error(`${key} exceeds 40 columns`);
  }
  if (!Array.isArray(palette) || palette.length !== 8 || palette.some(n => !Number.isInteger(n) || n < 0 || n > 15)) throw Error('Character palette needs eight color indices 0..15');
  const charset = Buffer.alloc(2048), matrix = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let level = 0; level < 16; level++) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    if (matrix[(y & 3) * 4 + (x & 3)] < level * 16 / 15) charset[level * 8 + y] |= 128 >> x;
  }
  font.copy(charset, 64 * 8);
  const encode = text => Buffer.from([...text].map(c => (c.charCodeAt(0) & 63) + 64));
  const screen = Buffer.alloc(1024), colors = Buffer.alloc(1024, 1);
  encode(title).copy(screen, 21 * 40); encode(hud).copy(screen, 22 * 40);
  for (let y = 0; y < 20; y++) colors.fill(palette[y & 7], y * 40, (y + 1) * 40);
  const radius = Buffer.alloc(800), angle = Buffer.alloc(800);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 40; x++) [radius[y * 40 + x], angle[y * 40 + x]] = polar(x, y);
  return { charset, screen, colors, sine: Buffer.from(Array.from({ length: 256 }, (_, i) => sine(i))), shades: Buffer.from(Array.from({ length: 256 }, (_, i) => i >> 4)), radius, angle, scroll: Buffer.concat([encode(scrollText), Buffer.from([0])]) };
}

function characterFrame(mode, phase) {
  if (![0, 1, 2].includes(mode) || !Number.isSafeInteger(phase)) throw Error('Invalid character effect mode or phase');
  const frame = Buffer.alloc(800);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 40; x++) {
    const sx = sine(x * 5 + phase), sy = sine(y * 8 - phase);
    if (mode === 0) frame[y * 40 + x] = (sx + sy) >> 4;
    if (mode === 1) frame[y * 40 + x] = (sx ^ sy) >> 3;
    if (mode === 2) { const [radius, angle] = polar(x, y); frame[y * 40 + x] = ((radius + phase) ^ angle) & 15; }
  }
  return frame;
}

module.exports = { characterAssets, characterFrame };
