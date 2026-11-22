// Paint a campfire in VIC colors. Each multicolor cell has three fixed local
// colors plus black. Coloring the whole loop at once keeps the palette stable
// while standard bitmap patches change the pixels.
const WIDTH = 320;
const HEIGHT = 184;
const BASE = 157;
const TAU = 2 * Math.PI;

// Approximate RGB values are used only to choose colors from the VIC palette.
const RGB = [
  [0, 0, 0], [255, 255, 255], [126, 53, 42], [106, 187, 199],
  [124, 55, 146], [84, 160, 66], [47, 38, 113], [210, 202, 103],
  [166, 98, 40], [85, 56, 20], [188, 106, 91], [49, 49, 49],
  [105, 105, 105], [146, 212, 132], [109, 95, 184], [165, 165, 165]
];
const delta = RGB.map(a => RGB.map(b =>
  2 * (a[0] - b[0]) ** 2 + 3 * (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2));
const palettes = [];
for (let a = 1; a < 14; a++) {
  for (let b = a + 1; b < 15; b++) {
    for (let c = b + 1; c < 16; c++) {
      const colors = [0, a, b, c];
      palettes.push({ colors, cost: RGB.map((_, k) => Math.min(...colors.map(color => delta[color][k]))) });
    }
  }
}

function hash(x, y) {
  const n = Math.imul(x + 81, 0x1f123bb5) ^ Math.imul(y + 373, 0x5f356495);
  return (Math.imul(n ^ (n >>> 15), 0x45d9f3b) >>> 8) & 255;
}

function ellipse(pixels, cx, cy, rx, ry, color) {
  for (let y = Math.max(0, Math.floor(cy - ry)); y < Math.min(HEIGHT, cy + ry + 1); y++) {
    for (let x = Math.max(0, Math.floor(cx - rx)); x < Math.min(WIDTH, cx + rx + 1); x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) pixels[y * WIDTH + x] = color;
    }
  }
}

function trees(pixels) {
  // Overlapping silhouettes with dark branch gaps and occasional edge light.
  for (const [color, offset, distance] of [[6, 0, 17], [11, 11, 0]]) {
    for (let i = 0; i < 15; i++) {
      const cx = 4 + i * 23 + offset;
      if (Math.abs(cx - 160) < 67 - distance || cx >= WIDTH) continue;
      const bottom = 149 - distance + (hash(i, offset) % 9);
      const top = bottom - 26 - (hash(i, 47 + offset) % (47 - distance));
      for (let y = Math.max(0, top); y < bottom; y++) {
        const height = y - top;
        const spread = height / (bottom - top);
        const tier = (height + i % 5) % 11;
        const half = Math.floor(spread * (8 + 0.85 * tier) + 1);
        for (let x = Math.max(0, cx - half); x <= Math.min(WIDTH - 1, cx + half); x++) {
          const edge = Math.abs(cx - x);
          if (tier < 2 && edge > half - 5 && edge > 2) continue;
          // Stipple the distant ridge and the sides of foreground branches.
          // Group pixel pairs so the texture survives multicolor packing.
          const shade = ((x >> 1) + (y >> 1) * 3 + i) & 3;
          if (color === 6 && shade > 1) continue;
          if (color === 11 && edge > half / 2 && shade === 3) continue;
          pixels[y * WIDTH + x] = color;
        }
      }
    }
  }
}

function landscape() {
  const pixels = new Uint8Array(WIDTH * HEIGHT);
  for (let y = 74; y < 124; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (Math.abs(x - 160) > 45 && hash(x >> 1, y) === 231 && hash(y, x >> 1) < 48) {
        pixels[y * WIDTH + x] = hash(x >> 1, y + 28) < 48 ? 12 : 6;
      }
    }
  }
  trees(pixels);
  for (let y = 147; y < 176; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const glow = ((x - 160) / 121) ** 2 + ((y - 169) / 28) ** 2;
      const grain = hash(x >> 2, y + (x >> 4));
      if (glow < 1 && grain < 180 * (1 - glow)) {
        pixels[y * WIDTH + x] = glow < 0.48 && grain < 30 ? 8 : 9;
      } else if (grain < 43 * (y - 146) / 30) {
        pixels[y * WIDTH + x] = 11;
      }
    }
  }
  return pixels;
}

function stones(pixels, front) {
  for (let i = 0; i < 13; i++) {
    const angle = TAU * (i + 0.15) / 13;
    const depth = Math.sin(angle);
    if ((depth > 0) !== front) continue;
    const cx = Math.round(160 + 79 * Math.cos(angle));
    const cy = Math.round(154 + 14 * depth) + hash(i, 106) % 3 - 1;
    const wide = 8 + Math.round(Math.abs(depth) * 7) + hash(i, 31) % 5;
    const tall = 4 + hash(i, 61) % 4;
    const slope = (hash(i, 98) % 9 - 4) * 0.07;
    for (let y = cy - tall; y <= cy + tall; y++) {
      for (let x = cx - wide; x <= cx + wide; x++) {
        const side = (x - cx) / wide;
        const face = (y - cy) / tall - side * slope;
        if (Math.abs(face) > 1 || Math.abs(side) + 0.48 * Math.abs(face) > 1.12) continue;
        const grain = hash((x + i) >> 1, y);
        const warm = Math.abs(x - 160) < 54;
        const facet = face + 0.3 * side;
        let color = facet > 0.38 ? 11 : 12;
        if (facet < -0.25) color = warm && (Math.abs(side) < 0.68 || grain > 106) ? 8 : 15;
        if (facet < -0.42 && warm && grain < 32) color = 15;
        if (Math.abs(side) > 0.85 || face > 0.78) color = 11;
        pixels[y * WIDTH + x] = color;
      }
    }
  }
}

function coalBed(pixels, turn) {
  ellipse(pixels, 160, 160, 68, 12, 9);
  for (let i = 0; i < 30; i++) {
    const cx = 101 + hash(i, 90) % 118;
    const cy = 155 + hash(i, 97) % 13;
    if (((cx - 160) / 66) ** 2 + ((cy - 160) / 12) ** 2 > 1) continue;
    const size = 2 + hash(i, 89) % 6;
    const heat = Math.sin(TAU * turn + i * 1.8);
    ellipse(pixels, cx, cy, size, 2, 2);
    ellipse(pixels, cx - 1, cy - 1, Math.max(1, size - 2), 1, heat > 0.6 ? 7 : 8);
  }
}

function logs(pixels) {
  for (const [x1, y1, x2, y2] of [[108, 159, 188, 156], [136, 154, 205, 165]]) {
    const radius = 5;
    for (let x = x1; x < x2; x++) {
      const middle = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
      for (let edge = -radius; edge <= radius; edge++) {
        const grain = hash(x >> 2, edge);
        let color = edge < -2 ? 8 : edge > 1 || grain < 100 ? 11 : 9;
        if (x > 142 && x < 179 && edge < 2 && grain < 90) color = 2;
        pixels[(Math.round(middle) + edge) * WIDTH + x] = color;
      }
    }
    ellipse(pixels, x1, y1, 5, radius, 9);
    ellipse(pixels, x2, y2, 7, radius, 8);
    ellipse(pixels, x2, y2, 5, radius - 1, 9);
    ellipse(pixels, x2 - 1, y2 - 1, 3, 2, 8);
    ellipse(pixels, x2 - 1, y2 - 1, 1, 1, 9);
  }
}

const tongues = [
  [120, 39, 12, 0.3], [132, 57, 14, 1.6], [147, 75, 16, 3.5],
  [158, 76, 19, 0.2], [171, 63, 14, 4.2], [185, 52, 13, 2.1], [197, 36, 10, 5.2]
];

function flames(pixels, turn, firstY) {
  const phase = turn * TAU;
  for (let y = firstY; y <= BASE; y++) {
    const h = BASE - y;
    const lobes = tongues.map(([root, size, broad, seed]) => {
      const height = size + 8 * Math.sin(phase + seed) + 4 * Math.sin(phase * 2 + seed);
      const rise = h / height;
      if (rise >= 1) return null;
      const x = root + h * 0.12 + (rise + 0.18) * (8 * Math.sin(phase + h / 10 + seed) +
        5 * Math.sin(h / 19 + seed));
      const span = broad * (1 - rise) ** 0.95 * (0.83 + 0.22 * Math.sin(h / 7 + seed - phase));
      return [x, span];
    }).filter(Boolean);
    for (let x = 99; x < 226; x++) {
      let heat = 0;
      for (const [center, span] of lobes) heat = Math.max(heat, 1 - Math.abs(x - center) / span);
      if (heat <= 0.01 || (h > 23 && heat < 0.18 && Math.sin(phase + h / 6 - x / 7) < -0.75)) continue;
      const detail = (hash(x >> 1, y >> 1) - 128) / 1660;
      const intensity = heat - h / 135 + detail + 0.05 * Math.sin(phase + x / 7 + h / 6);
      pixels[y * WIDTH + x] = intensity > 0.89 && h < 14 ? 1 : intensity > 0.61 ? 7 :
        intensity > 0.22 ? 8 : 2;
    }
  }
}

function fitCell(counts) {
  let best = Infinity;
  let colors;
  for (const candidate of palettes) {
    let error = 0;
    for (let c = 0; c < 16; c++) error += counts[c] * candidate.cost[c];
    if (error < best) {
      best = error;
      colors = candidate.colors;
    }
  }
  return colors;
}

function matchPair(colors, left, right) {
  let best = Infinity, index = 0;
  for (let i = 0; i < colors.length; i++) {
    const error = delta[colors[i]][left] + delta[colors[i]][right];
    if (error < best) {
      best = error;
      index = i;
    }
  }
  return index;
}

function createFirepit(frameCount, logoHeight) {
  const rowStart = logoHeight / 8;
  const sceneRows = HEIGHT / 8 - rowStart;
  const background = landscape();
  stones(background, false);
  const painted = Array.from({ length: frameCount }, (_, frame) => {
    const pixels = background.slice();
    const turn = frame / frameCount;
    coalBed(pixels, turn);
    logs(pixels);
    flames(pixels, turn, logoHeight + 8);
    stones(pixels, true);

    return pixels;
  });
  const frames = painted.map(() => Buffer.alloc(sceneRows * WIDTH));
  const screen = Buffer.alloc(sceneRows * 40);
  const colorRam = Buffer.alloc(screen.length);
  // Both outer rows stay black in either mode while pending raster IRQs
  // switch the VIC. Leave their bitmaps and all four color indices zero.
  for (let row = 1; row < sceneRows - 1; row++) {
    for (let col = 0; col < 40; col++) {
      const counts = new Uint16Array(16);
      const origin = (row + rowStart) * 8 * WIDTH + col * 8;
      for (const pixels of painted) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) counts[pixels[origin + y * WIDTH + x]]++;
        }
      }
      const colors = fitCell(counts);
      screen[row * 40 + col] = colors[1] * 16 + colors[2];
      colorRam[row * 40 + col] = colors[3];
      for (let frame = 0; frame < frameCount; frame++) {
        for (let y = 0; y < 8; y++) {
          let byte = 0;
          for (let x = 0; x < 8; x += 2) {
            const at = origin + y * WIDTH + x;
            const pair = matchPair(colors, painted[frame][at], painted[frame][at + 1]);
            byte |= pair << (6 - x);
          }
          frames[frame][row * WIDTH + col * 8 + y] = byte;
        }
      }
    }
  }
  return { rowStart, screen, colorRam, frames };
}

module.exports = { createFirepit };
