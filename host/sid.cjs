/** Parse a restricted tracker-export PSID at the file boundary, then validate
 * the kit's reserved music region and declared zero page before assembly.
 * Original implementation of the SID format documented by Michael Schwendt,
 * Simon White, Dag Lem, LaLa and Wilfred Bos. See docs/SID.md for the reference.
 * This is not an emulator or a validator of arbitrary player machine code.
 */
function parseSid(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 0x76) throw Error('Truncated SID header');
  if (bytes.toString('ascii', 0, 4) !== 'PSID') throw Error('Only tracker-export PSID files are supported');
  const word = offset => bytes.readUInt16BE(offset);
  const version = word(4), offset = word(6);
  if (![1, 2].includes(version)) throw Error('Only PSID version 1 or 2 is supported');
  if (offset < (version === 1 ? 0x76 : 0x7c) || offset >= bytes.length) throw Error('Invalid SID data offset');
  const flags = version === 1 ? 0 : word(118);
  if (flags & 1) throw Error('External MUS players are unsupported');
  if (flags & 2) throw Error('PlaySID-specific exports are unsupported');
  if (flags & 0xffc0 || version === 2 && (bytes[122] || bytes[123])) throw Error('Reserved or multi-SID fields are unsupported');
  const songs = word(14), startSong = word(16);
  if (songs < 1 || songs > 256 || startSong < 1 || startSong > songs) throw Error('Invalid SID song count or start song');
  let loadAddress = word(8), start = offset;
  if (!loadAddress) {
    if (bytes.length < start + 3) throw Error('Truncated embedded load address or payload');
    loadAddress = bytes.readUInt16LE(start); start += 2;
  }
  const data = Buffer.from(bytes.subarray(start));
  if (loadAddress + data.length > 0x10000) throw Error('SID payload exceeds C64 address space');
  const initAddress = word(10) || loadAddress, playAddress = word(12);
  const contains = address => address >= loadAddress && address < loadAddress + data.length;
  if (!contains(initAddress)) throw Error('SID init address must be inside its payload');
  if (!playAddress || !contains(playAddress)) throw Error('SID play address must be a callable routine inside its payload');
  const text = offset => new TextDecoder('windows-1252').decode(bytes.subarray(offset, offset + 32)).split('\0')[0].trim();
  return { version, loadAddress, initAddress, playAddress, songs, startSong, speed: bytes.readUInt32BE(18), clock: (flags >> 2) & 3, model: (flags >> 4) & 3, name: text(22), author: text(54), released: text(86), data };
}

function prepareSid(sid, config) {
  if (sid.loadAddress < 0xc400 || sid.loadAddress + sid.data.length > 0xd000) throw Error('Export SID payload entirely into $c400..$cfff');
  const subtune = config.DEMO_SID_SUBTUNE ?? sid.startSong;
  if (!Number.isInteger(subtune) || subtune < 1 || subtune > sid.songs) throw Error('SID subtune must be 1..song count');
  const speedBit = sid.version === 1 ? (subtune - 1) & 31 : Math.min(subtune - 1, 31);
  if ((sid.speed >>> speedBit) & 1) throw Error('CIA-timed SID playback is unsupported; export a VBI player');
  const zeroPage = config.DEMO_SID_ZP;
  if (!Array.isArray(zeroPage) || zeroPage.some(n => !Number.isInteger(n) || n < 0x80 || n > 0xef) || new Set(zeroPage).size !== zeroPage.length) throw Error('Declare SID zero-page bytes once each within $80..$ef, or [] for none');
  const clocks = { pal: 1, ntsc: 2, both: 3 };
  const declaredClock = config.DEMO_SID_CLOCK;
  if (declaredClock !== undefined && !Object.hasOwn(clocks, declaredClock)) throw Error('SID clock must be pal, ntsc or both');
  const clock = declaredClock === undefined ? sid.clock : clocks[declaredClock];
  if (!clock || sid.clock && (clock & sid.clock) !== clock) throw Error('Declare an unknown SID clock; do not broaden its header clock support');
  for (const key of ['DEMO_SID_CREDIT', 'DEMO_SID_LICENSE', 'DEMO_SID_SOURCE']) {
    if (typeof config[key] !== 'string' || !config[key].trim()) throw Error(`Missing ${key} for release credits`);
  }
  const { data, ...metadata } = sid;
  return { ...metadata, data, clock, subtune, zeroPage, credit: config.DEMO_SID_CREDIT, license: config.DEMO_SID_LICENSE, source: config.DEMO_SID_SOURCE };
}

function sidConstants(sid) {
  if (!sid) return 'DEMO_EXTERNAL_SID = 0\n';
  return `DEMO_EXTERNAL_SID = 1\nSID_LOAD = ${sid.loadAddress}\nSID_INIT = ${sid.initAddress}\nSID_PLAY = ${sid.playAddress}\nSID_SONG = ${sid.subtune - 1}\nSID_CLOCK = ${sid.clock}\n`;
}

module.exports = { parseSid, prepareSid, sidConstants };
