# File catalog

Every project source file explains its algorithm and decisions in its header.
This catalog also covers data files that cannot hold comments and upstream files
that are intentionally left unchanged. See [the design guide](ALGORITHMS.md) for
worked examples and limitations. Generated/local outputs are listed separately
at the end of that guide, because they are not versioned source.

## Application and build

| File | Algorithm, role and reason |
| --- | --- |
| [build.bat](../build.bat) | Directory-safe Windows launcher that propagates the builder exit status and pauses on failure. |
| [run.sh](../run.sh) | Detect macOS/Linux, install missing dependencies, supply missing Ubuntu ROMs, build and launch VICE; supports offline/build-only operation. |
| [run.ps1](../run.ps1) | Reuse installed Windows tools or verify/extract portable Node/VICE archives, build from the script directory and launch. |
| [run.bat](../run.bat) | Forward arguments to the PowerShell launcher with process-local execution policy and propagate errors. |
| [build.cjs](../build.cjs) | Deterministic asset/assembly/disk pipeline with capacity checks; keeps expensive math on the host. |
| [demo.asm](../demo.asm) | Single application configuration and asset composition. Literal settings are shared by host and assembler; executable routines remain reusable. |
| [tools/convert-image.ps1](../tools/convert-image.ps1) | Two-pass nearest-neighbor sampling and alpha/luminance thresholding into VIC-II bitmap order. |

## Runtime assembly libraries

| File | Algorithm, role and reason |
| --- | --- |
| [lib/assets.asm](../lib/assets.asm) | Emit initial/continuation pointers, place low/high streams and static bitmap data, and reject code/data/screen overlap independently of the host allocator. |
| [lib/bitmap.asm](../lib/bitmap.asm) | Decode skip/literal/fill runs into the hidden bitmap and resume split streams while preserving destination progress. |
| [lib/boot.asm](../lib/boot.asm) | Algorithm: emit BASIC SYS2064, take over hardware, clear state, initialize both bitmap/color buffers, measure raster length, install vectors, enable IRQ. Why: the BASIC stub loads normally from disk; ROMs are mapped out so the |
| [lib/colors.asm](../lib/colors.asm) | Algorithm: update 40 screen-color bytes for one body row in both VIC banks. Use the base color for mode 1, row bands for 2/3, or original color fields for 4..6. After all 23 rows, wrap the row and advance the palette phase. |
| [lib/display.asm](../lib/display.asm) | Algorithm: main-thread flip sets a request and waits. The raster ISR calls flip_border when the deadline is due, selects the other VIC bank/screen, records the tick and clears the request to release the waiting main thread. |
| [lib/effects.asm](../lib/effects.asm) | Algorithm: atomically consume the pending mode, then set effect and request animation start or stop only if the current active state needs to change. Why: keyboard scanning reports intent; this main-thread controller decides |
| [lib/engine.asm](../lib/engine.asm) | Algorithm: assemble the runtime modules in a fixed order, then emit the palette and the 23 body-row screen-address words needed by the color updater. Why: source includes add no linking/runtime overhead and preserve layout. |
| [lib/keyboard.asm](../lib/keyboard.asm) | Algorithm: select CIA keyboard rows and interpret active-low matrix bits. Track prior Space/M/number states so a held key causes one action per edge. Space toggles a one-bit request; number keys store a mode request; M changes |
| [lib/player.asm](../lib/player.asm) | Algorithm: state machine for idle, two-buffer warm-up, steady playback and static restoration. Render the hidden buffer, request its scheduled flip, advance phase with a power-of-two mask, and add period to the prior deadline. |
| [lib/raster.asm](../lib/raster.asm) | Algorithm: save A/X/Y, advance ticks, scan keys, service due flips, update one color band, then use an accumulator to schedule approximately 50 logic ticks per second on nominal 50/60 Hz displays. Every other logic tick scrolls text. |
| [lib/scroller.asm](../lib/scroller.asm) | Algorithm: fetch a null-terminated text byte, map it with AND 63, load its eight glyph rows and feed one most-significant glyph bit into each row shift. Propagate carry right-to-left through 40 bitmap cells with ROL, then mirror |
| [lib/sid.asm](../lib/sid.asm) | Algorithm: initialize SID presets, advance a note-duration counter at the logic rate, read three PAL/NTSC frequency pairs, write pitch and assert gates. Clear gates one logic tick before the next note; wrap the step with an AND mask. |
| [lib/state.asm](../lib/state.asm) | Algorithm: assign a shared zero-page ABI; this file emits no runtime bytes. Why: zero-page accesses and indirect pointers keep the 6510 decoder small and fast. Explicit addresses also make memory ownership inspectable in VICE. |

## Host libraries and tests

| File | Algorithm, role and reason |
| --- | --- |
| [host/bitmap.cjs](../host/bitmap.cjs) | Algorithm: map pixels to VIC cell order, nearest-neighbor-fit a 320x200 source into the logo area, stamp 8x8 HUD glyphs, then shift each logo row by round(amplitude * sin(2*pi*y/wavelength + 2*pi*phase/frameCount)). |
| [host/config.cjs](../host/config.cjs) | Algorithm: recognize literal DEMO_* assignments with a constrained regex, translate assembler hexadecimal numerals outside strings, then JSON-decode. Validate byte ranges, font text, equal voice lengths, and power-of-two masks. |
| [host/d64.cjs](../host/d64.cjs) | Algorithm: allocate a 35-track image, initialize BAM/free bits and directory, reserve track 18 metadata, select data sectors with ten-sector interleave, link 254-byte PRG chunks, and emit one closed PRG entry and its block count. |
| [host/music.cjs](../host/music.cjs) | Algorithm: MIDI -> Hz via 440 * 2^((note-69)/12), then round(Hz*2^24/clock). Emit low/high-byte tables for each of three voices at PAL and NTSC SID clocks. Why: SID phase accumulators use integer frequency words; host-side math keeps |
| [host/patches.cjs](../host/patches.cjs) | Balance skip/literal/fill bytecode size, written bytes and command count; verify warm-up, two-buffer transitions and universal restoration. |
| [tests/emulator.cjs](../tests/emulator.cjs) | Validation algorithm: drive a running VICE remote monitor over TCP, load the PRG, break at renderer/flip boundaries, dump bitmap memory and compare against host frames. Measure decoder cycles and tick spacing; test restore/restart, |
| [tests/libraries.test.cjs](../tests/libraries.test.cjs) | Validation algorithm: exercise skip/literal boundaries and erasure, simulate four-frame double buffering, then independently walk D64 chains and count BAM free bits at several payload lengths, including exact 254-byte boundaries. |
| [tests/rebuild-variant.cjs](../tests/rebuild-variant.cjs) | Validation algorithm: draw a synthetic ring/diamond image, derive a temporary application with different text, volume and four frames, then invoke the same builder and assembler. Finally remove the fixture and rebuild the default. |

## Documentation and policy

The [launcher guide](LAUNCHERS.md) records environment commands, setup sources,
cache behavior and verification limits. [Launcher tests](../tests/launchers.test.cjs)
exercise isolated shell/PowerShell behavior without installing system packages.

| File | Algorithm, role and reason |
| --- | --- |
| [.gitignore](../.gitignore) | Artifact policy: omit generated/local outputs, retain selected working snapshots under dist/. No executable algorithm. |
| [assets/README.md](../assets/README.md) | Raw bitmap/font byte layouts and why source PNGs are preserved separately. |
| [dist/README.md](../dist/README.md) | Meaning and validation limits of committed demo snapshots. |
| [docs/ALGORITHMS.md](../docs/ALGORITHMS.md) | Per-file algorithms, rationale, examples, cross-file formats and implementation limits. |
| [docs/FILES.md](../docs/FILES.md) | Complete versioned-file inventory, including data and unchanged vendor material. |
| [README.md](../README.md) | Usage, configuration and calling/memory contracts; orientation rather than executable code. |
| [tools/README.md](../tools/README.md) | Converter decisions and the boundary between project code and bundled upstream tools. |

## Binary assets and distribution snapshots

| File | Algorithm, role and reason |
| --- | --- |
| [assets/font.bin](../assets/font.bin) | 64 eight-row glyphs; shared encoding for fixed HUD drawing and the one-pixel runtime ticker. |
| [assets/image.bin](../assets/image.bin) | 8000-byte, one-bit VIC-II cell-order source canvas; consumed by the host fitter and wave generator. |
| [assets/reference/logo-blue.png](../assets/reference/logo-blue.png) | Recolored artwork reference suitable for the converter, not an automatic build input. |
| [assets/reference/logo-white.png](../assets/reference/logo-white.png) | Original artwork reference, not an automatic build input. |
| [dist/preview.png](../dist/preview.png) | Captured emulator frame; evidence of one visual state, not animation/audio validation. |
| [dist/torqxsendero-c64.d64](../dist/torqxsendero-c64.d64) | Single-PRG disk snapshot with BAM, directory, linked sectors and ten-sector interleave. |
| [dist/torqxsendero-c64.prg](../dist/torqxsendero-c64.prg) | Assembled native demo with load address, code and generated data; no source algorithm is editable here. |
| [dist/validation/test-ntsc.json](../dist/validation/test-ntsc.json) | Recorded NTSC frame/cycle samples and integration-check results; does not execute tests. |
| [dist/validation/test-pal.json](../dist/validation/test-pal.json) | Recorded PAL frame/cycle samples and integration-check results; does not execute tests. |

## Default TORQ integration

| File | Algorithm, role and reason |
| --- | --- |
| [host/color-fields.cjs](../host/color-fields.cjs) | Generate sine/inverse-radius/angle tables and mathematical 40-cell logo rows for native comparisons. |
| [lib/color-fields.asm](../lib/color-fields.asm) | Render one plasma/XOR/polar foreground row in both screen matrices using byte math and patched indexed stores. |
| [lib/show.asm](../lib/show.asm) | Request enabled modes every 400 logic updates through the existing animation controller. |
| [assets/torq-credits.txt](../assets/torq-credits.txt) | Release attribution for the original kit/music, PSID format and research references. |
| [tests/color-fields.test.cjs](../tests/color-fields.test.cjs) | Check color bounds, animation, wrapping and invalid optional application settings. |
| [tests/verify-torq.cjs](../tests/verify-torq.cjs) | Regenerate default music, verify automatic/manual presentation and run complete bitmap checks on isolated PAL/NTSC emulators. |
| [docs/TORQ.md](TORQ.md) | Controls, optional configuration, memory/IRQ contracts, attribution and verification. |

The default builder emits `generated/effects-config.inc` and
`generated/color-fields.bin` alongside its bitmap assets. Build output also
contains the application `-credits.txt` and `-music-credits.json` notices.

## SID export integration

| File | Algorithm, role and reason |
| --- | --- |
| [host/sid.cjs](../host/sid.cjs) | Parse big-endian PSID headers and optional little-endian load prefixes; validate the payload, clock, selected speed bit, declared zero page and release credits before emission. |
| [lib/sid-player.asm](../lib/sid-player.asm) | Call a compatible exported init/play routine with the specified bank mapping, preserve mapping/flags and skip calls while muted or on the wrong machine clock. |
| [sid-demo.asm](../sid-demo.asm) | Compose the existing bitmap engine with an original PSID export and its attribution declarations. |
| [examples/music/clockwork.asm](../examples/music/clockwork.asm) | Original three-voice sequencer, pitch-table selection and 50 Hz accumulator; state stays inside its payload. |
| [examples/music/README.md](../examples/music/README.md) | Original example attribution and CC0 grant. |
| [tools/build-example-music.cjs](../tools/build-example-music.cjs) | Assemble the original player and wrap raw bytes in a PSID header with creator, clock and model fields. |
| [tests/sid.test.cjs](../tests/sid.test.cjs) | Check malformed containers, load-prefix byte order, timing, address limits, zero page and attribution at the host boundary. |
| [tests/vice.cjs](../tests/vice.cjs) | Launch an isolated emulator and serialize remote-monitor commands and raw memory dumps, with process cleanup. |
| [tests/verify-sid.cjs](../tests/verify-sid.cjs) | Execute the imported player on PAL/NTSC and compare VBI calls, pitch writes, memory banking, pause/restart and clock mismatch behavior. |
| [docs/SID.md](SID.md) | Export configuration, supported player contract and format-author attribution. |

## Character-effect integration

| File | Algorithm, role and reason |
| --- | --- |
| [effects-demo.asm](../effects-demo.asm) | Character-scene application constants, generated asset placement and independent overlap assertions. |
| [host/character.cjs](../host/character.cjs) | Generate ordered-density glyphs, text slots, sine/polar maps and initial screen/color data; expose the visible mathematical frame for verification. |
| [lib/character-scene.asm](../lib/character-scene.asm) | Own character-mode hardware, schedule two rendering halves and flip complete buffers only in the border IRQ; compose input, music and text scrolling. |
| [lib/character-effects.asm](../lib/character-effects.asm) | Render original sine-sum, XOR and polar texture loops into the hidden bank using prepared waves and patched indexed operands. |
| [lib/charset.asm](../lib/charset.asm) | Adapt c64lib's four-page fill and compact left-shift loops to 64tass, preserving Maciej Małecki's credit and MIT notice. |
| [tools/build-effects.cjs](../tools/build-effects.cjs) | Read literal scene constants, generate data, validate an exported player, assemble/package PRG/D64 and emit full code/music credits. |
| [tests/character.test.cjs](../tests/character.test.cjs) | Validate glyph density, font placement, cell ranges, phase wrapping and malformed assets. |
| [tests/verify-effects.cjs](../tests/verify-effects.cjs) | Compare actual displayed PAL/NTSC cells with the mathematical frames; check banks, two-refresh flips, scroller, pause/music and an alternate configuration. |
| [docs/CHARACTER.md](CHARACTER.md) | Character builder, equations, calling/memory contract, attribution and verification limits. |

## Collected source archive

The [research collection guide](../research/README.md) describes the survey and
its limits. [catalog.json](../research/catalog.json) records every archived file
by original path, author/source entry, revision, URL and SHA-256 value.
[SOURCES.md](../research/SOURCES.md) and [CREDITS.md](../research/CREDITS.md) are
generated views of that manifest. [ADAPTATION.md](../research/ADAPTATION.md)
records candidate additions and their integration requirements.

All files under `research/upstream/` are unmodified original source subsets,
not runtime build inputs. Their original headers and license files take the
place of this project's algorithm/rationale headers. The manifest is the
per-file catalog for these sources, articles and instrument exports.

`tools/research.cjs` searches that data, checks provenance/hash records and
generates the two indexes. `tests/research.test.cjs` verifies that modified
source, missing attribution/licenses and lost commit pins are rejected.

## Unchanged 64tass distribution files

| File | Algorithm, role and reason |
| --- | --- |
| [tools/64tass/64tass.exe](../tools/64tass/64tass.exe) | Unmodified upstream multi-pass assembler executable; host-only, not linked into the C64 runtime. |
| [tools/64tass/examples/45gs02-compatibility.asm](../tools/64tass/examples/45gs02-compatibility.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/ctm7-display.asm](../tools/64tass/examples/ctm7-display.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/ctm7.asm](../tools/64tass/examples/ctm7.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/loading_a_kla_file.asm](../tools/64tass/examples/loading_a_kla_file.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/loading_a_sid_file.asm](../tools/64tass/examples/loading_a_sid_file.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/patching_relocation_at_source.asm](../tools/64tass/examples/patching_relocation_at_source.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/runtime_relocation.asm](../tools/64tass/examples/runtime_relocation.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/examples/shuffling.asm](../tools/64tass/examples/shuffling.asm) | Upstream assembler example; its algorithm/comments belong to the original distribution. Not included in the demo. |
| [tools/64tass/LICENSE-GPL-2.0](../tools/64tass/LICENSE-GPL-2.0) | Unmodified upstream license/component notice; no executable algorithm. |
| [tools/64tass/LICENSE-LGPL-2.0](../tools/64tass/LICENSE-LGPL-2.0) | Unmodified upstream license/component notice; no executable algorithm. |
| [tools/64tass/LICENSE-LGPL-2.1](../tools/64tass/LICENSE-LGPL-2.1) | Unmodified upstream license/component notice; no executable algorithm. |
| [tools/64tass/LICENSE-my_getopt](../tools/64tass/LICENSE-my_getopt) | Unmodified upstream license/component notice; no executable algorithm. |
| [tools/64tass/manual.pdf](../tools/64tass/manual.pdf) | Upstream assembler documentation; authoritative reference for the bundled tool, not custom demo code. |
| [tools/64tass/NEWS](../tools/64tass/NEWS) | Upstream assembler changelog; no executable algorithm. |
| [tools/64tass/README](../tools/64tass/README) | Upstream assembler documentation; authoritative reference for the bundled tool, not custom demo code. |
| [tools/64tass/README.html](../tools/64tass/README.html) | Upstream assembler documentation; authoritative reference for the bundled tool, not custom demo code. |
| [tools/64tass/README.md](../tools/64tass/README.md) | Upstream assembler documentation; authoritative reference for the bundled tool, not custom demo code. |
| [tools/64tass/syntax/64tass assembler.INI](../tools/64tass/syntax/64tass%20assembler.INI) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/64tass/64tass.sublime-build](../tools/64tass/syntax/64tass/64tass.sublime-build) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/64tass/64tass.tmLanguage](../tools/64tass/syntax/64tass/64tass.tmLanguage) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/assembler.syntax](../tools/64tass/syntax/assembler.syntax) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/crimson editor/64tass-asm.key](../tools/64tass/syntax/crimson%20editor/64tass-asm.key) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/crimson editor/64tass-asm.spc](../tools/64tass/syntax/crimson%20editor/64tass-asm.spc) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/crimson editor/extension.asm](../tools/64tass/syntax/crimson%20editor/extension.asm) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/GtkSourceView-6502_64tass.lang](../tools/64tass/syntax/GtkSourceView-6502_64tass.lang) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/jedit-assembly-64tass.xml](../tools/64tass/syntax/jedit-assembly-64tass.xml) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/katepart-asm6502.xml](../tools/64tass/syntax/katepart-asm6502.xml) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/notepadpp-old-64tass.xml](../tools/64tass/syntax/notepadpp-old-64tass.xml) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/notepadpp-udl2.1-64tass.xml](../tools/64tass/syntax/notepadpp-udl2.1-64tass.xml) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |
| [tools/64tass/syntax/vim/syntax/64tass.vim](../tools/64tass/syntax/vim/syntax/64tass.vim) | Upstream editor syntax/build definition for assembly tokens; not part of the demo or compiler runtime. |

## Frame-capacity work

| File | Algorithm, role and reason |
| --- | --- |
| [host/patch-memory.cjs](../host/patch-memory.cjs) | Pack high/low RAM and split only at command boundaries, with explicit continuation pointers and overlap checks. |
| [tests/patch-memory.test.cjs](../tests/patch-memory.test.cjs) | Check fills, sparse erasures, allocation bounds and exact reconstruction of split streams. |
| [tests/stress-frames.cjs](../tests/stress-frames.cjs) | Interleave five real PAL/NTSC trials for fitting 8/16-phase builds, compare displayed bitmaps and reject overflowing 32 phases. |
| [docs/FRAME_CAPACITY.md](FRAME_CAPACITY.md) | Workload, memory limits, repeatable timing results and phase-count/frame-rate distinction. |
| [dist/validation/frame-stress.json](../dist/validation/frame-stress.json) | Raw repeated-trial samples and summaries; records emulator evidence, not a real-hardware certification. |

## Frame-rate scheduling

| File | Algorithm, role and reason |
| --- | --- |
| [host/timing.cjs](../host/timing.cjs) | Validate target FPS and derive integer periods, fractional remainders and reference cadence. |
| [tests/timing.test.cjs](../tests/timing.test.cjs) | Check prefix timing sums, PAL/NTSC 12 fps intervals, defaults and invalid targets. |
| [tests/stress-fps.cjs](../tests/stress-fps.cjs) | Compare sequential displayed frames across every moving mode, physical IRQ cadence, music, ticker and static restoration. |
| [tests/verify-kernels.cjs](../tests/verify-kernels.cjs) | Exercise native 127/255-byte boundary runs and intentional late-deadline recovery. |
| [tests/verify-fps-soak.cjs](../tests/verify-fps-soak.cjs) | Run 144 nominal seconds of automatic scene changes on each standard and check deadline/audio/ticker clocks. |
| [docs/FPS.md](FPS.md) | Target-FPS behavior, measurements and untested experiment proposals. |

The `dist/validation/fps-*.json` and `copy-kernels-*.json` files record repeated
frame-rate trials, overload probes, soak clocks and native boundary checks.
