# Use tracker-exported SID music

The default TORQ application uses the original Clockwork export. Its
`DEMO_SID_BUILD = "clockwork"` setting assembles that source during `node build.cjs`;
no pre-existing generated SID is needed. Omit this setting when importing a
different player. It only accepts the kit's Clockwork generator and its fixed
`generated/clockwork.sid` output.

The bitmap builder accepts an optional PSID v1/v2 export with callable init/play
routines and VBI timing. Export the player and song into `$c400..$cfff`, then
declare every zero-page byte used by that export. Only `$80..$ef` is available
to an imported player. An export using no zero page declares an empty list.

Build the original included example:

```console
node tools/build-example-music.cjs
node build.cjs --entry sid-demo.asm --out build/sid
```

Load `build/sid/sid-example.prg` or its D64. The example's original composition
and player are by the C64 demo kit contributors and released under CC0 1.0.
[Source and grant](../examples/music/README.md) are included. The player supports
PAL and NTSC pitch tables and a nominal 50 Hz musical clock.

## Configure another export

Copy `demo.asm` to another file in the repository root and add these constants:

```asm
DEMO_SID_FILE = "assets/my-song.sid"
DEMO_SID_ZP = [128,129,130,131]
DEMO_SID_SUBTUNE = 1
DEMO_SID_CREDIT = "Composition: AUTHOR; player: PLAYER AUTHOR"
DEMO_SID_LICENSE = "LICENSE OR EXPORT PERMISSION; path to preserved notices"
DEMO_SID_SOURCE = "ORIGINAL SOURCE URL AND REVISION"
```

Use the zero-page allocation actually selected in your tracker or player
exporter. An arbitrary declaration cannot make incompatible code compatible.
Omit `DEMO_SID_SUBTUNE` to use the header's default song. If the header clock is
unknown, set `DEMO_SID_CLOCK` to `"pal"`, `"ntsc"` or `"both"` based on the
player's actual support. An override may narrow a known header's support; it
cannot broaden it. `DEMO_LEAD`, `DEMO_BASS` and `DEMO_ARP` are unnecessary when
an external SID is configured. The exported player owns its volume and tempo;
the built-in sequencer's corresponding constants do not override it.

Build the application with the usual `node build.cjs --entry my-demo.asm`.
The release directory receives `<DEMO_NAME>-music-credits.json`. It preserves
the SID's title, composer, release string, addresses, model, clock, subtune and
the additional source, license and credit declarations. Distribute the relevant
original notices alongside the release. The container metadata is attribution
information, not evidence of permission to reuse a tune.

## Supported player contract

| Property | Requirement |
| --- | --- |
| Container | PSID v1 or v2 with a nonempty payload and valid header/song fields |
| Load range | Entire payload, including mutable state, is within `$c400..$cfff` |
| Init | Address inside the payload, or header zero selecting its load address; A receives subtune minus one, X/Y are zero |
| Play | Nonzero address inside the payload; returns with RTS |
| Timing | VBI, once per native refresh on a supported machine clock |
| Zero page | All used bytes explicitly declared once each in `$80..$ef` |
| Hardware | SID at `$d400`; no independent IRQ/NMI, CIA timer or VIC ownership |
| Memory | Player code/data stay in its payload or declared zero page; it may read `$02a6` for PAL/NTSC selection |
| Calls | Bounded execution, balanced stack, decimal behavior confined to the call, and interrupts remain disabled inside the player |

The adapter writes the PSID mapping `$01=$36` for these entry addresses and
restores the caller's mapping and flags afterward. The engine's IRQ still owns
register saving, graphics, input and the ticker. The reserved music region is
outside the patch streams and both screen matrices. The host and assembler
check its bounds independently. The host cannot prove what arbitrary 6510 code
writes or how long it runs; use a compatible tracker export and verify it.

A header supporting only PAL stays silent on NTSC and vice versa. RAM symbol
`music_supported`, at `$21`, is 1 after a compatible init and 0 for a mismatch.
The adapter does not retune a player or substitute CIA timing. RSID, MUS,
PlaySID-specific samples, multi-SID and CIA-timed exports are rejected. Players
that install their own IRQ or call OS routines using undeclared memory are
outside this contract.

M sets volume to zero and pauses imported play calls. Unmuting initializes the
selected subtune again, which restores the player's own SID/filter state and
restarts the song. The original built-in sequencer retains its existing mute
behavior. Avoid volume-register sample players, which need a different adapter.

## Verification and source attribution

```console
node --test tests/sid.test.cjs
node tests/verify-sid.cjs
```

The integration test requires 64tass, VICE `x64sc` and, on headless Linux,
`xvfb-run`. Set `TASS64` and optionally `VICE_BIN` for local tools. It builds the
original example and checks actual VICE execution on PAL and NTSC: one play
call per refresh, pitch-register writes from the correct table, restored memory
mapping, pause/restart and silence on a declared clock mismatch. Results and
screenshots go to `build/validation/`. It restores the default build afterward.
This does not establish analog audio quality or compatibility with every tracker.

The parser and adapter are original implementations of the
[SID format specification](https://github.com/libsidplayfp/readSID/blob/main/SID_file_format.txt).
Format credit belongs to Michael Schwendt, Simon White, Dag Lem, LaLa and
Wilfred Bos. The kit's tracker-integration research also records
[Magnar Harestad](../research/SOURCES.md#magsid),
[Mihaly Horvath/Hermit and Soci](../research/SOURCES.md#sid-wizard),
[the SID Factory II team](../research/SOURCES.md#sid-factory-2),
[Lasse Öörni](../research/SOURCES.md#goattracker2) and
[Linus Åkesson](../research/SOURCES.md#sidreloc). Their player code and
compositions are not copied into this adapter or the original example tune.
