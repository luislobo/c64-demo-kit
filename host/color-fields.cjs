// Original sine-sum, XOR and polar fields recolor the 40x23 bitmap logo.
// Precompute trigonometry on the host; the IRQ uses byte arithmetic and tables.
// Both screen matrices receive identical foreground bytes with black backgrounds.
const sine = phase => Math.round(63.5 * (1 + Math.sin((phase & 255) * 2 * Math.PI / 256)));
function polar(x, y) {
  const dx = (x - 19.5) / 2, dy = y - 11;
  return [Math.round(160 / Math.max(1, Math.hypot(dx, dy))) & 255, Math.round(Math.atan2(dy, dx) * 128 / Math.PI) & 255];
}
function colorFieldAssets() {
  const radius = Buffer.alloc(12 * 40), angle = Buffer.alloc(23 * 40);
  for (let y = 0; y < 23; y++) for (let x = 0; x < 40; x++) {
    const [distance, direction] = polar(x, y);
    if (y < 12) radius[y * 40 + x] = distance;
    angle[y * 40 + x] = direction;
  }
  return Buffer.concat([Buffer.from(Array.from({ length: 256 }, (_, i) => sine(i))), radius, angle]);
}
const firePalette = [0x90, 0x90, 0x20, 0x80, 0xa0, 0x70, 0x70, 0x10];
const rowHeat = row => Math.floor(row * 127 / 22);

function firePlasmaAssets() {
  const palette = firePalette.flatMap(color => Array(8).fill(color));
  const heat = Array.from({ length: 23 }, (_, row) => rowHeat(row));
  return Buffer.from([...palette, ...heat]);
}

function colorFieldRow(mode, phase, row, palette, { firePlasma = false } = {}) {
  if (![4, 5, 6].includes(mode)) throw Error('Invalid color field mode');
  if (!Number.isInteger(row) || row < 0 || row >= 23) throw Error('Invalid color field row');
  const result = Buffer.alloc(40);
  const fire = mode === 4 && firePlasma;
  const sy = fire ? (sine(8 * row + phase) + rowHeat(row)) >> 1 : sine(8 * row - phase);
  const colors = fire ? firePalette : palette;
  for (let x = 0; x < 40; x++) {
    const sx = sine(5 * x + phase);
    let shade = mode === 4 ? (sx + sy) >> 5 : (sx ^ sy) >> 4;
    if (mode === 6) { const [radius, angle] = polar(x, row); shade = (((radius + phase) & 255) ^ angle) >> 5; }
    result[x] = colors[shade];
  }
  return result;
}
module.exports = { colorFieldAssets, firePlasmaAssets, colorFieldRow };
