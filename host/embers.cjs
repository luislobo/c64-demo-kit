// The VIC displays these two monochrome shapes at full horizontal resolution.
// Tracks use one column per register so the IRQ can index all sprites with X.
const EMBER_STEPS = 64;
const EMBER_COUNT = 8;
const PATHS = [
  // Spawn x/y, horizontal drift, rise, lifetime, phase offset.
  [131, 142, -28, 50, 51, 7],
  [151, 129, -17, 48, 46, 19],
  [177, 131, 22, 48, 52, 41],
  [142, 120, -35, 45, 56, 37],
  [166, 117, 14, 46, 48, 12],
  [190, 142, 40, 59, 56, 52],
  [157, 130, 30, 65, 50, 24],
  [184, 138, 3, 50, 57, 59]
];

function createEmbers(logoHeight) {
  const shapes = Buffer.alloc(128);
  shapes[0] = 0x80;  // One hires pixel.
  shapes[64] = 0x40;
  shapes[67] = 0x80;
  shapes[70] = 0x80; // Three-pixel streak with a slight tilt.

  const tracks = Buffer.alloc((EMBER_COUNT * 3 + 1) * EMBER_STEPS);
  const masks = tracks.subarray(-EMBER_STEPS);
  for (const [slot, [startX, startY, drift, rise, lifetime, phase]] of PATHS.entries()) {
    const offset = slot * 3 * EMBER_STEPS;
    for (let step = 0; step < EMBER_STEPS; step++) {
      const age = ((step + phase) % EMBER_STEPS) / lifetime;
      if (age >= 1) continue;
      const y = Math.round(startY - rise * age * (1.24 - 0.24 * age));
      if (y < logoHeight + 8) continue;
      const sway = 5 * age * Math.sin(age * 8 + slot);
      tracks[offset + step] = 24 + Math.round(startX + drift * age + sway);
      tracks[offset + EMBER_STEPS + step] = 51 + y;
      tracks[offset + 2 * EMBER_STEPS + step] = age < 0.18 ? 7 : age < 0.56 ? 8 : 2;
      masks[step] |= 1 << slot;
    }
  }
  return { shapes, tracks };
}

module.exports = { createEmbers, EMBER_STEPS, EMBER_COUNT };
