// Paint a campfire in VIC colors. Each multicolor cell has three fixed local
// colors plus black. Coloring the whole loop at once keeps the palette stable
// while standard bitmap patches change the pixels.
const WIDTH = 320;
const HEIGHT = 184;
const BASE = 160;
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

function trees(pixels, horizon) {
  // Two depth layers frame an open clearing, leaving the center dark enough
  // for narrow tongues and sparks to read against the sky.
  for (const [color, offset] of [[6, 0], [11, 9]]) {
    for (let i = 0; i < 23; i++) {
      const cx = 4 + i * 14 + offset;
      const gap = Math.abs(cx - 160);
      if (gap < 64 || cx >= WIDTH) continue;
      const bottom = horizon + (hash(i, offset) % 9);
      const top = bottom - 25 - (hash(i, 47 + offset) % 39);
      for (let y = top; y < bottom; y++) {
        if (y < 0) continue;
        const depth = (y - top) / (bottom - top);
        const tier = (y - top) % 12;
        const half = Math.floor(1 + depth * 11 + tier * 0.48);
        for (let x = Math.max(0, cx - half); x <= Math.min(WIDTH - 1, cx + half); x++) {
          if ((((x >> 1) + y * 3) & 7) < (color === 6 ? 2 : 3)) pixels[y * WIDTH + x] = color;
        }
      }
    }
  }
}

function landscape() {
  const pixels = new Uint8Array(WIDTH * HEIGHT);
  for (let y = 72; y < 136; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (Math.abs(x - 160) > 40 && hash(x, y) === 231 && hash(y, x + 90) < 96) {
        pixels[y * WIDTH + x] = hash(x + 28, y) < 58 ? 15 : 6;
      }
    }
  }
  trees(pixels, 143);
  for (let y = 145; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const glow = ((x - 160) / 112) ** 2 + ((y - 167) / 22) ** 2;
      const noise = hash(x >> 1, y);
      if (glow < 1 && noise < 118 * (1 - glow)) pixels[y * WIDTH + x] = noise < 22 ? 8 : 9;
      else if (noise < 25 + (y - 145)) pixels[y * WIDTH + x] = 11;
    }
  }
  return pixels;
}

function stones(pixels, front) {
  for (let i = 0; i < 16; i++) {
    const angle = TAU * (i + 0.3) / 16;
    if ((Math.sin(angle) > 0) !== front) continue;
    const cx = Math.round(160 + 76 * Math.cos(angle));
    const cy = Math.round(157 + 12 * Math.sin(angle));
    const wide = 8 + hash(i, 31) % 5;
    const tall = 4 + hash(i, 61) % 3;
    for (let y = cy - tall; y <= cy + tall; y++) {
      for (let x = cx - wide; x <= cx + wide; x++) {
        const vertical = (y - cy) / tall;
        const side = (x - cx) / wide;
        if (Math.abs(side) + 0.52 * Math.abs(vertical) > 1.16 + (hash(x, y) & 7) / 90 ||
            Math.abs(vertical) > 1) continue;
        const grain = hash(x, y);
        const lit = front ? vertical < -0.25 : vertical > -0.05;
        let color = y > cy + 2 ? 11 : 12;
        if (lit) color = Math.abs(x - 160) < 45 && grain < 156 ? 8 : 15;
        if (grain < 22) color = 11;
        pixels[y * WIDTH + x] = color;
      }
    }
  }
}

function coalBed(pixels) {
  ellipse(pixels, 160, 164, 64, 11, 9);
  for (let y = 154; y <= 174; y++) {
    for (let x = 99; x < 222; x++) {
      if (((x - 160) / 61) ** 2 + ((y - 164) / 11) ** 2 > 1) continue;
      const coal = hash(x, y);
      if (coal < 172) pixels[y * WIDTH + x] = coal < 33 ? 7 : coal < 96 ? 8 : 2;
    }
  }
}

function logs(pixels) {
  for (const [x1, y1, x2, y2] of [[118, 164, 197, 155], [128, 154, 199, 169]]) {
    for (let x = x1 - 3; x <= x2 + 3; x++) {
      const mid = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
      for (let y = Math.ceil(mid - 4); y <= mid + 4; y++) {
        const edge = y - mid;
        const grain = hash(x, y);
        let color = edge < -2 && grain > 110 ? 8 : edge > 2 ? 11 : 9;
        if (grain < 31 && x > 143 && x < 176) color = 2;
        if (x < x1 + 4 || x > x2 - 4) color = edge > 1 ? 9 : 8;
        pixels[y * WIDTH + x] = color;
      }
    }
    ellipse(pixels, x2, y2, 3, 4, 8);
    ellipse(pixels, x2, y2 + 1, 2, 2, 9);
  }
}

const tongues = [
  [119, 42, 12, 0.3], [132, 62, 16, 1.6], [147, 75, 16, 3.5],
  [158, 82, 19, 0.2], [171, 69, 16, 4.2], [185, 59, 14, 2.1], [198, 39, 11, 5.2]
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
      const detail = (hash(x, y) - 128) / 680;
      const intensity = heat - h / 135 + detail + 0.05 * Math.sin(phase + x / 7 + h / 6);
      pixels[y * WIDTH + x] = intensity > 0.87 ? 1 : intensity > 0.47 ? 7 :
        intensity > 0.16 ? 8 : 2;
    }
  }
}

function sparks(pixels, turn, firstY) {
  for (let i = 0; i < 29; i++) {
    const age = (turn + hash(i, 83) / 256) % 1;
    const y = Math.floor(146 - (38 + hash(i, 53) % 35) * age);
    if (y < firstY || age > 0.89 || (age > 0.55 && hash(i + Math.floor(turn * 16), 72) < 64)) continue;
    const x = Math.round(112 + hash(i, 21) % 89 + age * 31 + 4 * Math.sin(age * TAU + i));
    const color = age < 0.31 ? 7 : age < 0.63 ? 8 : 2;
    pixels[y * WIDTH + x] = color;
    if (age < 0.45) pixels[y * WIDTH + x + 1] = color;
    if (age < 0.37 && (i % 3 === 0)) pixels[(y + 1) * WIDTH + x - 1] = 8;
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
  coalBed(background);
  const painted = Array.from({ length: frameCount }, (_, frame) => {
    const pixels = background.slice();
    for (let y = 156; y <= 173; y++) {
      for (let x = 108; x < 212; x++) {
        const ember = hash(x, y);
        if (ember < 9 && ((x - 160) / 55) ** 2 + ((y - 165) / 10) ** 2 < 1) {
          pixels[y * WIDTH + x] = Math.sin(TAU * frame / frameCount + ember) > 0 ? 7 : 2;
        }
      }
    }
    logs(pixels);
    flames(pixels, frame / frameCount, logoHeight + 8);
    sparks(pixels, frame / frameCount, logoHeight + 8);
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
