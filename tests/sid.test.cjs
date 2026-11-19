// Exercise real file boundaries and the kit's memory contract before a SID
// payload is emitted. The synthetic file is original test data, not a ripped tune.
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSid, prepareSid } = require('../host/sid.cjs');

function sidFile({ version = 2, load = 0xc400, embedded = false, songs = 2, flags = 0x34 } = {}) {
  const header = Buffer.alloc(version === 1 ? 0x76 : 0x7c);
  header.write('PSID'); header.writeUInt16BE(version, 4);
  header.writeUInt16BE(header.length, 6); header.writeUInt16BE(embedded ? 0 : load, 8);
  header.writeUInt16BE(load, 10); header.writeUInt16BE(load + 1, 12);
  header.writeUInt16BE(songs, 14); header.writeUInt16BE(2, 16);
  header.write('Original fixture', 22); header.write('Kit contributors', 54);
  if (version > 1) header.writeUInt16BE(flags, 118);
  const prefix = embedded ? Buffer.from([load & 255, load >> 8]) : Buffer.alloc(0);
  return Buffer.concat([header, prefix, Buffer.from([0x60, 0x60, 1, 2])]);
}

const profile = { DEMO_SID_ZP: [128, 129], DEMO_SID_CREDIT: 'Kit contributors', DEMO_SID_LICENSE: 'Original test fixture', DEMO_SID_SOURCE: 'tests/sid.test.cjs' };

test('PSID fields preserve composer metadata, subtune and payload byte order', () => {
  for (const embedded of [false, true]) {
    const sid = parseSid(sidFile({ embedded }));
    assert.equal(sid.loadAddress, 0xc400); assert.equal(sid.playAddress, 0xc401);
    assert.equal(sid.author, 'Kit contributors'); assert.equal(sid.startSong, 2);
    assert.deepEqual([...sid.data], [0x60, 0x60, 1, 2]);
    assert.equal(prepareSid(sid, profile).subtune, 2);
  }
});

test('unsupported and malformed SID containers fail before code generation', () => {
  const cases = [
    [Buffer.alloc(10), /header/],
    [Buffer.from('RSID' + ' '.repeat(120)), /PSID/],
  ];
  const change = (offset, value, size = 2) => { const b = sidFile(); size === 4 ? b.writeUInt32BE(value, offset) : b.writeUInt16BE(value, offset); return b; };
  cases.push([change(4, 3), /version/], [change(6, 0x200), /offset/], [change(6, 0x76), /offset/],
    [change(14, 0), /song/], [change(16, 3), /song/], [change(10, 0x1000), /init/],
    [change(12, 0), /play/], [change(118, 1), /MUS/], [change(118, 2), /PlaySID/]);
  for (const [bytes, error] of cases) assert.throws(() => parseSid(bytes), error);
  assert.throws(() => prepareSid(parseSid(change(18, 2, 4)), profile), /CIA/);
});

test('payload, declared zero page, clock and credits must fit this engine', () => {
  assert.throws(() => prepareSid(parseSid(sidFile({ load: 0x2000 })), profile), /c400/i);
  const huge = Buffer.concat([sidFile(), Buffer.alloc(0x1000)]);
  assert.throws(() => prepareSid(parseSid(huge), profile), /cfff/i);
  for (const zp of [undefined, [2], [0xfb], [256], [128, 128]]) {
    assert.throws(() => prepareSid(parseSid(sidFile()), { ...profile, DEMO_SID_ZP: zp }), /zero.page/i);
  }
  assert.throws(() => prepareSid(parseSid(sidFile({ flags: 0 })), profile), /clock/i);
  const pal = parseSid(sidFile());
  assert.throws(() => prepareSid(pal, { ...profile, DEMO_SID_CLOCK: 'both' }), /clock/i);
  assert.throws(() => prepareSid(pal, { ...profile, DEMO_SID_SUBTUNE: 3 }), /subtune/i);
  for (const key of ['DEMO_SID_CREDIT', 'DEMO_SID_LICENSE', 'DEMO_SID_SOURCE']) {
    assert.throws(() => prepareSid(pal, { ...profile, [key]: '' }), /credit|license|source/i);
  }
});

test('v1 needs an explicit clock and uses the selected subtune speed bit', () => {
  const bytes = sidFile({ version: 1, songs: 40 });
  bytes.writeUInt32BE(1, 18);
  const sid = parseSid(bytes);
  assert.equal(prepareSid(sid, { ...profile, DEMO_SID_CLOCK: 'ntsc', DEMO_SID_SUBTUNE: 2 }).clock, 2);
  assert.throws(() => prepareSid(sid, { ...profile, DEMO_SID_CLOCK: 'pal', DEMO_SID_SUBTUNE: 33 }), /CIA/);
});
