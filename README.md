# C64 demo libraries

Reusable 6502/6510 assembly libraries and portable Node.js asset builders.
**`demo.asm`** is the default application; `sid-demo.asm` and `effects-demo.asm`
demonstrate optional music and character scenes. The runtime is native C64 machine code; Node.js
and PowerShell run only on the build computer.

The assembler is **64tass 1.60.3243**, bundled for Windows with its licenses.
No npm packages, VICE installation, network connection, or API key is needed to
build. Node.js must be installed. On another OS set `TASS64` to your 64tass binary.

For implementation explanations, read [Algorithms and design decisions](docs/ALGORITHMS.md).
Each project source file also has an algorithm/rationale header. The
[file catalog](docs/FILES.md) covers binary assets, generated outputs, tests and
unchanged third-party files that cannot use those headers.

The [C64 source collection](research/README.md) gathers demo effects, music tools,
compression, loaders and asset pipelines with author credits, license evidence,
pinned source links and original source snapshots. Its
[adaptation plan](research/ADAPTATION.md) maps useful candidates to this kit.
These are research inputs; they are not included in the default runtime.

[Tracker-exported PSID music](docs/SID.md) is available as an optional player.
The original [Clockwork example](examples/music/README.md) demonstrates this
with PAL/NTSC pitch tables and recorded music credits:

```console
node tools/build-example-music.cjs
node build.cjs --entry sid-demo.asm --out build/sid
```

The [character-effect library and example](docs/CHARACTER.md) add native plasma,
XOR interference and a polar tunnel, with two screen buffers, a scroller,
keyboard controls and music:

```console
node tools/build-example-music.cjs
node tools/build-effects.cjs
```

[Additional ready-to-run examples](dist/examples/README.md) include PRG/D64
files, captured frames, source attribution and PAL/NTSC validation reports.

## Build and run

```console
node build.cjs
```

Or double-click `build.bat`. Outputs are `build/<DEMO_NAME>.prg` and `.d64`.
The disk writer is a reusable JavaScript library, not a wrapper around VICE.
Mount the D64 on an SD2IEC or emulator, then load the filename set by
`DEMO_PRG_NAME`. For the supplied application:

```basic
LOAD"TORQ-LOGO",8,1
RUN
```

Ready-to-run copies are also committed under `dist/`, together with a preview
and the PAL/NTSC validation reports. `assets/reference/` preserves the source
logo PNGs; the builder consumes the converted `assets/image.bin`.

1 selects blue wave, 2 rainbow wave, 3 stationary color cycle, Space starts/stops
the wave, and M toggles music. Reset exits. The default still uses eight frames.

## Change the application in one assembly file

`demo.asm` owns all application-specific text, image/font paths, disk names,
palette, wave geometry, frame count, volume, tempo and the three MIDI-note lists.
It also composes the engine and includes the generated data. No melody or brand
is embedded in `lib/` or `host/`. Binary artwork/font assets remain separate files.

The `DEMO_*` settings are ordinary 64tass constants. The builder reads their
literal strings, integers and lists without executing code. Use uppercase names
and literal values, not computed expressions, for those build settings.
Change `demo.asm` and rebuild; generated files are disposable.

To make another application, copy the kit or save another application `.asm`
beside `demo.asm`, keeping the same includes. Build it with:

```console
node build.cjs --entry my-demo.asm --out build/my-demo
```

Build configurations in one project share `generated/`, so build them sequentially.

## Convert another image

The asset input is a **headerless, 8000-byte, 320x200 one-bit VIC-II bitmap**.
There is no load-address prefix or palette. The bundled Windows converter accepts
PNG, JPEG, BMP and other formats supported by System.Drawing:

```powershell
powershell -NoProfile -File tools/convert-image.ps1 -InputPath "picture.png" -OutputPath "assets/new-image.bin"
```

Set `DEMO_IMAGE = "assets/new-image.bin"` in `demo.asm`, then rebuild.

The converter centers the picture without stretching it. Auto mode uses alpha
for transparent images and luminance for opaque ones. Options are `-Mode Alpha`,
`-Mode Luma`, `-Threshold 64` (0..255), and `-Invert`. For dark artwork on a light
background, use Luma with Invert. This is a monochrome converter, not a multicolor
C64 quantizer. The builder fits the resulting image into the logo area and adds
the fixed controls/ticker rows. Detailed images can exceed memory; the builder
rejects oversized patch data rather than overlapping screen RAM.

## Assembly libraries

These bitmap-engine modules are **source/include libraries with one shared zero-page ABI**. Include
`lib/engine.asm` once after the application constants. They are not independently
linked objects or automatically relocatable modules. Their placement and shared
state are intentional to retain the original performance and exact PRG bytes.

| File | Responsibility / public entry points |
| --- | --- |
| `state.asm` | Named zero-page allocation shared by the modules |
| `boot.asm` | BASIC SYS stub, hardware ownership, buffer initialization, PAL/NTSC detection |
| `player.asm` | `idle`, `next_frame`, `stop_animation`: double-buffer animation scheduling |
| `bitmap.asm` | `render`: decode one sparse patch into the hidden bitmap |
| `display.asm` | `flip`: request a scheduled flip; `flip_border`: IRQ-only buffer switch |
| `raster.asm` | `irq`, `nmi`: raster clock, safe flips, music and ticker scheduling |
| `keyboard.asm` | `poll_keyboard`, `poll_render_keyboard`: atomic input edge detection |
| `effects.asm` | `handle_effect`: standard three-mode controller |
| `colors.asm` | `color_tick`: update one color band per refresh |
| `scroller.asm` | `scroll_tick`: shift text by one pixel in both buffers |
| `sid.asm` | `music_init`, `music_tick`: three-voice note sequencer |
| `assets.asm` | Asset pointer table, bitmap/data placement and overlap assertions |

### Calling and interrupt contract

- `render`: A = patch index. Clobbers A/X/Y, flags, `src`, `dst`, and `count`.
  It does not flip the visible screen. Call from the main thread with IRQ enabled.
- Patch indices 0 and 1 warm up the two buffers from the static image. Indices
  2 through `DEMO_FRAMES+1` are steady transitions; `DEMO_FRAMES+2` restores the
  static image regardless of the last wave phase. The hidden buffer is two phases
  behind; selecting arbitrary frame indices breaks this dependency.
- `flip`: main-thread blocking request. Set `deadline` first. The IRQ switches the
  buffers when the 8-bit raster tick reaches that deadline. Deadlines must remain
  less than 128 refreshes ahead. Never call this blocking routine from the IRQ.
- `poll_keyboard` and `poll_render_keyboard`: clobber A, preserve X/Y and restore
  the caller's interrupt state. The raw `scan_*` routines are internal.
- `music_tick`, `scroll_tick` and `color_tick`: clobber A/X/Y and flags. The IRQ
  wrapper saves/restores A/X/Y and the CPU restores flags through RTI.
- `toggle`, `effect_request` and `muted` are the input/controller interface.
  The standard controller owns key bindings, not the application image.

### Memory and hardware contract

| Range | Use |
| --- | --- |
| `$02..$4f`, `$fb..$fe` | Runtime state and pointers; see `state.asm` |
| `$0400..$07ff` | Primary color/screen matrix |
| `$0801..$1fff` | BASIC stub, code, font, text, music, patch pointers |
| `$2000..$3f3f` | Primary bitmap |
| `$4000..$bfff` | Generated sparse patch streams |
| `$c000..$c3ff` | Secondary color/screen matrix |
| `$e000..$ff3f` | Secondary bitmap, RAM under KERNAL ROM |
| `$fffa..$ffff` | NMI/IRQ vectors |

The engine takes over VIC-II, SID, the raster IRQ, CIA keyboard ports and the
low VIC bank-selection bits. It disables CIA interrupts and maps ROMs out with
`$01=$35`. It is a standalone demo engine, not a BASIC-callable component that
returns to the OS. Preserve the fixed 320x200 hires layout: logo rows 0..22,
controls row 23, ticker row 24. `DEMO_LOGO_HEIGHT` may be reduced within that area.
Frame and song lengths must be powers of two; tune voices have equal lengths.
The palette has eight non-black foreground colors with a black background.

## Build-side libraries

| File | Exports |
| --- | --- |
| `host/config.cjs` | `readConfig(file)` with bitmap validation; `readConstants(file)` for other scene validators |
| `host/bitmap.cjs` | `index`, `fitBitmap`, `drawText`, `waveFrames` |
| `host/patches.cjs` | `encodePatch`, `applyPatch`, `makeDoubleBufferedPatches`, `verifyPatches` |
| `host/music.cjs` | `sidFrequency`, `musicTables` for PAL/NTSC |
| `host/d64.cjs` | `createD64`, `offset`, `sectors` for a standard 35-track, single-PRG disk |
| `host/sid.cjs` | `parseSid`, `prepareSid`, `sidConstants` for the supported tracker-export subset |
| `host/character.cjs` | `characterAssets`, `characterFrame` for character-scene data and its mathematical reference |
| `build.cjs` | `build({entry, outDir, compiler})` or command-line entry point |

After asset generation, the assembly is also usable directly with 64tass:

```console
tools\64tass\64tass.exe --cbm-prg -a -o build\demo.prg demo.asm
```

## Validation

```console
node --test tests/libraries.test.cjs
node tests/rebuild-variant.cjs
```

The second test builds a different image, HUD, ticker, volume and four-frame
application without editing libraries, then restores the default build.
`tests/emulator.cjs pal PORT` (or `ntsc`) runs the default demo's frame, timing,
stop/restart, music and ticker checks against a running VICE remote monitor.
Start VICE with `-console -warp +sound -pal -remotemonitor
-remotemonitoraddress ip4://127.0.0.1:PORT`; use `-ntsc` for the other standard.
The test closes that emulator when finished.

The default refactor was checked against the previous demo's PRG for exact byte
equality. The new D64 writer was independently read back with VICE c1541. Native
SD2IEC/C64 hardware was not available for testing.
